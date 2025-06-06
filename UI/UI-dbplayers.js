import Players from '../classes/Player.js';
import Tournaments from '../classes/Tournament.js';
import { updatePlayerTable } from '../UI/UI-players.js';

function getDatabasePlayers() {
    return JSON.parse(localStorage.getItem('databasePlayers')) || [];
}

function filterDatabasePlayers(databasePlayers, currentTournamentPlayers, search) {
    const searchLower = search.toLowerCase();
    return databasePlayers.filter(p =>
        (!searchLower ||
            p.Navn?.toLowerCase().includes(searchLower) ||
            p.Klubb?.toLowerCase().includes(searchLower)
        )
    );
}

function createDatabasePlayersPopupUI({ onAddPlayers, onRemovePlayers, filteredPlayers, getCurrentTournamentPlayers }) {
    // Create overlay
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = 0;
    overlay.style.left = 0;
    overlay.style.width = '100vw';
    overlay.style.height = '100vh';
    overlay.style.background = 'rgba(0,0,0,0.5)';
    overlay.style.display = 'flex';
    overlay.style.justifyContent = 'center';
    overlay.style.alignItems = 'center';
    overlay.style.zIndex = 10000;    // Create popup
    const popup = document.createElement('div');
    popup.style.background = '#fff';
    popup.style.padding = '20px';
    popup.style.borderRadius = '8px';
    popup.style.width = '80vw'; // 80% of viewport width
    popup.style.height = '80vh'; // 80% of viewport height
    popup.style.display = 'flex';
    popup.style.flexDirection = 'column';
    popup.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';

    // Search input
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = 'Søk etter navn eller klubb...';
    searchInput.style.width = '100%';
    searchInput.style.marginBottom = '10px';
    searchInput.style.padding = '8px';    // Players list
    const list = document.createElement('div');
    list.style.flex = '1'; // Take up remaining space
    list.style.overflowY = 'auto';
    list.style.marginBottom = '10px';
    list.style.border = '1px solid #ddd';
    list.style.borderRadius = '4px';
    list.style.padding = '10px';
    list.style.display = 'grid';
    list.style.gap = '2px';
    list.style.alignContent = 'start';// Apply changes button
    const applyBtn = document.createElement('button');
    applyBtn.textContent = 'Bruk endringer';
    applyBtn.style.marginRight = '10px';

    // Cancel button
    const cancelBtn = document.createElement('button');    cancelBtn.textContent = 'Avbryt';
    
    // Render list
    function renderList(players) {
        list.innerHTML = '';
        
        // Get current tournament players to check which are already added
        const currentTournamentPlayers = getCurrentTournamentPlayers();
        
        // Create a set of database IDs that are already in the tournament
        const addedDbIds = new Set();
        currentTournamentPlayers.forEach(p => {
            if (p.dbId) addedDbIds.add(p.dbId);
            // Also check if the player has an Id property that matches database Id
            if (p.Id) addedDbIds.add(p.Id);        });
        
        // Sort players by KlubbId first, then by Navn
        const sortedPlayers = [...players].sort((a, b) => {
            // First sort by KlubbId (treating null/undefined as empty string)
            const klubbA = (a.KlubbId || '').toString();
            const klubbB = (b.KlubbId || '').toString();
            
            if (klubbA !== klubbB) {
                return klubbA.localeCompare(klubbB);
            }
            
            // If KlubbId is the same, sort by Navn
            const navnA = (a.Navn || '').toString();
            const navnB = (b.Navn || '').toString();
            return navnA.localeCompare(navnB);
        });

        sortedPlayers.forEach(player => {
            const row = document.createElement('div');            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.value = player.Id; // Use capital I to match database
            checkbox.style.marginRight = '8px';
              // Check if this database player is already in tournament
            const isSelected = addedDbIds.has(player.Id);
            if (isSelected) {
                checkbox.checked = true;
            }
            
            // Function to update row appearance based on selection
            const updateRowAppearance = () => {
                if (checkbox.checked) {
                    row.style.border = '2px solid #007acc'; // Blue border for selected
                    row.style.backgroundColor = '#e8f4ff'; // Light blue background
                } else {
                    row.style.border = '2px solid transparent';
                    row.style.backgroundColor = 'transparent';
                }
            };
            
            // Initial appearance
            updateRowAppearance();
            
            // Add hover effect
            row.addEventListener('mouseenter', () => {
                if (!checkbox.checked) {
                    row.style.backgroundColor = '#f5f5f5';
                }
            });
            row.addEventListener('mouseleave', () => {
                updateRowAppearance(); // Reset to selection state
            });            const label = document.createElement('span');
            label.textContent = `${player.Navn} (${player.Klubb})`;
            label.title = `${player.Navn} (${player.Klubb})`; // Tooltip for full text
            
            // Make the entire row clickable
            row.addEventListener('click', (e) => {
                // Don't toggle if clicking directly on checkbox
                if (e.target === checkbox) return;
                checkbox.checked = !checkbox.checked;
                updateRowAppearance(); // Update appearance after toggle
            });
              // Update appearance when checkbox changes
            checkbox.addEventListener('change', updateRowAppearance);

            row.appendChild(checkbox);
            row.appendChild(label);
            list.appendChild(row);
        });
    }    // Initial render
    renderList(filteredPlayers(''));    // Add resize listener to recalculate columns when window size changes
    let resizeObserver;
    if (window.ResizeObserver) {
        resizeObserver = new ResizeObserver(() => {
            // Re-render with current search to recalculate columns
            renderList(filteredPlayers(searchInput.value));
        });
        resizeObserver.observe(list);
    } else {
        // Fallback for older browsers
        window.addEventListener('resize', () => {
            renderList(filteredPlayers(searchInput.value));
        });
    }

    // Event listeners
    searchInput.addEventListener('input', () => {
        renderList(filteredPlayers(searchInput.value));
    });

    applyBtn.addEventListener('click', () => {
        const checkboxes = list.querySelectorAll('input[type="checkbox"]');
        const currentTournamentPlayers = getCurrentTournamentPlayers();
        
        // Create a set of database IDs that are currently in the tournament
        const currentAddedDbIds = new Set();
        currentTournamentPlayers.forEach(p => {
            if (p.dbId) currentAddedDbIds.add(p.dbId);
            if (p.Id) currentAddedDbIds.add(p.Id);
        });
        
        const checkedIds = new Set();
        
        checkboxes.forEach(checkbox => {
            const playerId = parseInt(checkbox.value); // Convert to number to match database
            if (checkbox.checked) {
                checkedIds.add(playerId);
            }
        });        
        // Find players to add (checked but not currently in tournament)
        const playersToAdd = [];
        const playersToRemove = [];
        
        const allPlayers = filteredPlayers(searchInput.value, true);
        
        allPlayers.forEach(player => {
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
        renderList(filteredPlayers(searchInput.value));
        
        if (playersToAdd.length === 0 && playersToRemove.length === 0) {
            alert('Ingen endringer gjort!');
        }
        document.body.removeChild(overlay);
    });    
    
    cancelBtn.addEventListener('click', () => {
        if (resizeObserver) {
            resizeObserver.disconnect(); // Clean up the observer
        }
        document.body.removeChild(overlay);
    });
    
    // Assemble popup
    popup.appendChild(searchInput);
    popup.appendChild(list);
    popup.appendChild(applyBtn);
    popup.appendChild(cancelBtn);
    overlay.appendChild(popup);

    return overlay;
}

export function showDatabasePlayersPopup(currentTournamentPlayers, onAddPlayers, onRemovePlayers) {
    const databasePlayers = getDatabasePlayers();
    function filteredPlayers(search, all = false) {
        // If all=true, ignore search
        return filterDatabasePlayers(
            databasePlayers,
            getCurrentTournamentPlayers(),
            all ? '' : search
        );
    }
    
    function getCurrentTournamentPlayers() {
        // If passed as a function, call it; otherwise get fresh data from tournament
        if (typeof currentTournamentPlayers === 'function') {
            return currentTournamentPlayers();
        }
        // Get fresh tournament data
        const tournament = Tournaments.getCurrentTournament();
        return tournament ? tournament.getPlayers() : [];
    }
    
    const popupUI = createDatabasePlayersPopupUI({ onAddPlayers, onRemovePlayers, filteredPlayers, getCurrentTournamentPlayers });
    document.body.appendChild(popupUI);
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