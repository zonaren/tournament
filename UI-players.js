import  Players from './classes/Player.js';

export function displayPlayerOverview() {

    const playerOverviewContainer = document.getElementById('playerOverview');
    playerOverviewContainer.innerHTML = '';

    const resultText = document.createElement('h3');
    resultText.textContent = `${Players.count()} spillere`;

    const table = document.createElement('table');
    table.id = 'playerTable';
    const thead = table.createTHead();

    const tbody = table.appendChild(document.createElement('tbody'));
    const headerRow = thead.insertRow();
    headerRow.appendChild(document.createElement('th')).textContent = 'Pl.';

    headerRow.appendChild(document.createElement('th')).textContent = 'Navn';
    headerRow.appendChild(document.createElement('th')).textContent = 'SP';
    //headerRow.appendChild(document.createElement('th')).textContent = 'Ringer';
    headerRow.appendChild(document.createElement('th')).textContent = 'KP';

    // Sort players by matchPoints and then by scorePoints
    const sortedPlayers = Players.getAll().slice().sort((a, b) => {
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
            if(matchSchedule.length > 0) {
                alert('Spillere kan ikke endres etter at turneringen har startet');
                return;
            }
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
        if(player.name === 'Walkover') {
            row.remove();
        }
    }
    playerOverviewContainer.appendChild(resultText);
    playerOverviewContainer.appendChild(addPlayerBtn());
    playerOverviewContainer.appendChild(table);
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

function editCellValue(newValue, player) {    
    if (newValue && typeof newValue === 'string') {
        console.log('Editing player name:', newValue, " old name:", player.name, " type:", typeof player.name);
        player.name = newValue;
        localStorage.setItem('players', JSON.stringify(players));
        displayPlayerOverview();
        console.log("players: ", players)
        
    }
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