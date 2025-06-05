export function displayMatchSetup(matchSetup, playerCount) {
    console.log('Displaying match setup:', matchSetup);
    const mainContainer = document.getElementById('mainContainer');
    mainContainer.innerHTML = '';
    const matchSetupContainer = document.createElement('div');
    matchSetupContainer.id = 'matchSetup';
    const table = document.createElement('table');
    table.id = 'matchSetupTable';
    const thead = table.createTHead();
    const tbody = table.appendChild(document.createElement('tbody'));
    const headerRow = thead.insertRow();

    // Create header
    headerRow.appendChild(document.createElement('th')).textContent = 'S';
    headerRow.appendChild(document.createElement('th')).textContent = 'R';
    for (let i = 1; i <= matchSetup.length; i++) {
        headerRow.appendChild(document.createElement('th')).textContent = `${i}`;
    }

    // Populate table
    //const playerCount = matchSetup.length * 2; // Total players are twice the number of matches (each match has 2 players)
    console.log('Match setup:', matchSetup);
    for (let player = 1; player <= playerCount; player++) {
        const row = tbody.insertRow();
        row.appendChild(document.createElement('th')).textContent = `${player}`;
        row.appendChild(document.createElement('td')).textContent = `B-M`;

        for (let round of matchSetup) {
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
    mainContainer.appendChild(matchSetupContainer);
    document.getElementById('matchSetup').appendChild(table);
}