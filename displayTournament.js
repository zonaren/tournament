

function displayTournamentSchedule(schedule) {
    const scheduleContainer = document.getElementById('tournamentSchedule');
    scheduleContainer.innerHTML = '';
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
    document.getElementById('tournamentSchedule').appendChild(table);
}

displayTournamentSchedule(tournamentSchedule);

function displayMatchOverview(schedule) {
    const scheduleContainer = document.getElementById('tournamentSchedule');
    scheduleContainer.innerHTML = '';
    const matchOverviewContainer = document.getElementById('matchOverview');
    matchOverviewContainer.innerHTML = '';
    const tournamentName = document.createElement('h1');
    tournamentName.textContent = schedule[0].name + ' - ' + schedule[0].type;
    matchOverviewContainer.appendChild(tournamentName);
    const tournamentDate = document.createElement('h2');
    tournamentDate.textContent = schedule[0].date;
    matchOverviewContainer.appendChild(tournamentDate);


    // Populate table
    for (let round of schedule) {
        const h1 = document.createElement('h1');
        h1.textContent = `Runde ${round.roundNumber}`;
        matchOverviewContainer.appendChild(h1);
        const table = document.createElement('table');
        const thead = table.createTHead();
        const tbody = table.appendChild(document.createElement('tbody'));
        const headerRow = thead.insertRow();
                // Create header
        //headerRow.appendChild(document.createElement('th')).textContent = 'Kamp';
        headerRow.appendChild(document.createElement('th')).textContent = 'Bane';
        headerRow.appendChild(document.createElement('th')).textContent = 'Spiller 1';
        headerRow.appendChild(document.createElement('th')).textContent = 'Score';
        headerRow.appendChild(document.createElement('th')).textContent = 'Score';
        headerRow.appendChild(document.createElement('th')).textContent = 'Spiller 2';
        for (let match of round.matches) {
            const row = tbody.insertRow();
            //row.appendChild(document.createElement('td')).textContent = match.matchId;
            row.appendChild(document.createElement('td')).textContent = match.court;
            row.appendChild(document.createElement('td')).textContent = match.p1.name;
            row.appendChild(document.createElement('td')).textContent = match.p1.score;
            row.appendChild(document.createElement('td')).textContent = match.p2.score;
            row.appendChild(document.createElement('td')).textContent = match.p2.name;

        }
        document.getElementById('matchOverview').appendChild(table);
    }
    
}
