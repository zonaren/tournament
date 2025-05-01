import Players from './classes/Player.js';

/**
 * Creates and returns the table header row for the player overview
 * @returns {HTMLTableRowElement} The header row element
 */
function createTableHeader() {
    const headerRow = document.createElement('tr');
    const headers = ['Pl.', 'S', 'Navn', 'SP', 'KP'];
    
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

    const startNumberCell = document.createElement('td');
    startNumberCell.textContent = player.id;
    row.appendChild(startNumberCell);

    // Name column (no direct edit on click)
    const nameCell = createNameCell(player);
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

    // Add context menu event (right click)
    row.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        showPlayerContextMenu(e, player, row, playerOverviewContainer);
    });
    // (Left click context menu removed)
    return row;
}

// Name cell without edit-on-click (single definition)
// (Already defined below, so this duplicate is removed)


// Context menu logic for player rows
function showPlayerContextMenu(e, player, row, container) {
    // If called from left click, delay adding the outside click listener until after the menu is shown
    // so the click that opened the menu doesn't immediately close it
    const isLeftClick = arguments[4] === true;
    removeExistingPlayerContextMenu();
    const menu = document.createElement('div');
    menu.className = 'player-context-menu';
    menu.style.top = `${e.clientY}px`;
    menu.style.left = `${e.clientX}px`;

    // Add new player option
    const newPlayerBtn = document.createElement('button');
    newPlayerBtn.className = 'player-context-menu__item';
    newPlayerBtn.textContent = 'Ny spiller';
    newPlayerBtn.onclick = function(ev) {
        ev.stopPropagation();
        removeExistingPlayerContextMenu();
        createNewPlayerPrompt();
    };
    menu.appendChild(newPlayerBtn);
    

    // Edit option
    const editBtn = document.createElement('button');
    editBtn.className = 'player-context-menu__item';
    editBtn.textContent = 'Rediger';
    editBtn.onclick = function(ev) {
        ev.stopPropagation();
        removeExistingPlayerContextMenu();
        // Find the name cell and start edit
        const nameCell = row.querySelector('.player-name');
        const currentRowIndex = Array.from(container.getElementsByTagName('tr')).indexOf(row);
        startCellEdit(nameCell, player.id, currentRowIndex);
    };
    menu.appendChild(editBtn);

    // Delete option
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'player-context-menu__item';
    deleteBtn.textContent = 'Slett';
    deleteBtn.onclick = function(ev) {
        ev.stopPropagation();
        removeExistingPlayerContextMenu();
        if (confirm('Er du sikker på at du vil slette denne spilleren?')) {
            Players.delete(player.id);
            shuffleStartNumbers();
        }
    };
    menu.appendChild(deleteBtn);

    document.body.appendChild(menu);

    // Remove menu on click elsewhere
    if (isLeftClick) {
        setTimeout(() => {
            document.addEventListener('mousedown', removeExistingPlayerContextMenu, { once: true });
        }, 0);
    } else {
        setTimeout(() => {
            document.addEventListener('click', removeExistingPlayerContextMenu, { once: true });
        }, 0);
    }
}

function removeExistingPlayerContextMenu() {
    const existing = document.querySelector('.player-context-menu');
    if (existing) existing.remove();
}

// Name cell without edit-on-click
function createNameCell(player) {
    const cell = document.createElement('td');
    cell.classList.add('player-name');
    cell.textContent = player.name;
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
    playerOverview.appendChild(table);
    
    // Update the table contents
    updatePlayerTable();
}

function createButtonsContainer() {
    const container = document.createElement('div');
    container.classList.add('buttons-container');
    container.appendChild(createAddPlayerButton());
    container.appendChild(createShuffleButton());
    return container;
}

/**
 * Creates a new player
 * @param {string} [playerName] - Optional name for the new player
 */
function createNewPlayerPrompt() {
    // Instantly add a new player with default name, update table, and select the name input for editing
    const mainContainer = document.getElementById('mainContainer');
    const newPlayer = Players.create(Players.count() + 1); // Uses default name
    displayPlayerOverview(mainContainer);
    // Find the new player's row and start editing the name
    setTimeout(() => {
        const table = document.getElementById('playerTable');
        if (!table) return;
        const rows = table.getElementsByTagName('tr');
        // Find the row with the highest player id (newest player)
        let maxId = -1, targetRow = null, rowIndex = -1;
        for (let i = 0; i < rows.length; i++) {
            const id = parseInt(rows[i].getAttribute('data-player-id'));
            if (!isNaN(id) && id > maxId) {
                maxId = id;
                targetRow = rows[i];
                rowIndex = i;
            }
        }
        if (targetRow) {
            const nameCell = targetRow.querySelector('.player-name');
            if (nameCell) {
                startCellEdit(nameCell, maxId, rowIndex);
            }
        }
    }, 0);
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

function createShuffleButton() {
    const button = document.createElement('button');
    button.id = 'shuffleStartNumbers';
    button.textContent = 'Tilfeldige startnummer';
    button.addEventListener('click', () => shuffleStartNumbers());
    return button;
}

function shuffleStartNumbers() {
    const players = Players.getAll();
    const shuffled = shuffle(players);
    shuffled.forEach((player, index) => {
        player.id = index + 1;
    });
    Players.saveToLocalStorage();
    updatePlayerTable();
}

function shuffle(array) {

    const shuffled = [...array]
        .map(a => ({sort: Math.random(), value: a}))
        .sort((a, b) => a.sort - b.sort)
        .map(a => a.value);

    return shuffled;
}

export { displayPlayerOverview, updatePlayerTable, createButtonsContainer };