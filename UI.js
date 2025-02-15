

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
        row.appendChild(document.createElement('td')).textContent = `B/M`;

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
    console.log("Table appended to document:", table); // Log the table element
    document.getElementById('matchSetup').appendChild(table);
}

//displayTournamentSchedule(schedule);

function displayTournamentOverview(tournament) {
    //remove match setup
    const matchSetupContainer = document.getElementById('matchSetup');
    matchSetupContainer.innerHTML = '';
    // Create tournament info
    const tournamentInfoDiv = document.getElementById('tournamentInfo');
    
    const tournamentName = document.createElement('h1');
    tournamentName.textContent = tournament.name + ' - ' + tournament.type;
    tournamentInfoDiv.appendChild(tournamentName);
    const tournamentDate = document.createElement('h2');
    tournamentDate.textContent = tournament.dateCreated;
    tournamentInfoDiv.appendChild(tournamentDate);

    const matchOverviewContainer = document.getElementById('matchOverview');
    matchOverviewContainer.innerHTML = '';


    // Populate table
    for (let round of tournament.schedule) {

        const roundText = document.createElement('h3');
        roundText.textContent = `Runde ${round.roundNumber}`;
        matchOverviewContainer.appendChild(roundText);
        const table = document.createElement('table');
        const thead = table.createTHead();
        const tbody = table.appendChild(document.createElement('tbody'));
        const headerRow = thead.insertRow();
                // Create header
        //headerRow.appendChild(document.createElement('th')).textContent = 'Kamp';
        headerRow.appendChild(document.createElement('th')).textContent = 'B';
        headerRow.appendChild(document.createElement('th')).textContent = 'P1';
        headerRow.appendChild(document.createElement('th')).textContent = 'S1';
        headerRow.appendChild(document.createElement('th')).textContent = 'S2';
        headerRow.appendChild(document.createElement('th')).textContent = 'P2';
        for (let match of round.matches) {
            const row = tbody.insertRow();
            //row.appendChild(document.createElement('td')).textContent = match.matchId;
            row.appendChild(document.createElement('td')).textContent = match.court;
            row.appendChild(document.createElement('td')).textContent = match.p1.name;
                    // Create a editable cell for the player name
        const cell = document.createElement('td');
        cell.textContent = match.p1.score;
        cell.addEventListener('click', function() {
            // Your onClick event handler code here
            console.log('Player clicked:', match.p1.id);
            editInCell(cell, match.p1.id);
        });
            row.appendChild(document.createElement('td')).textContent = match.p2.score;
            row.appendChild(document.createElement('td')).textContent = match.p2.name;

        }
        document.getElementById('matchOverview').appendChild(table);
    }
    
}

function displayPlayerOverview() {
    const playerOverviewContainer = document.getElementById('playerOverview');
    playerOverviewContainer.innerHTML = '';
    const players = JSON.parse(localStorage.getItem('players'));

    const resultText = document.createElement('h2');
    resultText.textContent = `Resultater`;

    const table = document.createElement('table');
    const thead = table.createTHead();
    const tbody = table.appendChild(document.createElement('tbody'));
    const headerRow = thead.insertRow();
    headerRow.appendChild(document.createElement('th')).textContent = 'Id';
    headerRow.appendChild(document.createElement('th')).textContent = 'S';
    headerRow.appendChild(document.createElement('th')).textContent = 'SP';
    //headerRow.appendChild(document.createElement('th')).textContent = 'Ringer';
    headerRow.appendChild(document.createElement('th')).textContent = 'KP';
    for (let player of players) {
        const row = tbody.insertRow();
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
        row.appendChild(document.createElement('td')).textContent = player.totalPoints;
        //row.appendChild(document.createElement('td')).textContent = player.totalRingers;
        row.appendChild(document.createElement('td')).textContent = player.totalScore;
    }
    playerOverviewContainer.appendChild(resultText);
    playerOverviewContainer.appendChild(table);
}

function editCellValue(newValue, player, players) {
    
    
    if (newValue && typeof newValue === 'string') {
        console.log('Editing player name:', newValue, " old name:", player.name, " type:", typeof player.name);
        player.name = newValue;
        localStorage.setItem('players', JSON.stringify(players));
        displayPlayerOverview();
    }
}

function editInCell(cell, playerId) {
    const originalValue = cell.textContent;
    const input = document.createElement('input');
    input.type = 'text';
    input.value = originalValue;
    cell.textContent = '';
    cell.appendChild(input);
    const players = JSON.parse(localStorage.getItem('players'));
    const player = players.find(p => p.id === playerId);

    input.addEventListener('blur', function() {
        const newValue = input.value;
        cell.textContent = newValue;
        editCellValue(newValue, player, players);
    });

    input.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            input.blur();
        }
    });

    input.focus();
}

