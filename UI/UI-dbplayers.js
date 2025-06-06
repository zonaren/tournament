import Players from '../classes/Player.js';
import Tournaments from '../classes/Tournament.js';
import { updatePlayerTable } from '../UI/UI-players.js';

function getDatabasePlayers() {
    return JSON.parse(localStorage.getItem('databasePlayers')) || [];
}

function filterDatabasePlayers(databasePlayers, currentTournamentPlayers, search, selectedPlayerIds) {
    const searchLower = search.toLowerCase();
    
    return databasePlayers.filter(p => {
        // Only exclude players that are currently selected (in the right column)
        // Players already in tournament should show up if they're not selected (so they can be removed)
        const isCurrentlySelected = selectedPlayerIds && selectedPlayerIds.has(p.Id);
        
        if (isCurrentlySelected) {
            return false;
        }
        
        // Apply search filter
        return (!searchLower ||
            p.Navn?.toLowerCase().includes(searchLower) ||
            p.Klubb?.toLowerCase().includes(searchLower)
        );
    });
}

function createPopupOverlay() {
    const overlay = document.createElement('div');
    overlay.className = 'db-players-overlay';
    return overlay;
}

function createPopupContainer() {
    const popup = document.createElement('div');
    popup.className = 'db-players-popup';
    return popup;
}

function createSearchInput() {
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = 'Søk etter navn eller klubb...';
    searchInput.className = 'db-players-search';
    return searchInput;
}

function createSelectedCounter(count) {
    const selectedCounter = document.createElement('div');
    selectedCounter.className = 'db-players-counter';
    selectedCounter.textContent = `Valgte spillere: ${count}`;
    return selectedCounter;
}

function createMainContentContainer() {
    const mainContent = document.createElement('div');
    mainContent.className = 'db-players-main-content';
    return mainContent;
}

function createPlayerColumn(title, isSelected = false) {
    const column = document.createElement('div');
    column.className = 'db-players-column';
    
    const titleElement = document.createElement('h3');
    titleElement.textContent = title;
    titleElement.className = 'db-players-column-title';
    
    const table = document.createElement('table');
    table.className = `db-players-table ${isSelected ? 'selected' : ''}`;
    
    const tableWrapper = document.createElement('div');
    tableWrapper.className = `db-players-table-wrapper ${isSelected ? 'selected' : ''}`;
    tableWrapper.appendChild(table);
    
    column.appendChild(titleElement);
    column.appendChild(tableWrapper);
    
    return { column, table, tableWrapper };
}

function createButtonContainer() {
    const container = document.createElement('div');
    container.className = 'db-players-button-container';
    
    const applyBtn = document.createElement('button');
    applyBtn.textContent = 'Bruk endringer';
    applyBtn.className = 'db-players-btn primary';
    
    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Avbryt';
    cancelBtn.className = 'db-players-btn secondary';
    
    container.appendChild(applyBtn);
    container.appendChild(cancelBtn);
    
    return { container, applyBtn, cancelBtn };
}

function createDatabasePlayersPopupUI({ onAddPlayers, onRemovePlayers, filteredPlayers, getCurrentTournamentPlayers }) 
{
    const selectedPlayerIds = new Set();
    
    // Initialize with currently added players
    const currentTournamentPlayers = getCurrentTournamentPlayers();
    currentTournamentPlayers.forEach(p => {
        if (p.dbId) selectedPlayerIds.add(p.dbId);
        if (p.Id) selectedPlayerIds.add(p.Id);
    });
    
    // Store reference to filteredPlayers function (will be set later)
    let getFilteredPlayers = filteredPlayers;
    
    // Create UI elements
    const overlay = createPopupOverlay();
    const popup = createPopupContainer();
    const searchInput = createSearchInput();
    const selectedCounter = createSelectedCounter(selectedPlayerIds.size);
    const mainContent = createMainContentContainer();
    
    // Create columns
    const leftColumnData = createPlayerColumn('Tilgjengelige spillere', false);
    const rightColumnData = createPlayerColumn('Valgte spillere', true);
    
    const list = leftColumnData.table;
    const listWrapper = leftColumnData.tableWrapper;
    const selectedList = rightColumnData.table;
    const selectedListWrapper = rightColumnData.tableWrapper;
    
    // Create buttons
    const buttonData = createButtonContainer();    const applyBtn = buttonData.applyBtn;
    const cancelBtn = buttonData.cancelBtn;
    
    // Assemble columns
    mainContent.appendChild(leftColumnData.column);
    mainContent.appendChild(rightColumnData.column);
      // Create state management functions
    const updateUI = () => {
        updateSelectedPlayersList(selectedList, selectedPlayerIds, selectedCounter, (player) => {
            selectedPlayerIds.delete(player.Id);
            updateUI();
            renderAvailableList();
        }, getFilteredPlayers, searchInput);
    };    const renderAvailableList = () => {
        if (getFilteredPlayers) {
            renderList(getFilteredPlayers(searchInput.value), list, selectedPlayerIds, getCurrentTournamentPlayers, selectedList, selectedCounter, (selectedPlayer) => {
                selectedPlayerIds.add(selectedPlayer.Id);
                updateUI();
                renderAvailableList(); // Re-render available list to remove selected player
            }, getFilteredPlayers, searchInput);
        }
    };

    // Initial render
    renderAvailableList();
    updateUI();

    // Add resize listener to recalculate columns when window size changes
    let resizeObserver;
    if (window.ResizeObserver) {
        resizeObserver = new ResizeObserver(() => {
            renderAvailableList();
        });
        resizeObserver.observe(list);
    } else {
        window.addEventListener('resize', () => {
            renderAvailableList();
        });
    }

    // Event listeners
    searchInput.addEventListener('input', () => {
        renderAvailableList();
    });
function createSelectedPlayerRow(player, onRemove) {
    const row = document.createElement('tr');
    row.className = 'db-players-row selected-row';
    
    // Player info cell
    const playerCell = document.createElement('td');
    playerCell.className = 'db-players-cell player-info';
    playerCell.textContent = player.Navn;

    const clubCell = document.createElement('td');
    clubCell.className = 'db-players-cell club-info';
    clubCell.textContent = player.Klubb;
    
    // Remove button cell
    const actionCell = document.createElement('td');
    actionCell.className = 'db-players-cell action-cell';
    
    const removeBtn = document.createElement('button');
    removeBtn.textContent = '×';
    removeBtn.className = 'db-players-remove-btn';
    removeBtn.title = 'Fjern spiller';
    
    // Row click handler
    row.addEventListener('click', (e) => {
        if (e.target !== removeBtn) {
            onRemove(player);
        }
    });
    
    // Button click handler
    removeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        onRemove(player);
    });
    
    actionCell.appendChild(removeBtn);
    row.appendChild(playerCell);
    row.appendChild(actionCell);
    
    return row;
}

function createAvailablePlayerRow(player, isAlreadyInTournament, onSelect) {
    const row = document.createElement('tr');
    row.className = `db-players-row ${isAlreadyInTournament ? 'already-in-tournament' : ''}`;
    
    const playerCell = document.createElement('td');
    playerCell.className = 'db-players-cell';

    const clubCell = document.createElement('td');
    clubCell.className = 'db-players-cell';
    
    playerCell.textContent = `${player.Navn}`;
    playerCell.title = `${player.Navn}`;

    clubCell.textContent = player.Klubb || 'Ingen klubb';
    clubCell.title = player.Klubb || 'Ingen klubb';
    
    // Row click handler
    row.addEventListener('click', () => {
        onSelect(player);
    });
    
    row.appendChild(playerCell);
    row.appendChild(clubCell);
    return row;
}

function createEmptyRow(message) {
    const row = document.createElement('tr');
    const cell = document.createElement('td');
    cell.className = 'db-players-cell db-players-empty';
    cell.textContent = message;
    row.appendChild(cell);
    return row;
}

function updateSelectedPlayersList(selectedList, selectedPlayerIds, selectedCounter, onRemove, getFilteredPlayers, searchInput) {
    selectedList.innerHTML = '';
    selectedCounter.textContent = `Valgte spillere: ${selectedPlayerIds.size}`;
    
    if (selectedPlayerIds.size === 0) {
        selectedList.appendChild(createEmptyRow('Ingen spillere valgt'));
        return;
    }
    
    // Get all database players and filter to selected ones
    const allDatabasePlayers = getDatabasePlayers();
    const selectedPlayers = allDatabasePlayers.filter(player => 
        selectedPlayerIds.has(player.Id)
    );
    
    // Sort selected players
    const sortedSelected = selectedPlayers.sort((a, b) => {
        const klubbA = (a.KlubbId || '').toString();
        const klubbB = (b.KlubbId || '').toString();
        
        if (klubbA !== klubbB) {
            return klubbA.localeCompare(klubbB);
        }
        
        const navnA = (a.Navn || '').toString();
        const navnB = (b.Navn || '').toString();
        return navnA.localeCompare(navnB);
    });
      sortedSelected.forEach(player => {
        const row = createSelectedPlayerRow(player, (playerToRemove) => {
            selectedPlayerIds.delete(playerToRemove.Id);
            updateSelectedPlayersList(selectedList, selectedPlayerIds, selectedCounter, onRemove, getFilteredPlayers, searchInput);
        });
        selectedList.appendChild(row);});
}

function renderList(players, list, selectedPlayerIds, getCurrentTournamentPlayers, selectedList, selectedCounter, onRemove, getFilteredPlayers, searchInput) {
    list.innerHTML = '';
    
    // Sort players by KlubbId first, then by Navn
    const sortedPlayers = [...players].sort((a, b) => {
        const klubbA = (a.KlubbId || '').toString();
        const klubbB = (b.KlubbId || '').toString();
        
        if (klubbA !== klubbB) {
            return klubbA.localeCompare(klubbB);
        }
        
        const navnA = (a.Navn || '').toString();
        const navnB = (b.Navn || '').toString();
        return navnA.localeCompare(navnB);
    });
    
    sortedPlayers.forEach(player => {
        // Check if this player is already in the tournament
        const currentTournamentPlayers = getCurrentTournamentPlayers();
        const addedDbIds = new Set();
        currentTournamentPlayers.forEach(p => {
            if (p.dbId) addedDbIds.add(p.dbId);
            if (p.Id) addedDbIds.add(p.Id);
        });
        const isAlreadyInTournament = addedDbIds.has(player.Id);        const row = createAvailablePlayerRow(player, isAlreadyInTournament, (selectedPlayer) => {
            selectedPlayerIds.add(selectedPlayer.Id);
            updateSelectedPlayersList(selectedList, selectedPlayerIds, selectedCounter, onRemove, getFilteredPlayers, searchInput);
            // Re-render the available list to remove the selected player
            if (getFilteredPlayers) {
                renderList(getFilteredPlayers(searchInput.value), list, selectedPlayerIds, getCurrentTournamentPlayers, selectedList, selectedCounter, onRemove, getFilteredPlayers, searchInput);
            }
        });
          list.appendChild(row);
    });
}

// Initial render
    renderList(getFilteredPlayers ? getFilteredPlayers('') : [], list, selectedPlayerIds, getCurrentTournamentPlayers, selectedList, selectedCounter, (player) => {
        selectedPlayerIds.delete(player.Id);
        updateSelectedPlayersList(selectedList, selectedPlayerIds, selectedCounter, (player) => {}, getFilteredPlayers, searchInput);
    }, getFilteredPlayers, searchInput);
    
    updateSelectedPlayersList(selectedList, selectedPlayerIds, selectedCounter, (player) => {
        selectedPlayerIds.delete(player.Id);
        updateSelectedPlayersList(selectedList, selectedPlayerIds, selectedCounter, (player) => {}, getFilteredPlayers, searchInput);
    }, getFilteredPlayers, searchInput);

    // Add resize listener to recalculate columns when window size changes
    let resizeObserver2;
    if (window.ResizeObserver) {
        resizeObserver2 = new ResizeObserver(() => {
            if (getFilteredPlayers) {
                renderList(getFilteredPlayers(searchInput.value), list, selectedPlayerIds, getCurrentTournamentPlayers, selectedList, selectedCounter, (player) => {}, getFilteredPlayers, searchInput);
            }
        });
        resizeObserver2.observe(list);
    } else {
        window.addEventListener('resize', () => {
            if (getFilteredPlayers) {
                renderList(getFilteredPlayers(searchInput.value), list, selectedPlayerIds, getCurrentTournamentPlayers, selectedList, selectedCounter, (player) => {}, getFilteredPlayers, searchInput);
            }
        });
    }

    // Event listeners
    searchInput.addEventListener('input', () => {
        if (getFilteredPlayers) {
            renderList(getFilteredPlayers(searchInput.value), list, selectedPlayerIds, getCurrentTournamentPlayers, selectedList, selectedCounter, (player) => {}, getFilteredPlayers, searchInput);        }
    });

    applyBtn.addEventListener('click', () => {
        const currentTournamentPlayers = getCurrentTournamentPlayers();
        
        // Create a set of database IDs that are currently in the tournament
        const currentAddedDbIds = new Set();
        currentTournamentPlayers.forEach(p => {
            if (p.dbId) currentAddedDbIds.add(p.dbId);
            if (p.Id) currentAddedDbIds.add(p.Id);
        });
        
        // Use persistent selection state instead of DOM checkboxes
        const checkedIds = selectedPlayerIds;
        
        // Find players to add (checked but not currently in tournament)
        const playersToAdd = [];
        const playersToRemove = [];
        
        // Get ALL database players, not just the filtered ones
        const allDatabasePlayers = getDatabasePlayers();
        
        allDatabasePlayers.forEach(player => {
            const playerId = player.Id;
            const isCurrentlyAdded = currentAddedDbIds.has(playerId);
            const isChecked = checkedIds.has(playerId);
            
            if (isChecked && !isCurrentlyAdded) {
                playersToAdd.push(player);
            } else if (!isChecked && isCurrentlyAdded) {
                playersToRemove.push(player);
            }
        });
        
        // Apply changes
        if (playersToAdd.length > 0) {
            onAddPlayers(playersToAdd);
        }
        if (playersToRemove.length > 0) {
            onRemovePlayers(playersToRemove);
        }
        
        // Re-render the list to show changes
        if (getFilteredPlayers) {
            renderList(getFilteredPlayers(searchInput.value), list, selectedPlayerIds, getCurrentTournamentPlayers, selectedList, selectedCounter, (player) => {}, getFilteredPlayers, searchInput);
        }
        updateSelectedPlayersList(selectedList, selectedPlayerIds, selectedCounter, (player) => {}, getFilteredPlayers, searchInput);
        
        document.body.removeChild(overlay);
    });
      cancelBtn.addEventListener('click', () => {
        if (resizeObserver2) {
            resizeObserver2.disconnect();
        }
        document.body.removeChild(overlay);
    });
    
    // Assemble popup
    popup.appendChild(searchInput);
    popup.appendChild(selectedCounter);
    popup.appendChild(mainContent);
    popup.appendChild(buttonData.container);
    overlay.appendChild(popup);
    
    return {
        element: overlay,
        selectedPlayerIds: selectedPlayerIds,
        setFilteredPlayers: function(fn) {
            getFilteredPlayers = fn;
            if (fn) {
                renderList(fn(searchInput.value), list, selectedPlayerIds, getCurrentTournamentPlayers, selectedList, selectedCounter, (player) => {}, getFilteredPlayers, searchInput);
            }
        }
    };
}

export function showDatabasePlayersPopup(currentTournamentPlayers, onAddPlayers, onRemovePlayers) {
    const databasePlayers = getDatabasePlayers();
    
    function getCurrentTournamentPlayers() {
        // If passed as a function, call it; otherwise get fresh data from tournament
        if (typeof currentTournamentPlayers === 'function') {
            return currentTournamentPlayers();
        }
        // Get fresh tournament data
        const tournament = Tournaments.getCurrentTournament();
        return tournament ? tournament.getPlayers() : [];
    }
    
    // Create the popup UI first to get access to selectedPlayerIds
    const popupUI = createDatabasePlayersPopupUI({ 
        onAddPlayers, 
        onRemovePlayers, 
        filteredPlayers: null, // Will be set below
        getCurrentTournamentPlayers 
    });
    
    // Now create the filteredPlayers function with access to selectedPlayerIds
    function filteredPlayers(search) {
        return filterDatabasePlayers(
            databasePlayers,
            getCurrentTournamentPlayers(),
            search,
            popupUI.selectedPlayerIds
        );
    }
    
    // Set the filteredPlayers function on the popup
    popupUI.setFilteredPlayers(filteredPlayers);
    
    document.body.appendChild(popupUI.element);
}

// Example usage:
// showDatabasePlayersPopup(currentPlayersArray, function(newPlayers) { /* add to table */ });



export function onAddPlayers(newPlayers) {
    const currentTournament = Tournaments.getCurrentTournament();
    newPlayers.forEach(dbPlayer => {
        Players.create(
            Players.count() + 1,
            dbPlayer.Navn,
            dbPlayer.Klubb,
            dbPlayer.KlubbId,
            dbPlayer.Id
        );
    });
    updatePlayerTable();
    Tournaments.update(currentTournament.id, {
        players: Players.getAll(),
    });
}

export function onRemovePlayers(playersToRemove) {
    const currentTournament = Tournaments.getCurrentTournament();
    playersToRemove.forEach(dbPlayer => {
        // Find player by dbId and remove
        const playerToRemove = Players.getAll().find(p => p.dbId === dbPlayer.Id);
        if (playerToRemove) {
            Players.delete(playerToRemove.id);
        }
    });
    updatePlayerTable();
    Tournaments.update(currentTournament.id, {
        players: Players.getAll(),
    });
}