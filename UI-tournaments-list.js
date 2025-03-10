import Players from './classes/Player.js';
import Tournaments from './classes/Tournament.js';
import { displayTournamentOverview } from './UI-tournament.js';

export function displayTournamentsList() {
    const mainContainer = document.getElementById('mainContainer');
    mainContainer.innerHTML = '';

    const tableContainer = document.createElement('div');
    tableContainer.id = 'tournamentsList';
    tableContainer.className = 'tournaments-list';

    const table = document.createElement('table');
    table.className = 'tournaments-table';
    
    const thead = table.createTHead();
    const headerRow = thead.insertRow();
    ['Navn', 'Type', 'Opprettet', 'Runder', 'Spillere', 'Handlinger'].forEach(text => {
        const th = document.createElement('th');
        th.textContent = text;
        headerRow.appendChild(th);
    });

    const tbody = table.createTBody();
    const tournaments = Tournaments.getAll();

    tournaments.forEach(tournament => {
        const row = tbody.insertRow();
        
        row.insertCell().textContent = tournament.name;
        row.insertCell().textContent = tournament.type;
        row.insertCell().textContent = tournament.dateCreated;
        row.insertCell().textContent = tournament.totalRounds;
        row.insertCell().textContent = tournament.getPlayers().length;

        const actionsCell = row.insertCell();
        
        const loadBtn = document.createElement('button');
        loadBtn.textContent = 'Last inn';
        loadBtn.onclick = () => loadTournament(tournament.id);
        
        const editBtn = document.createElement('button');
        editBtn.textContent = 'Rediger';
        editBtn.onclick = () => editTournament(tournament.id);
        
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Slett';
        deleteBtn.onclick = () => deleteTournament(tournament.id);

        actionsCell.append(loadBtn, deleteBtn);
    });

    tableContainer.appendChild(table);
    mainContainer.appendChild(tableContainer);
}

function loadTournament(id) {
    const tournament = Tournaments.get(id);
    if (tournament) {
        console.log('Load tournament:', tournament);
        Players.loadPlayersFromTournament(tournament.getPlayers());
        const tournamentsList = document.getElementById('tournamentsList');
        tournamentsList.remove();
        displayTournamentOverview(tournament);
        const header = document.getElementById('header');
        const addPlayerButton = document.getElementById('addPlayerButton');
        addPlayerButton.remove();
        header.remove();
        Tournaments.setCurrentTournament(tournament.id);
    }
}

function editTournament(id) {
    // TODO: Implement tournament editing
    console.log('Edit tournament:', id);
    
}

function deleteTournament(id) {
    if (confirm('Er du sikker på at du vil slette denne turneringen?')) {
        Tournaments.delete(id);
        displayTournamentsList(); // Refresh the list
    }
}