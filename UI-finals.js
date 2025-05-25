// This file handles the UI for the finals stage of the tournament
import Tournaments from './classes/Tournament.js';
import { displayTournamentOverview } from './UI-tournament.js';
import { checkForIncompleteMatches, checkForWalkoverPlayers, deleteWalkoverPlayers, getRecommendedFinalsGroupSizes, sortPlayersForFinals, sortPlayers } from './utils.js';
import { 
    loadFinalsStructure, 
    createFinalsMatchesOrAssignments, 
    hasThreePlayerCourts,
    updatePlayerAdvancement,
    createSeedingPools
} from './finals-logic.js';
import { openScorePopup } from './UI-popup.js';

// When clicking on startFinals, it will start the finals stage of the tournament
// 1. The user selects group sizes for the finals (group A and group B)
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
    const totalPlayers = tournament.getPlayers().length;
    const recommended = await getRecommendedFinalsGroupSizes(totalPlayers);
    console.log("Recommended group sizes: ", recommended.length);
    if (!recommended.length) {
        alert('Ingen anbefalte gruppestørrelser for dette antallet spillere.');
        return;
    }    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'finals-overlay';    // Create popup box
    const popup = document.createElement('div');
    popup.className = 'finals-popup finals-popup-large';

    // Title
    const title = document.createElement('h2');
    title.textContent = 'Velg gruppestørrelser for sluttspill';
    popup.appendChild(title);

    // List recommended options as radio buttons
    recommended.forEach((option, idx) => {
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

    // Player preview area
    const previewDiv = document.createElement('div');
    popup.appendChild(previewDiv);

    function updatePreview() {
        const selectedIdx = Array.from(popup.querySelectorAll('input[name="finals-group-size"]')).findIndex(r => r.checked);
        if (selectedIdx === -1) return;
        const selected = recommended[selectedIdx];
        const players = sortPlayersForFinals(tournament.getPlayers());
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
        radio.addEventListener('change', updatePreview);
    });
    // Initial preview
    updatePreview();    // Confirm button
    const confirmBtn = document.createElement('button');
    confirmBtn.textContent = 'Bekreft valg';
    confirmBtn.className = 'finals-button finals-button-primary finals-margin-top';
    confirmBtn.onclick = () => {
        const selectedIdx = Array.from(popup.querySelectorAll('input[name="finals-group-size"]')).findIndex(r => r.checked);
        if (selectedIdx === -1) {
            alert('Velg en gruppestørrelse.');
            return;
        }
        const selected = recommended[selectedIdx];
        // Tag players with A or B using correct sorting
        const players = sortPlayersForFinals(tournament.getPlayers());
        players.forEach((p, i) => {
            if (i < selected.A) {
                p.finalsGroup = 'A';
            } else if (i < selected.A + selected.B) {
                p.finalsGroup = 'B';
            } else {
                p.finalsGroup = undefined;
            }
        });
        tournament.finalsMatchSchedule = null;
        tournament.saveToLocalStorage();
        document.body.removeChild(overlay);
        // Proceed to finals 

        tournament.setStage('finals');
        displayTournamentOverview(tournament);
    };

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
}

// Function to handle drawing the finals bracket for a specific group
export function drawFinalsGroup(tournament, groupName) {
    console.log(`Drawing finals for group ${groupName}`);
    
    // Get players in the specified group
    const players = tournament.getPlayers().filter(player => player.finalsGroup === groupName);
    const playerCount = players.length;
    
    if (playerCount === 0) {
        alert(`Ingen spillere i gruppe ${groupName}`);
        return;
    }
    
    // Load finals structure data
    loadFinalsStructure(playerCount).then(structure => {
        if (!structure) {
            alert(`Ingen bracket struktur funnet for ${playerCount} spillere`);
            return;
        }
        
        // Show bracket preview with seeding option
        showBracketPreview(tournament, groupName, players, structure);
    }).catch(error => {        console.error('Error loading finals structure:', error);
        alert('Feil ved lasting av bracket struktur');
    });
}

// Function to show bracket preview with seeding option
function showBracketPreview(tournament, groupName, players, structure) {
    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'finals-overlay';

    // Create popup box
    const popup = document.createElement('div');
    popup.className = 'finals-popup finals-popup-large';

    // Title
    const title = document.createElement('h2');
    title.textContent = `Sluttspill Gruppe ${groupName} - ${players.length} spillere`;
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
    
    seedingLabel.appendChild(seedingCheckbox);
    seedingLabel.appendChild(document.createTextNode('Bruk seeding (spillere i samme pool møtes ikke i første runde)'));
    
    const seedingExplanation = document.createElement('div');
    seedingExplanation.className = 'finals-seeding-explanation';
    seedingExplanation.textContent = 'Med seeding deles spillerne i 2-3 pools basert på rangering, og spillere fra samme pool møtes ikke i første runde.';
    
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
    updatePlayerPreview(previewContainer, players, seedingCheckbox.checked, structure);
    popup.appendChild(previewContainer);

    // Update preview when seeding option changes
    seedingCheckbox.addEventListener('change', () => {
        updatePlayerPreview(previewContainer, players, seedingCheckbox.checked, structure);
    });

    // Buttons
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'finals-button-container';

    const confirmBtn = document.createElement('button');
    confirmBtn.textContent = 'Bekreft og opprett kamper';
    confirmBtn.className = 'finals-button finals-button-primary';
    confirmBtn.onclick = async () => {
        const result = await createFinalsMatchesOrAssignments(tournament, groupName, players, structure, seedingCheckbox.checked);
        if (result.success) {
            alert(`${result.matches || result.assignments} ${result.matches ? 'kamper' : 'baner'} opprettet for gruppe ${groupName}! (${seedingCheckbox.checked ? 'Med' : 'Uten'} seeding)`);
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
}

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
            
            round.courts.forEach(court => {
                const courtDiv = document.createElement('div');
                if (court.court === 'WO1') {
                    courtDiv.textContent = `Walkover: ${court.players} spiller(e)`;
                } else {
                    courtDiv.textContent = `Bane ${court.court}: ${court.players} spillere (${court.advance} går videre)`;
                }
                courtsDiv.appendChild(courtDiv);
            });
            
            roundDiv.appendChild(courtsDiv);
        }        structureDiv.appendChild(roundDiv);
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
function updatePlayerPreview(container, players, useSeeding, structure) {
    container.innerHTML = '';
    
    const title = document.createElement('h3');
    title.textContent = 'Spillere:';
    container.appendChild(title);

    if (useSeeding) {
        const pools = createSeedingPools(players, structure);
        
        const poolsContainer = document.createElement('div');
        poolsContainer.className = 'finals-pools-container';

        pools.forEach((pool, index) => {
            const poolDiv = document.createElement('div');
            poolDiv.className = 'finals-pool';

            const poolTitle = document.createElement('h4');
            poolTitle.textContent = `Pool ${index + 1}`;
            poolTitle.className = 'finals-pool-title';
            poolDiv.appendChild(poolTitle);

            pool.forEach(player => {
                const playerDiv = document.createElement('div');
                playerDiv.textContent = `${player.name} (${player.scorePoints}p)`;
                playerDiv.className = 'finals-pool-player';
                poolDiv.appendChild(playerDiv);
            });

            poolsContainer.appendChild(poolDiv);
        });

        container.appendChild(poolsContainer);
    } else {
        const sortedPlayers = [...players].sort((a, b) => {
            if (b.scorePoints !== a.scorePoints) return b.scorePoints - a.scorePoints;
            if (b.matchPoints !== a.matchPoints) return b.matchPoints - a.matchPoints;
            return a.name.localeCompare(b.name);
        });

        const playersList = document.createElement('div');
        playersList.className = 'finals-players-list';

        sortedPlayers.forEach((player, index) => {
            const playerDiv = document.createElement('div');
            playerDiv.textContent = `${index + 1}. ${player.name} (${player.scorePoints}p, ${player.matchPoints}kp)`;
            playerDiv.className = 'finals-player-item';
            playersList.appendChild(playerDiv);
        });

        container.appendChild(playersList);
    }
}

// Function to show player selection popup for 3-player court advancement
export function showPlayerSelectionPopup(assignment, tournament) {
    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'finals-overlay';

    // Create popup box
    const popup = document.createElement('div');
    popup.className = 'finals-popup finals-popup-medium';

    // Title
    const title = document.createElement('h3');
    title.textContent = `Bane ${assignment.courtNumber} - Velg spillere som går videre`;
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
    confirmBtn.disabled = true;

    confirmBtn.addEventListener('click', () => {
        if (selectedPlayers.length === assignment.playersToAdvance) {
            const success = updatePlayerAdvancement(tournament, assignment, selectedPlayers);
            if (success) {
                document.body.removeChild(overlay);
                // Refresh the tournament overview
                displayTournamentOverview(tournament);
                alert(`${selectedPlayers.length} spillere valgt for å gå videre!`);
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
export function displayFinals(tournament, matchOverviewContainer) {
    const finalsContainer = document.createElement('div');
    finalsContainer.id = 'finalsOverview';
    matchOverviewContainer.appendChild(finalsContainer);
    const finalsText = document.createElement('h2');
    finalsText.textContent = 'Sluttspill ' + tournament.finalsFormat;
    finalsContainer.appendChild(finalsText);

    // show players in finals
    const players = tournament.getPlayers();
    const finalsPlayers = players.filter(player => player.finalsGroup !== undefined);
    if (finalsPlayers.length === 0) {
        const noPlayersText = document.createElement('p');
        noPlayersText.textContent = 'Ingen spillere i sluttspillet.';
        finalsContainer.appendChild(noPlayersText);
        return;
    }

    // Show finals matches if they exist            // Display existing matches and court assignments
    if ((tournament.finalsMatchSchedule && tournament.finalsMatchSchedule.length > 0) ||
        (tournament.finalsCourtAssignments && tournament.finalsCourtAssignments.length > 0)) {
        displayFinalsMatches(tournament, finalsContainer);
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
    groupsContainer.classList.add('finals-groups-container');            // Create tables for each group
    Object.keys(groupedPlayers).sort().forEach(groupName => {                const groupContainer = document.createElement('div');
        groupContainer.classList.add('finals-group-container');                // Check if group already has matches or court assignments drawn
        const groupHasMatches = (tournament.finalsMatchSchedule && 
            tournament.finalsMatchSchedule.some(round => round.groupName === groupName)) ||
            (tournament.finalsCourtAssignments && 
            tournament.finalsCourtAssignments.some(round => round.groupName === groupName));

        // Add button to draw next round for this group (above table)
        const drawFinalsButton = document.createElement('button');
        if (groupHasMatches) {
            drawFinalsButton.textContent = `Vis bracket - Gruppe ${groupName}`;
            drawFinalsButton.classList.add('view-bracket-btn');
        } else {
            drawFinalsButton.textContent = `Trekk neste runde - Gruppe ${groupName}`;
            drawFinalsButton.classList.add('draw-finals-btn');
        }
        drawFinalsButton.dataset.group = groupName;
        drawFinalsButton.addEventListener('click', () => {
            import('./UI-finals.js').then(module => {
                module.drawFinalsGroup(tournament, groupName);
            });
        });
        
        groupContainer.appendChild(drawFinalsButton);

        // Create table for this group
        const finalsTable = document.createElement('table');
        finalsTable.id = `finalsPlayersTable-${groupName}`;
        finalsTable.classList.add('finals-group-table');
        const finalsTbody = finalsTable.appendChild(document.createElement('tbody'));
        const finalsHeader = finalsTable.createTHead();
        
        // Add group name as table header
        const groupHeaderRow = finalsHeader.insertRow();
        const groupHeaderCell = document.createElement('th');
        groupHeaderCell.textContent = `Gruppe ${groupName}`;
        groupHeaderCell.colSpan = 4;
        groupHeaderCell.className = 'finals-group-header';
        groupHeaderRow.appendChild(groupHeaderCell);
        
        // Add column headers
        const finalsHeaderRow = finalsHeader.insertRow();
        const headerS = document.createElement('th');
        headerS.textContent = 'S';
        finalsHeaderRow.appendChild(headerS);
        const headerName = document.createElement('th');
        headerName.textContent = 'Navn';
        finalsHeaderRow.appendChild(headerName);
        const headerSP = document.createElement('th');
        headerSP.textContent = 'SP';
        finalsHeaderRow.appendChild(headerSP);
        const headerKP = document.createElement('th');
        headerKP.textContent = 'KP';
        finalsHeaderRow.appendChild(headerKP);

        groupedPlayers[groupName].forEach(player => {
            const row = finalsTbody.insertRow();
            row.insertCell().textContent = player.id;
            row.insertCell().textContent = player.name;
            row.insertCell().textContent = player.scorePoints;
            row.insertCell().textContent = player.matchPoints;
        });
        
        groupContainer.appendChild(finalsTable);
        groupsContainer.appendChild(groupContainer);
    });

    finalsContainer.appendChild(groupsContainer);        matchOverviewContainer.appendChild(finalsContainer);

}

// Function to display finals matches
export function displayFinalsMatches(tournament, container) {
    const matchesContainer = document.createElement('div');
    matchesContainer.id = 'finalsMatches';
    matchesContainer.className = 'finals-matches-container';

    const matchesTitle = document.createElement('h3');
    matchesTitle.textContent = 'Sluttspillkamper';
    matchesTitle.className = 'finals-matches-title';
    matchesContainer.appendChild(matchesTitle);

    // Handle regular 2-player matches
    if (tournament.finalsMatchSchedule && tournament.finalsMatchSchedule.length > 0) {
        displayRegularFinalsMatches(tournament, matchesContainer);
    }

    // Handle 3-player court assignments
    if (tournament.finalsCourtAssignments && tournament.finalsCourtAssignments.length > 0) {
        displayThreePlayerCourtAssignments(tournament, matchesContainer);
    }

    container.appendChild(matchesContainer);
}

export function displayRegularFinalsMatches(tournament, container) {
    // Group matches by group name
    const matchesByGroup = {};
    tournament.finalsMatchSchedule.forEach(round => {
        if (!matchesByGroup[round.groupName]) {
            matchesByGroup[round.groupName] = [];
        }
        matchesByGroup[round.groupName].push(round);
    });

    // Display matches for each group
    Object.keys(matchesByGroup).sort().forEach(groupName => {
        const groupMatchesDiv = document.createElement('div');
        groupMatchesDiv.className = 'finals-group-matches';

        const groupTitle = document.createElement('h4');
        groupTitle.textContent = `Gruppe ${groupName} - 2-spillere kamper`;
        groupTitle.className = 'finals-group-title';
        groupMatchesDiv.appendChild(groupTitle);

        matchesByGroup[groupName].forEach(round => {
            const roundDiv = document.createElement('div');
            roundDiv.className = 'finals-round';

            const roundTitle = document.createElement('h5');
            roundTitle.textContent = round.roundName || `Runde ${round.roundNumber}`;
            roundTitle.className = 'finals-round-title';
            roundDiv.appendChild(roundTitle);

            // Create table for matches
            const table = document.createElement('table');
            table.classList.add('finals-matches-table');

            const thead = table.createTHead();
            const headerRow = thead.insertRow();
            ['Bane', 'Spiller 1', 'Resultat', 'Spiller 2', 'Status'].forEach(text => {
                const th = document.createElement('th');
                th.textContent = text;
                th.className = 'finals-table-header';
                headerRow.appendChild(th);
            });

            const tbody = table.createTBody();
            round.matches.forEach(match => {
                const row = tbody.insertRow();
                row.className = 'finals-table-row';

                // Court
                const courtCell = row.insertCell();
                courtCell.textContent = match.court;
                courtCell.className = 'finals-table-cell finals-court-cell';

                // Player 1
                const p1Cell = row.insertCell();
                p1Cell.textContent = match.p1.name;
                p1Cell.className = 'finals-table-cell';

                // Score
                const scoreCell = row.insertCell();
                if (match.p2.id === 'BYE') {
                    scoreCell.textContent = 'Walkover';
                } else {
                    scoreCell.textContent = `${match.p1.scorePoints} - ${match.p2.scorePoints}`;
                }
                scoreCell.className = 'finals-table-cell finals-score-cell';
                scoreCell.addEventListener('click', () => {
                    if (match.p2.id !== 'BYE') {
                        openScorePopup(match, match.p1, match.p2);
                    }
                });

                // Player 2
                const p2Cell = row.insertCell();
                p2Cell.textContent = match.p2.name;
                p2Cell.className = 'finals-table-cell';

                // Status
                const statusCell = row.insertCell();
                statusCell.className = 'finals-table-cell finals-status-cell';

                if (match.p2.id === 'BYE') {
                    statusCell.textContent = 'Walkover';
                    statusCell.classList.add('finals-walkover');
                } else if (match.isCompleted) {
                    statusCell.textContent = 'Fullført';
                    statusCell.classList.add('finals-completed');
                } else {
                    const editBtn = document.createElement('button');
                    editBtn.textContent = 'Rediger';
                    editBtn.className = 'finals-edit-button';
                    editBtn.addEventListener('click', () => {
                        openScorePopup(match, match.p1, match.p2);
                    });
                    statusCell.appendChild(editBtn);
                }
            });

            roundDiv.appendChild(table);
            groupMatchesDiv.appendChild(roundDiv);
        });

        container.appendChild(groupMatchesDiv);
    });
}

export function displayThreePlayerCourtAssignments(tournament, container) {
    // Group court assignments by group name
    const assignmentsByGroup = {};
    tournament.finalsCourtAssignments.forEach(round => {
        if (!assignmentsByGroup[round.groupName]) {
            assignmentsByGroup[round.groupName] = [];
        }
        assignmentsByGroup[round.groupName].push(round);
    });

    // Display assignments for each group
    Object.keys(assignmentsByGroup).sort().forEach(groupName => {
        const groupAssignmentsDiv = document.createElement('div');
        groupAssignmentsDiv.className = 'finals-group-assignments';

        const groupTitle = document.createElement('h4');
        groupTitle.textContent = `Gruppe ${groupName} - 3-spillere baner`;
        groupTitle.className = 'finals-group-title';
        groupAssignmentsDiv.appendChild(groupTitle);

        assignmentsByGroup[groupName].forEach(round => {
            const roundDiv = document.createElement('div');
            roundDiv.className = 'finals-round';

            const roundTitle = document.createElement('h5');
            roundTitle.textContent = round.roundName || `Runde ${round.roundNumber}`;
            roundTitle.className = 'finals-round-title';
            roundDiv.appendChild(roundTitle);

            // Create table for court assignments
            const table = document.createElement('table');
            table.classList.add('finals-matches-table');

            const thead = table.createTHead();
            const headerRow = thead.insertRow();
            ['Bane', 'Spillere', 'Går videre', 'Status'].forEach(text => {
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
                courtCell.textContent = assignment.isWalkover ? 'WO' : `Bane ${assignment.courtNumber}`;
                courtCell.className = 'finals-table-cell finals-court-cell';

                // Players
                const playersCell = row.insertCell();
                playersCell.textContent = assignment.players.map(p => p.name).join(', ');
                playersCell.className = 'finals-table-cell';

                // Advance count
                const advanceCell = row.insertCell();
                advanceCell.textContent = `${assignment.playersToAdvance} av ${assignment.players.length}`;
                advanceCell.className = 'finals-table-cell finals-court-cell';

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
                    advancedDiv.textContent = `Videre: ${assignment.advancedPlayers.map(p => p.name).join(', ')}`;
                    statusCell.appendChild(document.createElement('br'));
                    statusCell.appendChild(advancedDiv);
                } else {
                    const selectBtn = document.createElement('button');
                    selectBtn.textContent = 'Velg videre';
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
    });
}









