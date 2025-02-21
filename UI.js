

function displayMatchSetup(schedule) {
    const matchSetupContainer = document.getElementById('matchSetup');
    matchSetupContainer.innerHTML = '';
    const table = document.createElement('table');
    const thead = table.createTHead();
    const tbody = table.appendChild(document.createElement('tbody'));
    const headerRow = thead.insertRow();

    // Create header
    headerRow.appendChild(document.createElement('th')).textContent = 'S';
    headerRow.appendChild(document.createElement('th')).textContent = 'R';
    for (let i = 1; i <= schedule.length; i++) {
        headerRow.appendChild(document.createElement('th')).textContent = `${i}`;
    }

    // Populate table
    const playerCount = schedule[0].matches.length * 2; // Total players are twice the number of matches (each match has 2 players)
    for (let player = 1; player <= playerCount; player++) {
        const row = tbody.insertRow();
        row.appendChild(document.createElement('th')).textContent = `${player}`;
        row.appendChild(document.createElement('td')).textContent = `B-M`;

        for (let round of schedule) {
            const match = round.matches.find(m => m.p1.id === player || m.p2.id === player);
            if (match) {
                const opponent = match.p1.id === player ? match.p2.id : match.p1.id;
                const cellText = `${match.court}-${opponent}`;
                row.appendChild(document.createElement('td')).textContent = cellText;
            } else {
                // If no match is found for the player in this round, add an empty cell.
                row.appendChild(document.createElement('td')).textContent = '';
            }
        }
    }
    document.getElementById('matchSetup').appendChild(table);
}


function displayTournamentOverview(tournament) {
    
    // Create tournament info
    const tournamentInfoDiv = document.createElement('div');
    tournamentInfoDiv.id = 'tournamentInfo';
    tournamentInfoDiv.innerHTML = '';
    const tournamentName = document.createElement('h3');
    tournamentName.textContent = tournament.name + ' - ' + tournament.type;
    tournamentInfoDiv.appendChild(tournamentName);
    
    const mainContainer = document.getElementById('mainContainer');
    mainContainer.appendChild(tournamentInfoDiv);

    const matchOverviewContainer = document.getElementById('matchOverview');
    


    // Display matches
    displayMatchOverview(tournament, matchOverviewContainer, tournamentInfoDiv);

    if(tournament.type === 'NHM') {

    }
    
    
}

function displayMatchOverview(tournament, matchOverviewContainer, tournamentInfoDiv) {
    // if the tournament is NHM, sort the rounds in descending order
    matchOverviewContainer.innerHTML = '';
    switch (tournament.type) {
        case 'NHM':
            const nextRoundButton = proceedToNextRoundBtn(tournament);
            tournamentInfoDiv.appendChild(nextRoundButton);
            const toggleAllRoundsButton = toggleAllRoundsBtn(tournament);
            tournamentInfoDiv.appendChild(toggleAllRoundsButton);

            tournament.schedule.sort((a, b) => a.roundNumber - b.roundNumber);
            console.log('Gametype is ', tournament.type, ". Sorting rounds in descending order", tournament.schedule);
            console.log('Round', tournament.schedule[0].roundNumber);

            if (showAllRounds) {
                // Display all rounds
                for (let index of tournament.schedule) {
                    displayRound(index, matchOverviewContainer);
                }
            } else {
                // Only display the last round
                const lastRound = tournament.schedule[tournament.schedule.length - 1];
                displayRound(lastRound, matchOverviewContainer);
            }
            break;
        default:
            // Display all rounds for other tournament types
            for (let index of tournament.schedule) {
                displayRound(index, matchOverviewContainer);
            }
            break;
    }
}

function displayRound(round, matchOverviewContainer) {
    const roundText = document.createElement('h3');
    roundText.textContent = `Runde ${round.roundNumber}`;
    matchOverviewContainer.appendChild(roundText);

    const table = document.createElement('table');
    table.id = 'matchTable-' + round.roundNumber;
    const thead = table.createTHead();
    const tbody = table.appendChild(document.createElement('tbody'));
    const headerRow = thead.insertRow();

    // Create header
    ['B', 'P1', 'S1', 'S2', 'P2', ''].forEach(text => {
        headerRow.appendChild(document.createElement('th')).textContent = text;
    });

    for (let match of round.matches) {
        const row = tbody.insertRow();

        const confirmButton = document.createElement('button');
        confirmButton.id = 'confirmButton-' + match.matchId;
        confirmButton.classList.add('confirm-scores-btn');
        confirmButton.textContent = 'Bekreft';

        const editScoresButton = document.createElement('button');
        editScoresButton.id = 'editScoresButton-' + match.matchId;
        editScoresButton.classList.add('edit-scores-btn');
        editScoresButton.textContent = '+';

        row.appendChild(document.createElement('td')).textContent = match.court;

        const p1NameCell = document.createElement('td');
        p1NameCell.classList.add('fade-in');
        p1NameCell.textContent = match.p1.name;
        row.appendChild(p1NameCell);

        const p1ScoreCell = document.createElement('td');
        p1ScoreCell.id = 'p1-score-' + match.matchId;
        p1ScoreCell.textContent = match.p1.scorePoints;
        p1ScoreCell.addEventListener('click', function() {
            openScorePopup(match, match.p1, match.p2);
        });
        row.appendChild(p1ScoreCell);

        const p2ScoreCell = document.createElement('td');
        p2ScoreCell.id = 'p2-score-' + match.matchId;
        p2ScoreCell.textContent = match.p2.scorePoints;
        p2ScoreCell.addEventListener('click', function() {
            openScorePopup(match, match.p1, match.p2);
        });
        row.appendChild(p2ScoreCell);

        const p2NameCell = document.createElement('td');
        p2NameCell.classList.add('fade-in');
        p2NameCell.textContent = match.p2.name;
        row.appendChild(p2NameCell);

        // Create a cell to hold the buttons
        const buttonCell = document.createElement('td');
        buttonCell.classList.add('button-cell-container');
        buttonCell.appendChild(editScoresButton);
        buttonCell.appendChild(confirmButton);
        row.appendChild(buttonCell);

        confirmButton.disabled = true;
        confirmButton.addEventListener('click', function() {
            if(match.p1.scorePoints < 21 && match.p2.scorePoints < 21) {
                alert('Ingen spillere kan ha mindre enn 21 poeng');
                return;
            }
            updateTotalScores(match.p1.id, match.p2.id, match.p1.scorePoints, match.p2.scorePoints);
            confirmButton.textContent = 'Bekreftet';
            confirmButton.disabled = true;
            editScoresButton.disabled = true;
        });

        handleWalkover(match, p1ScoreCell, p2ScoreCell, confirmButton, editScoresButton);


        editScoresButton.addEventListener('click', function() {
            openScorePopup(match, match.p1, match.p2);
        });

        setTimeout(() => {
            p1NameCell.classList.add('visible');
        }, 100 * (round.matches.indexOf(match) * 2)); // Adjust the delay as needed

        setTimeout(() => {
            p2NameCell.classList.add('visible');
        }, 100 * (round.matches.indexOf(match) * 2 + 1)); // Adjust the delay as needed
    }
    document.getElementById('matchOverview').appendChild(table);
}

function handleWalkover(match, p1ScoreCell, p2ScoreCell, confirmButton, editScoresButton) {
    const isWalkover = match.p1.name === 'Walkover' || match.p2.name === 'Walkover';
    if (isWalkover) {
        match.p1.scorePoints = match.p1.name === 'Walkover' ? 0 : 21;
        match.p2.scorePoints = match.p2.name === 'Walkover' ? 0 : 21;
        p1ScoreCell.textContent = match.p1.scorePoints;
        p2ScoreCell.textContent = match.p2.scorePoints;
        editScoresButton.disabled = true;
        confirmButton.disabled = false;
    }
}

function updateScoreDisplay(match, player1Score, player2Score) {
    const p1ScoreCell = document.getElementById(`p1-score-${match.matchId}`);
    const p2ScoreCell = document.getElementById(`p2-score-${match.matchId}`);
    const confirmButton = document.getElementById('confirmButton-' + match.matchId);
    confirmButton.disabled = false;
    match.p1.scorePoints = player1Score;
    match.p2.scorePoints = player2Score;
    p1ScoreCell.textContent = match.p1.scorePoints;
    p2ScoreCell.textContent = match.p2.scorePoints;
}



function displayPlayerOverview() {

    const playerOverviewContainer = document.getElementById('playerOverview');
    playerOverviewContainer.innerHTML = '';

    const resultText = document.createElement('h3');
    resultText.textContent = `Stilling`;

    const table = document.createElement('table');
    table.id = 'playerTable';
    const thead = table.createTHead();
    const theadForButtons = table.createTHead();
    const headerRowForButtons = theadForButtons.insertRow();
    headerRowForButtons.appendChild(document.createElement('th')).appendChild(addPlayerBtn());
    const tbody = table.appendChild(document.createElement('tbody'));
    const headerRow = thead.insertRow();
    headerRow.appendChild(document.createElement('th')).textContent = 'Pl.';

    headerRow.appendChild(document.createElement('th')).textContent = 'Navn';
    headerRow.appendChild(document.createElement('th')).textContent = 'SP';
    //headerRow.appendChild(document.createElement('th')).textContent = 'Ringer';
    headerRow.appendChild(document.createElement('th')).textContent = 'KP';

    // Sort players by matchPoints and then by scorePoints
    const sortedPlayers = players.slice().sort((a, b) => {
        if (b.matchPoints !== a.matchPoints) {
            return b.matchPoints - a.matchPoints;
        }
        return b.scorePoints - a.scorePoints;
    });

    for (let player of sortedPlayers) {
        const row = tbody.insertRow();
        row.setAttribute('data-player-id', player.id);
        row.appendChild(document.createElement('td')).textContent = sortedPlayers.indexOf(player) + 1;

        // Create a editable cell for the player name
        const playerNameCell = document.createElement('td');
        playerNameCell.classList.add('player-name');
        playerNameCell.textContent = player.name;
        playerNameCell.addEventListener('click', function() {
            // Your onClick event handler code here
            console.log('Player clicked:', player.id);
            const currentRowIndex = Array.from(playerOverviewContainer.getElementsByTagName('tr')).indexOf(row);
            editInCell(playerNameCell, player.id, currentRowIndex);
        });
        row.appendChild(playerNameCell);
        row.appendChild(document.createElement('td')).textContent = player.scorePoints;
        //row.appendChild(document.createElement('td')).textContent = player.totalRingers;
        const totalPointsCell = document.createElement('td');
        totalPointsCell.classList.add('total-points');
        totalPointsCell.textContent = player.matchPoints;
        row.appendChild(totalPointsCell);
    }
    playerOverviewContainer.appendChild(resultText);
    playerOverviewContainer.appendChild(table);
}

function editCellValue(newValue, player) {    
    if (newValue && typeof newValue === 'string') {
        console.log('Editing player name:', newValue, " old name:", player.name, " type:", typeof player.name);
        player.name = newValue;
        localStorage.setItem('players', JSON.stringify(players));
        displayPlayerOverview();
        console.log("players: ", players)
        
    }
}

function editInCell(cell, playerId, currentRowIndex) {
    const originalValue = cell.textContent;
    const input = document.createElement('input');
    const confirmButton = document.createElement('button');
    confirmButton.id = 'confirmButton' + playerId;
    confirmButton.classList.add('confirmPlayerNameButton');
    confirmButton.textContent = 'OK';
    input.type = 'text';
    input.value = originalValue;
    cell.textContent = '';
    cell.appendChild(input);
    cell.appendChild(confirmButton);

    const player = players.find(p => p.id === playerId);

    function handleEvent(event) {
        if (event.type === 'click' || (event.type === 'keypress' && event.key === 'Enter')) {
            addNewValues();
        }
    }

    confirmButton.addEventListener('click', handleEvent);
    input.addEventListener('keypress', handleEvent);

    function addNewValues() {
        const newValue = input.value;
        cell.textContent = newValue;
        editCellValue(newValue, player, players);
        goToNextPlayer(currentRowIndex + 1);
    }

        // Stop event propagation when clicking inside the input
        input.addEventListener('click', function(event) {
            event.stopPropagation();
            input.focus();
            input.select();
        });

    input.focus();
    input.select();
}

function goToNextPlayer(currentRowIndex) {
    const playerTable = document.getElementById('playerTable');
    const playerRows = playerTable.getElementsByTagName('tr');
    let nextRow;

    if (currentRowIndex < playerRows.length) {
        nextRow = playerRows[currentRowIndex];
        console.log('Going to next row:', nextRow);
    } else {
        console.log('No more rows to edit.');
        return;
    }

    if (nextRow) {
        const nextRowPlayerNameCell = nextRow.getElementsByClassName('player-name')[0];
        const nextPlayerId = parseInt(nextRow.getAttribute('data-player-id'));
        console.log('Going to next player:', nextPlayerId);
        editInCell(nextRowPlayerNameCell, nextPlayerId, currentRowIndex);
    }
}

function addNewPlayer(playerName) {
    //const newPlayerName = document.getElementById('newPlayerName').value;
    const newPlayerName = playerName ? playerName : prompt('Navn på ny spiller:');
    if (newPlayerName) {
        const newPlayer = {
            id: players.length + 1,
            name: newPlayerName,
            scorePoints: 0,
            matchPoints: 0,
            totalRingers: 0
        };
        players.push(newPlayer);
        localStorage.setItem('players', JSON.stringify(players));
        displayPlayerOverview();
        totalPlayers = players.length;
        console.log('Added new player:', newPlayer);
    }
}

function addPlayerBtn() {
    const addPlayerButton = document.createElement('button');
    addPlayerButton.id = 'addPlayerButton';
    addPlayerButton.textContent = 'Legg til spiller';
    addPlayerButton.addEventListener('click', function() {
        addNewPlayer();
    });
    return addPlayerButton;
}

// function deletePlayer(playerId) {
//     const playerIndex = players.findIndex(p => p.id === playerId);
//     players.splice(playerIndex, 1);
//     localStorage.setItem('players', JSON.stringify(players));
//     displayPlayerOverview();
// }





