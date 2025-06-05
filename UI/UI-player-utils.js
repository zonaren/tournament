// Utility functions for editing players (moved from UI-players.js)
import Players from './classes/Player.js';
import { onEditPlayers } from './events.js';

/**
 * Name cell without edit-on-click
 */
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

    const handleConfirm = (navigateNext) => {
        // Save name and close input
        updatePlayerName(input.value, playerId);
        // Replace input with updated name cell
        cell.textContent = input.value;
        cell.classList.add('player-name');
        // Optionally, focus next if Enter
        if (navigateNext) {
            navigateToNextPlayer(currentRowIndex + 1);
        }
    };

    confirmButton.addEventListener('click', () => handleConfirm(false));
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleConfirm(true);
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
        // displayPlayerOverview is imported in UI-players.js
        if (typeof window.displayPlayerOverview === 'function') {
            window.displayPlayerOverview(mainContainer);
        }
        onEditPlayers();
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

// Make players that are eliminated less visible (transparency effect)
function makeEliminatedPlayersLessVisible() {
    const playerTable = document.getElementById('playerTable');
    const rows = playerTable.getElementsByTagName('tr');
    
    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const playerId = parseInt(row.getAttribute('data-player-id'));
        const player = Players.get(playerId);
        
        if (player && player.eliminated) {
            row.style.opacity = '0.5'; // Make eliminated players less visible
        } else {
            row.style.opacity = '1'; // Reset for non-eliminated players
        }
    }
}

export { createNameCell, startCellEdit, updatePlayerName, navigateToNextPlayer, makeEliminatedPlayersLessVisible };
