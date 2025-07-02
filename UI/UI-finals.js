// This file handles the UI for the finals stage of the tournament
import Tournaments from '../classes/Tournament.js';
import { displayTournamentOverview } from './UI-tournament.js';
import { checkForIncompleteMatches, checkForWalkoverPlayers, deleteWalkoverPlayers, sortPlayers } from '../scripts/utils.js';
import { createFinalsMatches, updatePlayerAdvancement,createSeedingPools,getNextFinalsRoundNumber, drawFinalsForGroup, getRecommendedFinalsGroupSizes} from '../finals-logic.js';
import { openScorePopup } from './UI-popup.js';

// When clicking on finals button, start the finals process. User will first select group sizes, then proceed to create matches.
export function startFinals() {
    const tournament = Tournaments.getCurrentTournament();
    if (!tournament) {
        console.error('Tournament not found');
        return;
    }
    if (checkForIncompleteMatches(tournament)) {
        if (!confirm('Noen kamper er ikke fullført. Vil du likevel fortsette til sluttspill?')) {
            return;
        }
    }

    if( checkForWalkoverPlayers(tournament)) {
        if (!confirm('Det finnes spillere med walkover. Vil du fjerne dem?')) {
            return;
        }
        deleteWalkoverPlayers(tournament);
    }
    // Get recommended group sizes and show selection popup
    displayFinalsGroupSizeSelectionPopup(tournament);
}

// Display a popup to select recommended finals group sizes
export async function displayFinalsGroupSizeSelectionPopup(tournament) {
    const totalPlayers = tournament.getPlayers().filter(player => player.eliminated == null).length;
    const recommendedGroupSizes = await getRecommendedFinalsGroupSizes(totalPlayers);
    console.log("Recommended group sizes: ", recommendedGroupSizes);
    if (!recommendedGroupSizes.length) {
        alert('Ingen anbefalte gruppestørrelser for dette antallet spillere.');
        return;
    }    
    
    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'finals-overlay';
    // Create popup box
    const popup = document.createElement('div');
    popup.className = 'finals-popup finals-popup-large';

    // Title
    const title = document.createElement('h2');
    title.textContent = 'Velg gruppestørrelser for sluttspill';
    popup.appendChild(title);

    function renderGroupSizeOptions() {
        recommendedGroupSizes.forEach((option, idx) => {
            const label = document.createElement('label');
            label.className = 'finals-group-option';
            const radio = document.createElement('input');
            radio.type = 'radio';
            radio.name = 'finals-group-size';
            radio.value = idx;
            if (idx === 0) radio.checked = true;
            label.appendChild(radio);
            label.appendChild(document.createTextNode(`A:${option.A}  -  B:${option.B}`));
            popup.appendChild(label);
        });
    }

    // List recommended group size options as radio buttons
    renderGroupSizeOptions();

    // Player preview area
    const previewDiv = document.createElement('div');

    popup.appendChild(previewDiv);    
    function displayPlayersInGroupPreview() {
        const selectedIdx = Array.from(popup.querySelectorAll('input[name="finals-group-size"]')).findIndex(r => r.checked);
        if (selectedIdx === -1) return;
        const selected = recommendedGroupSizes[selectedIdx];
        const players = sortPlayers(tournament.getPlayers().filter(player => player.eliminated == null));
        let html = '';
        html += '<table class="finals-preview-table">';
        html += `<tr><th>Gruppe A (${selected.A})</th><th>Gruppe B (${selected.B})</th></tr>`;
        const groupA = players.slice(0, selected.A);
        const groupB = players.slice(selected.A, selected.A + selected.B);
        const maxRows = Math.max(groupA.length, groupB.length);
        for (let i = 0; i < maxRows; i++) {
            html += '<tr>';
            html += `<td>${groupA[i] ? groupA[i].name : ''}</td>`;
            html += `<td>${groupB[i] ? groupB[i].name : ''}</td>`;
            html += '</tr>';
        }
        html += '</table>';
        previewDiv.innerHTML = html;
    }

    // Update preview on radio change
    popup.querySelectorAll('input[name="finals-group-size"]').forEach(radio => {
        radio.addEventListener('change', displayPlayersInGroupPreview);
    });
    // Initial preview
    displayPlayersInGroupPreview();

    // Confirm button
    const confirmBtn = document.createElement('button');
    confirmBtn.textContent = 'Bekreft valg';
    confirmBtn.className = 'finals-button finals-button-primary finals-margin-top';
    setGroupSizes();

    popup.appendChild(confirmBtn);

    // Cancel button
    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Avbryt';
    cancelBtn.className = 'finals-button finals-button-secondary finals-margin-left';
    cancelBtn.onclick = () => {
        document.body.removeChild(overlay);
    };
    popup.appendChild(cancelBtn);

    overlay.appendChild(popup);
    document.body.appendChild(overlay);

    function setGroupSizes() {
        confirmBtn.onclick = () => {
            const selectedIdx = Array.from(popup.querySelectorAll('input[name="finals-group-size"]')).findIndex(r => r.checked);
            if (selectedIdx === -1) {
                alert('Velg en gruppestørrelse.');
                return;
            }
            const selected = recommendedGroupSizes[selectedIdx]; // Tag players with A or B using correct sorting
            const players = sortPlayers(tournament.getPlayers().filter(player => player.eliminated == null));
            players.forEach((p, i) => {
                if (i < selected.A) {
                    p.finalsGroup = 'A';
                } else if (i < selected.A + selected.B) {
                    p.finalsGroup = 'B';
                } else {
                    p.finalsGroup = undefined;
                }
            });

            // Store original group sizes for structure consistency
            tournament.finalsGroupSizes = {
                A: selected.A,
                B: selected.B
            };

            tournament.finalsMatchSchedule = null;
            tournament.saveToLocalStorage();
            document.body.removeChild(overlay);
            // Proceed to finals 
            tournament.setStage('finals');
            displayTournamentOverview(tournament);
        };
    }
}

// Function to show bracket preview with seeding option
export function displayFinalsBracketSetupPopup(tournament, groupName, players, structure, originalPlayerCount) {
    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'finals-overlay';

    // Create popup box
    const popup = document.createElement('div');
    popup.className = 'finals-popup finals-popup-large';

    // Title - show both counts if different
    const title = document.createElement('h2');
    if (originalPlayerCount && originalPlayerCount !== players.length) {
        title.textContent = `Sluttspill Gruppe ${groupName} - ${players.length}/${originalPlayerCount} spillere (struktur basert på ${originalPlayerCount})`;
    } else {
        title.textContent = `Sluttspill Gruppe ${groupName} - ${players.length} spillere`;
    }
    popup.appendChild(title);

    // Seeding option
    const seedingContainer = document.createElement('div');
    seedingContainer.className = 'finals-seeding-container';

    const seedingLabel = document.createElement('label');
    seedingLabel.className = 'finals-seeding-label';

    const seedingCheckbox = document.createElement('input');
    seedingCheckbox.type = 'checkbox';
    seedingCheckbox.id = 'seedingOption';
    seedingCheckbox.className = 'finals-seeding-checkbox';
    seedingCheckbox.checked = true; // Default to checked
    
    seedingLabel.appendChild(seedingCheckbox);
    seedingLabel.appendChild(document.createTextNode('Bruk seeding'));
    
    const seedingExplanation = document.createElement('div');
    seedingExplanation.className = 'finals-seeding-explanation';
    seedingExplanation.textContent = 'Med seeding deles spillerne basert på rangering.';
    
    seedingContainer.appendChild(seedingLabel);
    seedingContainer.appendChild(seedingExplanation);
    popup.appendChild(seedingContainer);

    // Bracket structure display
    const bracketContainer = document.createElement('div');
    bracketContainer.className = 'finals-bracket-container';
    displayBracketStructure(bracketContainer, structure);
    popup.appendChild(bracketContainer);    // Player preview
    const previewContainer = document.createElement('div');
    previewContainer.className = 'finals-preview-container';
    displayNextRoundPlayersPreview(previewContainer, players, seedingCheckbox.checked, structure, tournament, groupName);
    popup.appendChild(previewContainer);

    // Update preview when seeding option changes
    seedingCheckbox.addEventListener('change', () => {
        displayNextRoundPlayersPreview(previewContainer, players, seedingCheckbox.checked, structure, tournament, groupName);
    });

    // Buttons
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'finals-button-container';

    const confirmBtn = document.createElement('button');
    confirmBtn.textContent = 'Bekreft og opprett kamper';
    confirmBtn.className = 'finals-button finals-button-primary';    
    
    confirmBtn.onclick = async () => {
        const result = await createFinalsMatches(tournament, groupName, players, structure, seedingCheckbox.checked, originalPlayerCount);
        if (result.success) {
            //alert(`${result.matches || result.assignments} ${result.matches ? 'kamper' : 'baner'} opprettet for gruppe ${groupName}! (${seedingCheckbox.checked ? 'Med' : 'Uten'} seeding)`);
            document.body.removeChild(overlay);
            displayTournamentOverview(tournament);
        } else {
            alert('Feil ved opprettelse: ' + result.error);
        }
    };

    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Avbryt';
    cancelBtn.className = 'finals-button finals-button-secondary';
    cancelBtn.onclick = () => {
        document.body.removeChild(overlay);
    };

    buttonContainer.appendChild(confirmBtn);
    buttonContainer.appendChild(cancelBtn);
    popup.appendChild(buttonContainer);

    overlay.appendChild(popup);
    document.body.appendChild(overlay);

// Function to display bracket structure
function displayBracketStructure(container, structure) {
    // Create toggle button
    const toggleButton = document.createElement('button');
    toggleButton.textContent = 'Vis bracket struktur';
    toggleButton.className = 'finals-toggle-structure-btn';
    toggleButton.style.marginBottom = '10px';
    container.appendChild(toggleButton);

    // Create title and structure container
    const title = document.createElement('h3');
    title.textContent = 'Bracket struktur:';
    title.style.display = 'none'; // Hidden by default

    const structureDiv = document.createElement('div');
    structureDiv.className = 'finals-bracket-structure';
    structureDiv.style.display = 'none'; // Hidden by default

    // Filter out the final rounds (Semifinals, Finals, Bronze Final)
    const filteredRounds = structure.rounds.filter(round => 
        !['Semifinale', 'Finale', 'Bronsefinale'].includes(round.name)
    );

    filteredRounds.forEach((round, roundIndex) => {
        const roundDiv = document.createElement('div');
        roundDiv.className = 'finals-bracket-round';
        
        const roundTitle = document.createElement('strong');
        roundTitle.textContent = `${round.name}: `;
        roundDiv.appendChild(roundTitle);

        const roundInfo = document.createElement('span');
        roundInfo.textContent = `${round.players} spillere → ${round.totalAdvance} går videre`;
        roundDiv.appendChild(roundInfo);

        if (round.courts) {
            const courtsDiv = document.createElement('div');
            courtsDiv.className = 'finals-bracket-courts';
            
            // count the number of courts where walkover is present
            const walkoverCount = round.courts.filter(court => court.court === 'WO1' || court.court.toString().startsWith('WO')).length;

            round.courts.filter(court => court.court !== 'WO1' && !court.court.toString().startsWith('WO')).forEach(court => {
                const courtDiv = document.createElement('div');
                {
                    courtDiv.textContent = `Bane ${court.court}: ${court.players} spillere (${court.advance} går videre)`;
                }
                courtsDiv.appendChild(courtDiv);
            });

            const walkoverDiv = document.createElement('div');
            walkoverCount > 0 ? walkoverDiv.textContent = `Walkover: ${walkoverCount} spiller(e)` : walkoverDiv.textContent = 'Ingen walkover';
            courtsDiv.appendChild(walkoverDiv);
            roundDiv.appendChild(courtsDiv);
        }
        structureDiv.appendChild(roundDiv);
    });

    container.appendChild(title);
    container.appendChild(structureDiv);

    // Add toggle functionality
    let isVisible = false;
    toggleButton.addEventListener('click', () => {
        isVisible = !isVisible;
        title.style.display = isVisible ? 'block' : 'none';
        structureDiv.style.display = isVisible ? 'block' : 'none';
        toggleButton.textContent = isVisible ? 'Skjul bracket struktur' : 'Vis bracket struktur';
    });
}
// Function to update player preview based on seeding option
function displayNextRoundPlayersPreview(container, players, useSeeding, structure, tournament, groupName) {
    container.innerHTML = '';

    // Determine which round structure to use based on current round number
    const currentRoundNumber = getNextFinalsRoundNumber(tournament, groupName);
    const roundIndex = currentRoundNumber - 1; // Convert to 0-based index
    
    // Get the appropriate round from structure, or fallback to first round
    const targetRound = structure.rounds[roundIndex] || structure.rounds[0];
    
    // Get walkover courts from the target round to determine walkover positions
    const walkoverCourts = targetRound.courts.filter(court => 
        court.court === 'WO1' || court.court.toString().startsWith('WO')
    );
    const totalWalkovers = walkoverCourts.length;
    
    // Sort players (top-ranked first)
    const sortedPlayers = sortPlayers(players);
    
    // Get walkover players (top-ranked)
    const walkoverPlayers = sortedPlayers.slice(0, totalWalkovers);
    const remainingPlayers = sortedPlayers.slice(totalWalkovers);

    // Show walkover players first if any
    if (totalWalkovers > 0) {
        const walkoverDiv = document.createElement('div');
        walkoverDiv.className = 'finals-walkover-section';
        
        const walkoverTitle = document.createElement('h4');
        walkoverTitle.textContent = 'Walkover:';
        walkoverTitle.className = 'finals-walkover-title';
        walkoverDiv.appendChild(walkoverTitle);
        
        walkoverPlayers.forEach(player => {
            const playerDiv = document.createElement('div');
            playerDiv.textContent = `${player.name} - ${player.matchPoints}p (${player.scorePoints})`;
            playerDiv.className = 'finals-walkover-player';
            walkoverDiv.appendChild(playerDiv);
        });
        
        container.appendChild(walkoverDiv);
    }    if (useSeeding) {
        const pools = createSeedingPools(remainingPlayers, structure, targetRound);
        
        const poolsContainer = document.createElement('div');
        poolsContainer.className = 'finals-pools-container';

        pools.forEach((pool, index) => {
            const poolDiv = document.createElement('div');
            poolDiv.className = 'finals-pool';

            const poolTitle = document.createElement('h4');
            poolTitle.textContent = `Seeding ${index + 1}`;
            poolTitle.className = 'finals-pool-title';
            poolDiv.appendChild(poolTitle);

            pool.forEach(player => {
                const playerDiv = document.createElement('div');
                playerDiv.textContent = `${player.name} - ${player.matchPoints}p (${player.scorePoints})`;
                playerDiv.className = 'finals-pool-player';
                poolDiv.appendChild(playerDiv);
            });

            poolsContainer.appendChild(poolDiv);
        });

        container.appendChild(poolsContainer);
    } else {
        const playersList = document.createElement('div');
        playersList.className = 'finals-players-list';

        remainingPlayers.forEach((player, index) => {
            const playerDiv = document.createElement('div');
            playerDiv.textContent = `${index + 1}. ${player.name} - ${player.matchPoints}p (${player.scorePoints})`;
            playerDiv.className = 'finals-player-item';
            playersList.appendChild(playerDiv);
        });

        container.appendChild(playersList);
    }
}
}

// Function to show player selection popup for 3-player court advancement
function showPlayerSelectionPopup(assignment, tournament) {
    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'finals-overlay';

    // Create popup box
    const popup = document.createElement('div');
    popup.className = 'finals-popup finals-popup-medium';

    // Title
    const title = document.createElement('h3');
    title.textContent = `Bane ${assignment.courtNumber} - Velg vinnere`;
    popup.appendChild(title);

    // Instructions
    const instructions = document.createElement('p');
    instructions.textContent = `Velg ${assignment.playersToAdvance} av ${assignment.players.length} spillere som går videre til neste runde:`;
    instructions.className = 'finals-instructions';
    popup.appendChild(instructions);

    // Player checkboxes
    const playersContainer = document.createElement('div');
    playersContainer.className = 'finals-player-selection';
    
    const selectedPlayers = [];
    assignment.players.forEach(player => {
        const playerDiv = document.createElement('div');
        playerDiv.className = 'finals-player-option';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `player-${player.id}`;
        checkbox.className = 'finals-player-checkbox';

        const label = document.createElement('label');
        label.htmlFor = `player-${player.id}`;
        label.textContent = `${player.name} (${player.scorePoints}p)`;
        label.className = 'finals-player-label';

        checkbox.addEventListener('change', () => {
            if (checkbox.checked) {
                if (selectedPlayers.length < assignment.playersToAdvance) {
                    selectedPlayers.push(player);
                    playerDiv.classList.add('selected');
                } else {
                    checkbox.checked = false;
                    alert(`Du kan bare velge ${assignment.playersToAdvance} spillere.`);
                }
            } else {
                const index = selectedPlayers.findIndex(p => p.id === player.id);
                if (index > -1) {
                    selectedPlayers.splice(index, 1);
                    playerDiv.classList.remove('selected');
                }
            }
            confirmBtn.disabled = selectedPlayers.length !== assignment.playersToAdvance;
            if (confirmBtn.disabled) {
                confirmBtn.classList.add('finals-button:disabled');
            } else {
                confirmBtn.classList.remove('finals-button:disabled');
            }
        });

        playerDiv.addEventListener('click', (e) => {
            if (e.target !== checkbox) {
                checkbox.click();
            }
        });

        playerDiv.appendChild(checkbox);
        playerDiv.appendChild(label);
        playersContainer.appendChild(playerDiv);
    });

    popup.appendChild(playersContainer);

    // Buttons
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'finals-button-container';

    const confirmBtn = document.createElement('button');
    confirmBtn.textContent = 'Bekreft valg';
    confirmBtn.className = 'finals-button finals-button-confirm';
    confirmBtn.disabled = true;    confirmBtn.addEventListener('click', () => {
        if (selectedPlayers.length === assignment.playersToAdvance) {
            // Find the current round number for this assignment
            let currentRoundNumber = 1; // Default fallback
            if (tournament.finalsCourtAssignments) {
                const round = tournament.finalsCourtAssignments.find(round => 
                    round.courtAssignments && round.courtAssignments.includes(assignment)
                );
                if (round) {
                    currentRoundNumber = round.roundNumber;
                }
            }
            
            // Update elimination status for all players in this court assignment
            assignment.players.forEach(player => {
                if (selectedPlayers.includes(player)) {
                    // Selected players advance - clear elimination status
                    player.eliminated = null;
                } else {
                    // Non-selected players are eliminated at this round
                    player.eliminated = currentRoundNumber;
                }
            });
            
            const success = updatePlayerAdvancement(tournament, assignment, selectedPlayers);
            if (success) {
                document.body.removeChild(overlay);
                // Refresh the tournament overview
                displayTournamentOverview(tournament);
                //alert(`${selectedPlayers.length} spillere valgt for å gå videre!`);
            } else {
                alert('Feil ved oppdatering av spillervalg');
            }
        }
    });

    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Avbryt';
    cancelBtn.className = 'finals-button finals-button-secondary';

    cancelBtn.addEventListener('click', () => {
        document.body.removeChild(overlay);
    });

    buttonContainer.appendChild(confirmBtn);
    buttonContainer.appendChild(cancelBtn);
    popup.appendChild(buttonContainer);

    overlay.appendChild(popup);
    document.body.appendChild(overlay);
}

// Function to display finals overview
export function displayFinalsOverview(tournament, matchOverviewContainer) {
    const finalsContainer = document.createElement('div');
    finalsContainer.id = 'finalsOverview';
    matchOverviewContainer.appendChild(finalsContainer);
    const finalsText = document.createElement('h3');
    finalsText.textContent = 'Sluttspill ' + tournament.finalsFormat;
    finalsContainer.appendChild(finalsText);    // show players in finals
    const players = tournament.getPlayers();
    const finalsPlayers = players.filter(player => 
        player.finalsGroup !== undefined && player.eliminated == null
    );
    if (finalsPlayers.length === 0) {
        const noPlayersText = document.createElement('p');
        noPlayersText.textContent = 'Ingen spillere i sluttspillet.';
        finalsContainer.appendChild(noPlayersText);
        return;
    }

    // Group players by finalsGroup
    const groupedPlayers = {};
    finalsPlayers.forEach(player => {
        if (!groupedPlayers[player.finalsGroup]) {
            groupedPlayers[player.finalsGroup] = [];
        }
        groupedPlayers[player.finalsGroup].push(player);
    });            // Sort players within each group using sortPlayers function
    Object.keys(groupedPlayers).forEach(groupName => {
        groupedPlayers[groupName] = sortPlayers(groupedPlayers[groupName]);
    });

    // Create container for all groups to display side by side
    const groupsContainer = document.createElement('div');
    groupsContainer.classList.add('finals-groups-container'); 
    Object.keys(groupedPlayers).sort().forEach(groupName => {
        const groupContainer = document.createElement('div');
        groupContainer.classList.add('finals-group-container'); 

        const groupNameText = document.createElement('h3');
        groupNameText.textContent = `Gruppe ${groupName} (${groupedPlayers[groupName].length} spillere)`;
        groupContainer.appendChild(groupNameText);

        // Add button to draw next round for this group (above table)
        const drawFinalsButton = document.createElement('button');
        
        drawFinalsButton.textContent = `Trekk neste runde`;
        drawFinalsButton.classList.add('draw-finals-btn');
        
        drawFinalsButton.dataset.group = groupName;
        drawFinalsButton.addEventListener('click', () => {
            drawFinalsForGroup(tournament, groupName);
        });
        
        groupContainer.appendChild(drawFinalsButton);        // Show finals matches if they exist
        if ((tournament.finalsMatchSchedule && tournament.finalsMatchSchedule.length > 0) ||
            (tournament.finalsCourtAssignments && tournament.finalsCourtAssignments.length > 0)) {
            displayFinalsMatches(tournament, groupContainer, groupName);
        }

        groupsContainer.appendChild(groupContainer);
    });

    finalsContainer.appendChild(groupsContainer);        
    matchOverviewContainer.appendChild(finalsContainer);

}

// Function to display finals matches
export function displayFinalsMatches(tournament, groupContainer, groupName) {
    const matchesContainer = document.createElement('div');
    matchesContainer.id = 'finalsMatches';
    matchesContainer.className = 'finals-matches-container';

    displayCourtAssignments(tournament, matchesContainer, groupName);

    groupContainer.appendChild(matchesContainer);
}

export function displayCourtAssignments(tournament, container, groupName) {
    // Group court assignments by group name
    const assignmentsByGroup = {};
    tournament.finalsCourtAssignments.forEach(round => {
        if (!assignmentsByGroup[round.groupName]) {
            assignmentsByGroup[round.groupName] = [];
        }
        assignmentsByGroup[round.groupName].push(round);
    });

    // Display assignments only for the specified group
    if (assignmentsByGroup[groupName]) {
        const groupAssignmentsDiv = document.createElement('div');
        groupAssignmentsDiv.className = 'finals-group-assignments';

        // Sort rounds by roundNumber in descending order (newest first)
        const sortedRounds = assignmentsByGroup[groupName].sort((a, b) => b.roundNumber - a.roundNumber);
        const lastRoundNumber = sortedRounds.length > 0 ? sortedRounds[0].roundNumber : null;
        sortedRounds.forEach(round => {
            const roundDiv = document.createElement('div');
            roundDiv.className = 'finals-round';

            // Create table for court assignments
            const table = document.createElement('table');
            table.classList.add('finals-matches-table');

            // Create table header to show group name and round number
            const thead1 = table.createTHead();
            const headerRow1 = thead1.insertRow();
            const groupHeaderCell = document.createElement('th');
            groupHeaderCell.textContent = `Gruppe ${groupName} - ${round.roundName}`;
            groupHeaderCell.colSpan = 3;
            groupHeaderCell.className = 'finals-group-header';
            headerRow1.appendChild(groupHeaderCell);
            // Create main header row
            const thead = table.createTHead();
            const headerRow = thead.insertRow();
            ['Bane', 'Spillere', 'Status'].forEach(text => {
                const th = document.createElement('th');
                th.textContent = text;
                th.className = 'finals-table-header';
                headerRow.appendChild(th);
            });

            const tbody = table.createTBody();
            round.courtAssignments.forEach(assignment => {
                const row = tbody.insertRow();
                row.className = 'finals-table-row';

                // Court
                const courtCell = row.insertCell();
                courtCell.textContent = assignment.isWalkover ? 'WO' : `${assignment.courtNumber}`;
                courtCell.className = 'finals-table-cell finals-court-cell';

                // Players
                const playersCell = row.insertCell();
                playersCell.textContent = assignment.players.slice().sort((a,b) => a.id - b.id).map(p => p.name).join(', ');
                playersCell.className = 'finals-table-cell';

                // Status
                const statusCell = row.insertCell();
                statusCell.className = 'finals-table-cell finals-status-cell';

                if (assignment.isWalkover) {
                    statusCell.textContent = 'Walkover';
                    statusCell.classList.add('finals-walkover');
                } else if (assignment.isCompleted) {
                    statusCell.textContent = 'Fullført';
                    statusCell.classList.add('finals-completed');
                    // Show advanced players
                    const advancedDiv = document.createElement('div');
                    advancedDiv.className = 'finals-advanced-players';
                    advancedDiv.textContent = `Vinnere: ${assignment.advancedPlayers.map(p => p.name).join(', ')}`;
                    statusCell.appendChild(document.createElement('br'));
                    statusCell.appendChild(advancedDiv);
                    // Add edit button only for completed assignments in the last round
                    if (round.roundNumber === lastRoundNumber) {
                        const editBtn = document.createElement('button');
                        editBtn.textContent = 'Rediger';
                        editBtn.className = 'finals-edit-button';
                        editBtn.addEventListener('click', () => {
                            showPlayerSelectionPopup(assignment, tournament);
                        });
                        statusCell.appendChild(editBtn);
                    }
                } else {
                    const selectBtn = document.createElement('button');
                    selectBtn.textContent = 'Velg vinnere';
                    selectBtn.className = 'finals-edit-button';
                    selectBtn.addEventListener('click', () => {
                        showPlayerSelectionPopup(assignment, tournament);
                    });
                    statusCell.appendChild(selectBtn);
                }
            });            
            roundDiv.appendChild(table);
            groupAssignmentsDiv.appendChild(roundDiv);
        });

        container.appendChild(groupAssignmentsDiv);
    }
}









