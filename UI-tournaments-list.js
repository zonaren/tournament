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
    ['Navn', 'Type', 'Opprettet', 'Runder', "Baner", 'Spillere', 'Startet', 'Eier', 'Handlinger'].forEach(text => {
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
        row.insertCell().textContent = tournament.totalCourts;
        row.insertCell().textContent = tournament.getPlayers().length;
        row.insertCell().textContent = tournament.isStarted ? 'Ja' : 'Nei';
        row.insertCell().textContent = 'Sondre Torgersen'; // Hardcdoded for now

        const actionsCell = row.insertCell();
        
        const loadBtn = document.createElement('button');
        loadBtn.textContent = 'Last inn';
        loadBtn.onclick = () => loadTournament(tournament.id);
        
        const editBtn = document.createElement('button');
        editBtn.textContent = 'Rediger';
        tournament.isStarted ? editBtn.disabled = true : editBtn.disabled = false;
        editBtn.onclick = () => editTournament(tournament.id);
        
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Slett';
        deleteBtn.onclick = function() {
            this.replaceWith(confirmDelete);
        };

        const confirmDelete = document.createElement('button');
        confirmDelete.textContent = 'Bekreft sletting';
        confirmDelete.onclick = () => deleteTournament(tournament.id, row);

        actionsCell.append(loadBtn, editBtn, deleteBtn);
    });

    tableContainer.appendChild(table);
    mainContainer.appendChild(tableContainer);
}

function loadTournament(id) {
    const tournament = Tournaments.get(id);
    if (tournament) {
        Tournaments.setCurrentTournament(tournament.id);
        console.log('Load tournament:', tournament, 'id: ', tournament.id);
        Players.loadPlayersFromTournament(tournament.getPlayers());
        const tournamentsList = document.getElementById('tournamentsList');
        tournamentsList.remove();
        displayTournamentOverview(tournament);
        const header = document.getElementById('header');
        header.remove();
        
    }
}

function editTournament(id) {
    // TODO: Implement tournament editing
    alert('Rediger turnering er ikke implementert ennå!');
    console.log('Edit tournament:', id);
    
}

function deleteTournament(id, row) {
        Tournaments.delete(id);
        row.remove();
}