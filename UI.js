

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
    const tournamentInfoDiv = document.getElementById('tournamentInfo');
    tournamentInfoDiv.innerHTML = '';
    const tournamentName = document.createElement('h1');
    tournamentName.textContent = tournament.name + ' - ' + tournament.type;
    tournamentInfoDiv.appendChild(tournamentName);
    const tournamentDate = document.createElement('h2');
    tournamentDate.textContent = tournament.dateCreated;
    tournamentInfoDiv.appendChild(tournamentDate);

    const matchOverviewContainer = document.getElementById('matchOverview');
    matchOverviewContainer.innerHTML = '';


    // Display matches
    displayMatchOverview(tournament, matchOverviewContainer);
    
}

function displayMatchOverview(tournament, matchOverviewContainer) {
    for (let round of tournament.schedule) {

        const roundText = document.createElement('h3');
        roundText.textContent = `Runde ${round.roundNumber}`;
        matchOverviewContainer.appendChild(roundText);
        const table = document.createElement('table');
        const thead = table.createTHead();
        const tbody = table.appendChild(document.createElement('tbody'));
        const headerRow = thead.insertRow();

        const confirmButton = document.createElement('button');
        confirmButton.id = 'confirmButton';
        confirmButton.textContent = 'Bekreft';

        // Create header
        //headerRow.appendChild(document.createElement('th')).textContent = 'Kamp';
        headerRow.appendChild(document.createElement('th')).textContent = 'B';
        headerRow.appendChild(document.createElement('th')).textContent = 'P1';
        headerRow.appendChild(document.createElement('th')).textContent = 'S1';
        headerRow.appendChild(document.createElement('th')).textContent = 'S2';
        headerRow.appendChild(document.createElement('th')).textContent = 'P2';
        headerRow.appendChild(document.createElement('th')).textContent = '';
        for (let match of round.matches) {
            const row = tbody.insertRow();

            const confirmButton = document.createElement('button');
            confirmButton.id = 'confirmButton-' + match.matchId;
            confirmButton.textContent = 'Bekreft';

            row.appendChild(document.createElement('td')).textContent = match.court;
            row.appendChild(document.createElement('td')).textContent = match.p1.name;
            const p1ScoreCell = document.createElement('td');
            p1ScoreCell.id = 'p1-score-' + match.matchId;
            p1ScoreCell.textContent = match.p1.scorePoints;
            p1ScoreCell.addEventListener('click', function() {
                openScorePopup(match, match.p1, match.p2);
            });
            row.appendChild(p1ScoreCell);

            const p2ScoreCell = document.createElement('td');
            p2ScoreCell.id = 'p2-score-' + match.matchId;
            p2ScoreCell.textContent = match.p2.matchPoints;
            p2ScoreCell.addEventListener('click', function() {
                openScorePopup(match, match.p1, match.p2);
            });
            row.appendChild(p2ScoreCell);    row.appendChild(document.createElement('td')).textContent = match.p2.name;
            row.appendChild(confirmButton);
            confirmButton.addEventListener('click', function() {
                updateTotalScores(match.p1.id, match.p2.id, match.p1.scorePoints, match.p2.scorePoints);
                confirmButton.textContent = 'Bekreftet';
                confirmButton.disabled = true;

            });

        }
        document.getElementById('matchOverview').appendChild(table);
    }
}

function openScorePopup(match, player1, player2) {
    let player1Score = 0;
    let player2Score = 0;

    // Create popup container
    const popup = document.createElement('div');
    popup.classList.add('popup');

    // Create match id header
    const matchIdHeader = document.createElement('h2');
    matchIdHeader.textContent = `Kamp ${match.matchId}`;
    console.log("Adding score for match ", match.matchId, " between ", player1.name, " and ", player2.name, " on court ", match.court);
    popup.appendChild(matchIdHeader);
    // create number pad container
    const numberPadContainer = document.createElement('div');
    numberPadContainer.classList.add('number-pads-container');
    popup.appendChild(numberPadContainer);




    // Create number pad for player 1
    const numberPadContainer1 = document.createElement('div');
    numberPadContainer1.classList.add('number-pad-container');

    const player1Info = document.createElement('div');
    player1Info.classList.add('player-info');

    const player1Label = document.createElement('h2');
    player1Label.textContent = player1.name;
    numberPadContainer1.appendChild(player1Info);
    player1Info.appendChild(player1Label);

    const player1ScoreLabel = document.createElement('h1');
    player1ScoreLabel.textContent = player1Score;
    player1Info.appendChild(player1ScoreLabel);

    const numberPad1 = document.createElement('div');
    numberPad1.classList.add('number-pad');
    numberPadContainer1.appendChild(numberPad1);


        for (let i = 0; i <= 9; i++) {
            const button = document.createElement('button');
            button.textContent = i;
            button.addEventListener('click', function() {
                const newScore = parseInt(player1Score.toString() + i.toString());
                if (newScore <= 30) {
                    player1Score = newScore;
                    player1ScoreLabel.textContent = player1Score;
                } else {
                    alert('Score cannot exceed 30');
                    player1Score = 0;
                    player1ScoreLabel.textContent = player1Score;
                }
            });
            numberPad1.appendChild(button);
        }

    // Create number pad for player 1
    const numberPadContainer2 = document.createElement('div');
    numberPadContainer2.classList.add('number-pad-container');

    const player2Info = document.createElement('div');
    player2Info.classList.add('player-info');

    const player2Label = document.createElement('h2');
    player2Label.textContent = player2.name;
    numberPadContainer2.appendChild(player2Info);
    player2Info.appendChild(player2Label);

    const player2ScoreLabel = document.createElement('h1');
    player2ScoreLabel.textContent = player2Score;
    player2Info.appendChild(player2ScoreLabel);

    const numberPad2 = document.createElement('div');
    numberPad2.classList.add('number-pad');
    numberPadContainer2.appendChild(numberPad2);

        for (let i = 0; i <= 9; i++) {
            const button = document.createElement('button');
            button.textContent = i;
            button.addEventListener('click', function() {
                const newScore = parseInt(player2Score.toString() + i.toString());
                if (newScore <= 30) {
                    player2Score = newScore;
                    player2ScoreLabel.textContent = player2Score;
                } else {
                    alert('Score cannot exceed 30');
                    player2Score = 0;
                    player2ScoreLabel.textContent = player2Score;
                }
            });
            numberPad2.appendChild(button);
        }

    // Create confirm button
    const confirmButton = document.createElement('button');
    confirmButton.textContent = 'Lagre';
    confirmButton.addEventListener('click', function() {
        updateScoreDisplay(match, player1Score, player2Score);
        document.body.removeChild(popup);
    });

    numberPadContainer.appendChild(numberPadContainer1);
    numberPadContainer.appendChild(numberPadContainer2);
    popup.appendChild(confirmButton);
    document.body.appendChild(popup);
}

function updateScoreDisplay(match, player1Score, player2Score) {
    const p1ScoreCell = document.getElementById(`p1-score-${match.matchId}`);
    const p2ScoreCell = document.getElementById(`p2-score-${match.matchId}`);
    match.p1.scorePoints = player1Score;
    match.p2.scorePoints = player2Score;
    p1ScoreCell.textContent = match.p1.scorePoints;
    p2ScoreCell.textContent = match.p2.scorePoints;
}

function updateTotalScores(p1id, p2id, p1Score, p2Score) {
    // Calculate total scores
    const player1 = players.find(p => p.id === p1id);
    const player2 = players.find(p => p.id === p2id);
    player1.scorePoints = p1Score;
    player2.scorePoints = p2Score;

    // Update match points
    // if (scorePointsCurrentPlayer >= 21 && scorePointsOtherPlayer < 21) {
    //     player.matchPoints += 2;
    // } else if (scorePointsCurrentPlayer === 21 && scorePointsOtherPlayer === 21) {
    //     player.matchPoints += 1,5;
    // }
    // else if (scorePointsCurrentPlayer < 21 && scorePointsCurrentPlayer >= 11 && scorePointsOtherPlayer >= 21) {
    // player.matchPoints += 1;
    // }
    // else if (scorePointsCurrentPlayer < 11 && scorePointsOtherPlayer >= 21) {
    // player.matchPoints += 0;
    // }
    //player.matchPoints += 1;
    displayPlayerOverview();
}

function displayPlayerOverview() {

    // Sample players data
// const players = [
//     { id: 1, name: 'Player 1', scorePoints: Math.floor(Math.random() * 100), matchPoints: Math.floor(Math.random() * 10) },
//     { id: 2, name: 'Player 2', scorePoints: Math.floor(Math.random() * 100), matchPoints: Math.floor(Math.random() * 10) },
//     { id: 3, name: 'Player 3', scorePoints: Math.floor(Math.random() * 100), matchPoints: Math.floor(Math.random() * 10) },
//     { id: 4, name: 'Player 4', scorePoints: Math.floor(Math.random() * 100), matchPoints: Math.floor(Math.random() * 10) },
//     { id: 5, name: 'Player 5', scorePoints: Math.floor(Math.random() * 100), matchPoints: Math.floor(Math.random() * 10) },
// ];
        //remove match setup
        const matchSetupContainer = document.getElementById('matchSetup');
        matchSetupContainer.innerHTML = '';
        const startTournamentButton = document.getElementById('start-btn');
        startTournamentButton.classList.remove('hidden');
    const playerOverviewContainer = document.getElementById('playerOverview');
    playerOverviewContainer.innerHTML = '';

    const resultText = document.createElement('h2');
    resultText.textContent = `Resultater`;

    const table = document.createElement('table');
    const thead = table.createTHead();
    const tbody = table.appendChild(document.createElement('tbody'));
    const headerRow = thead.insertRow();
    headerRow.appendChild(document.createElement('th')).textContent = 'Pl.';
    headerRow.appendChild(document.createElement('th')).textContent = 'Id';
    headerRow.appendChild(document.createElement('th')).textContent = 'S';
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
        row.appendChild(document.createElement('td')).textContent = sortedPlayers.indexOf(player) + 1;
        row.appendChild(document.createElement('td')).textContent = player.id;
        // Create a editable cell for the player name
        const cell = document.createElement('td');
        cell.textContent = player.name;
        cell.addEventListener('click', function() {
            // Your onClick event handler code here
            console.log('Player clicked:', player.id);
            editInCell(cell, player.id);
        });
        row.appendChild(cell);
        row.appendChild(document.createElement('td')).textContent = player.scorePoints;
        //row.appendChild(document.createElement('td')).textContent = player.totalRingers;
        row.appendChild(document.createElement('td')).textContent = player.matchPoints;
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

function editInCell(cell, playerId) {
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

    confirmButton.addEventListener('click', function() {
        const newValue = input.value;
        cell.textContent = newValue;
        editCellValue(newValue, player, players);
    });

        // Stop event propagation when clicking inside the input
        input.addEventListener('click', function(event) {
            event.stopPropagation();
            input.focus();
    input.select();
        });

    input.focus();
    input.select();
}



