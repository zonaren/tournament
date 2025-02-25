import Players from './classes/Player.js';

/**
 * Creates and returns the table header row for the player overview
 * @returns {HTMLTableRowElement} The header row element
 */
function createTableHeader() {
    const headerRow = document.createElement('tr');
    const headers = ['Pl.', 'Navn', 'SP', 'KP'];
    
    headers.forEach(text => {
        const th = document.createElement('th');
        th.textContent = text;
        headerRow.appendChild(th);
    });
    
    return headerRow;
}

/**
 * Creates a player row in the table
 * @param {Player} player - The player object
 * @param {number} index - The player's position in the ranking
 * @param {HTMLElement} playerOverviewContainer - The container element
 * @returns {HTMLTableRowElement} The created row element
 */
function createPlayerRow(player, index, playerOverviewContainer) {
    const row = document.createElement('tr');
    row.setAttribute('data-player-id', player.id);

    // Position column
    const positionCell = document.createElement('td');
    positionCell.textContent = index + 1;
    row.appendChild(positionCell);

    // Name column with edit functionality
    const nameCell = createEditableNameCell(player, row, playerOverviewContainer);
    row.appendChild(nameCell);

    // Score points column
    const scoreCell = document.createElement('td');
    scoreCell.textContent = player.scorePoints;
    row.appendChild(scoreCell);

    // Match points column
    const matchPointsCell = document.createElement('td');
    matchPointsCell.classList.add('total-points');
    matchPointsCell.textContent = player.matchPoints;
    row.appendChild(matchPointsCell);

    return row;
}

/**
 * Creates an editable cell for the player name
 * @param {Player} player - The player object
 * @param {HTMLTableRowElement} row - The row containing the cell
 * @param {HTMLElement} container - The container element
 * @returns {HTMLTableCellElement} The created cell element
 */
function createEditableNameCell(player, row, container) {
    const cell = document.createElement('td');
    cell.classList.add('player-name');
    cell.textContent = player.name;
    
    cell.addEventListener('click', () => {
        if (window.matchSchedule?.length > 0) {
            alert('Spillere kan ikke endres etter at turneringen har startet');
            return;
        }
        const currentRowIndex = Array.from(container.getElementsByTagName('tr')).indexOf(row);
        startCellEdit(cell, player.id, currentRowIndex);
    });
    
    return cell;
}

/**
 * Initiates the edit mode for a cell
 * @param {HTMLTableCellElement} cell - The cell to edit
 * @param {number} playerId - The ID of the player
 * @param {number} currentRowIndex - The current row index
 */
function startCellEdit(cell, playerId, currentRowIndex) {
    const input = document.createElement('input');
    const confirmButton = document.createElement('button');
    
    input.type = 'text';
    input.value = cell.textContent;
    
    confirmButton.id = 'confirmButton' + playerId;
    confirmButton.classList.add('confirmPlayerNameButton');
    confirmButton.textContent = 'OK';
    
    cell.textContent = '';
    cell.appendChild(input);
    cell.appendChild(confirmButton);

    const handleConfirm = () => {
        updatePlayerName(input.value, playerId);
        navigateToNextPlayer(currentRowIndex + 1);
    };

    confirmButton.addEventListener('click', handleConfirm);
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleConfirm();
    });
    input.addEventListener('click', (e) => {
        e.stopPropagation();
        input.focus();
        input.select();
    });

    input.focus();
    input.select();
}

/**
 * Updates a player's name
 * @param {string} newName - The new name for the player
 * @param {number} playerId - The ID of the player to update
 */
function updatePlayerName(newName, playerId) {
    if (newName && typeof newName === 'string') {
        const player = Players.get(playerId);
        player.name = newName;
        Players.saveToLocalStorage();
        const mainContainer = document.getElementById('mainContainer');
        displayPlayerOverview(mainContainer);
    }
}

/**
 * Navigates to the next player for editing
 * @param {number} nextRowIndex - The index of the next row
 */
function navigateToNextPlayer(nextRowIndex) {
    const playerTable = document.getElementById('playerTable');
    const rows = playerTable.getElementsByTagName('tr');
    
    if (nextRowIndex < rows.length) {
        const nextRow = rows[nextRowIndex];
        const nameCell = nextRow.getElementsByClassName('player-name')[0];
        const playerId = parseInt(nextRow.getAttribute('data-player-id'));
        startCellEdit(nameCell, playerId, nextRowIndex);
    }
}

/**
 * Creates a new player
 * @param {string} [playerName] - Optional name for the new player
 */
function createNewPlayerPrompt(playerName) {
    const name = playerName || prompt('Navn på ny spiller:');
    const mainContainer = document.getElementById('mainContainer');
    if (name) {
        Players.create(Players.count() + 1, name);
        displayPlayerOverview(mainContainer);
    }
}

/**
 * Creates the "Add Player" button
 * @returns {HTMLButtonElement} The created button
 */
function createAddPlayerButton() {
    const button = document.createElement('button');
    button.id = 'addPlayerButton';
    button.textContent = 'Legg til spiller';
    button.addEventListener('click', () => createNewPlayerPrompt());
    return button;
}

/**
 * Displays the player overview table
 */
function displayPlayerOverview(parentContainer) {
    let playerOverview = document.getElementById('playerOverview');
    if (!playerOverview) {
        playerOverview = document.createElement('div');
        playerOverview.id = 'playerOverview';
        parentContainer.appendChild(playerOverview);
    }
    playerOverviewContent(playerOverview);
}

/**
 * Updates only the player table contents
 */
function updatePlayerTable() {
    const table = document.getElementById('playerTable');
    if (!table) return;
    
    // Clear existing tbody
    const tbody = table.getElementsByTagName('tbody')[0];
    tbody.innerHTML = '';
    
    const sortedPlayers = Players.getAll()
        .sort((a, b) => b.matchPoints !== a.matchPoints
            ? b.matchPoints - a.matchPoints
            : b.scorePoints - a.scorePoints);

    sortedPlayers
        .filter(player => player.name !== 'Walkover')
        .forEach((player, index) => {
            tbody.appendChild(createPlayerRow(player, index, table.parentElement));
        });
    
    // Update player count
    const playerCount = document.querySelector('#playerOverview h3');
    if (playerCount) {
        playerCount.textContent = `${Players.count()} spillere`;
    }
}

function playerOverviewContent(playerOverview) {
    // Clear existing content
    playerOverview.innerHTML = '';
    
    const playerCount = document.createElement('h3');
    playerCount.textContent = `${Players.count()} spillere`;

    const table = document.createElement('table');
    table.id = 'playerTable';
    
    const thead = table.createTHead();
    thead.appendChild(createTableHeader());
    
    table.createTBody(); // Create empty tbody

    playerOverview.appendChild(playerCount);
    playerOverview.appendChild(createAddPlayerButton());
    playerOverview.appendChild(table);
    
    // Update the table contents
    updatePlayerTable();
}

export { displayPlayerOverview, updatePlayerTable };