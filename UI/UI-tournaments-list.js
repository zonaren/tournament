import Tournaments from '../classes/Tournament.js';
import { deleteTournamentAndRow, loadTournament } from '../tournament-logics.js';
import { displayTournamentOverview } from './UI-tournament.js';

export function displayTournamentsList() {
    const mainContainer = document.getElementById('mainContainer');
    mainContainer.innerHTML = '';
    
    const tableContainer = document.createElement('div');

        const loadTournamentFromDbBtn = document.createElement('button');
    loadTournamentFromDbBtn.textContent = 'Last inn turnering fra database';
    loadTournamentFromDbBtn.id = 'loadTournamentFromDbBtn';
    tableContainer.appendChild(loadTournamentFromDbBtn);
    loadTournamentFromDbBtn.onclick = () => {
        loadTournamentsFromDbPopup();
    };
    tableContainer.id = 'tournamentsList';
    tableContainer.className = 'tournaments-list';

    const table = document.createElement('table');
    table.className = 'tournaments-table';
    
    const thead = table.createTHead();
    const headerRow = thead.insertRow();
    ['Navn', 'Type', 'Finaler', 'Opprettet', 'Runder', "Baner", 'Spillere', 'Fase', 'Eier', ''].forEach(text => {
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
        row.insertCell().textContent = tournament.finalsFormat || '';
        row.insertCell().textContent = tournament.dateCreated;
        row.insertCell().textContent = tournament.totalRounds;
        row.insertCell().textContent = tournament.totalCourts;
        row.insertCell().textContent = tournament.getPlayers().length;
        row.insertCell().textContent = tournament.getCurrentStageDisplayName();
        row.insertCell().textContent = 'Sondre'; // Hardcdoded for now

        const actionsCell = row.insertCell();
        
        const loadBtn = document.createElement('button');
        loadBtn.textContent = 'Last inn';
        loadBtn.onclick = () => loadTournament(tournament.id);
        
        const editBtn = document.createElement('button');
        editBtn.textContent = 'Rediger';
        tournament.isStarted ? editBtn.disabled = true : editBtn.disabled = false;
        editBtn.onclick = () => createEditTournamentPopup(tournament.id);
        
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Slett';
        deleteBtn.onclick = function() {
            this.replaceWith(confirmDelete);
        };

        const confirmDelete = document.createElement('button');
        confirmDelete.textContent = 'Bekreft sletting';
        confirmDelete.onclick = () => deleteTournamentAndRow(tournament.id, row);

        actionsCell.append(loadBtn, deleteBtn);
    });

    tableContainer.appendChild(table);
    mainContainer.appendChild(tableContainer);
}

export function createEditTournamentPopup(id) {
    // Inline editing popup for tournament name, type, and rounds
    const tournament = Tournaments.get(id);
    if (!tournament) return;

    // Create popup overlay
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = 0;
    overlay.style.left = 0;
    overlay.style.width = '100vw';
    overlay.style.height = '100vh';
    overlay.style.background = 'rgba(0,0,0,0.3)';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.zIndex = 1000;

    // Create popup box
    const popup = document.createElement('div');
    popup.style.background = '#fff';
    popup.style.padding = '2em';
    popup.style.borderRadius = '10px';
    popup.style.boxShadow = '0 2px 12px rgba(0,0,0,0.2)';
    popup.style.minWidth = '320px';

    // Title
    const title = document.createElement('h2');
    title.textContent = 'Rediger turnering';
    popup.appendChild(title);

    // Name input
    const nameLabel = document.createElement('label');
    nameLabel.textContent = 'Navn:';
    nameLabel.style.display = 'block';
    nameLabel.style.marginTop = '1em';
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.value = tournament.name;
    nameInput.style.width = '100%';
    nameInput.style.marginTop = '0.2em';
    popup.appendChild(nameLabel);
    popup.appendChild(nameInput);

    // Type input
    const typeLabel = document.createElement('label');
    typeLabel.textContent = 'Type:';
    typeLabel.style.display = 'block';
    typeLabel.style.marginTop = '1em';
    const typeSelect = document.createElement('select');
    ['Gloppen', 'Alle mot alle', 'NHM'].forEach(opt => {
        const option = document.createElement('option');
        option.value = opt;
        option.textContent = opt;
        if (opt === tournament.type) option.selected = true;
        typeSelect.appendChild(option);
    });
    typeSelect.style.width = '100%';
    typeSelect.style.marginTop = '0.2em';
    popup.appendChild(typeLabel);
    popup.appendChild(typeSelect);

    // Finals input
    const finalsLabel = document.createElement('label');
    finalsLabel.textContent = 'Sluttspill:';
    finalsLabel.style.display = 'block';
    finalsLabel.style.marginTop = '1em';
    const finalsSelect = document.createElement('select');
    ['Ikke valgt', 'Cup', 'Single elimination', 'Double elimination'].forEach(opt => {
        const option = document.createElement('option');
        option.value = opt;
        option.textContent = opt;
        if (opt === tournament.finalsFormat) option.selected = true;
        finalsSelect.appendChild(option);
    });
    finalsSelect.style.width = '100%';
    finalsSelect.style.marginTop = '0.2em';
    popup.appendChild(finalsLabel);
    popup.appendChild(finalsSelect);

    // Rounds input
    const roundsLabel = document.createElement('label');
    roundsLabel.textContent = 'Antall runder:';
    roundsLabel.style.display = 'block';
    roundsLabel.style.marginTop = '1em';
    const roundsInput = document.createElement('input');
    roundsInput.type = 'number';
    roundsInput.value = tournament.totalRounds;
    roundsInput.min = 2;
    roundsInput.max = 12; // Set a reasonable max value
    roundsInput.style.width = '100%';
    roundsInput.style.marginTop = '0.2em';
    popup.appendChild(roundsLabel);
    popup.appendChild(roundsInput);

    // Buttons
    const btnRow = document.createElement('div');
    btnRow.style.display = 'flex';
    btnRow.style.justifyContent = 'flex-end';
    btnRow.style.gap = '1em';
    btnRow.style.marginTop = '2em';

    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Avbryt';
    cancelBtn.onclick = () => document.body.removeChild(overlay);

    const saveBtn = document.createElement('button');
    saveBtn.textContent = 'Lagre';
    saveBtn.style.background = '#3D679D';
    saveBtn.style.color = '#fff';
    saveBtn.style.border = 'none';
    saveBtn.style.padding = '0.5em 1.5em';
    saveBtn.style.borderRadius = '5px';
    saveBtn.style.cursor = 'pointer';
    editTournament();

    btnRow.appendChild(cancelBtn);
    btnRow.appendChild(saveBtn);
    popup.appendChild(btnRow);

    overlay.appendChild(popup);
    document.body.appendChild(overlay);

    function editTournament() {
        saveBtn.onclick = () => {
            const newName = nameInput.value.trim();
            const newType = typeSelect.value;
            const newFinalsFormat = finalsSelect.value === 'Ikke valgt' ? null : finalsSelect.value;
            const newRounds = parseInt(roundsInput.value, 10);
            if (!newName) {
                nameInput.focus();
                nameInput.style.border = '1px solid red';
                return;
            }
            // Update using the class method
            Tournaments.update(id, {
                name: newName,
                type: newType,
                finalsFormat: newFinalsFormat,
                totalRounds: isNaN(newRounds) ? tournament.totalRounds : newRounds
            });

            document.body.removeChild(overlay);
            displayTournamentOverview(tournament);
        };
    }
}

    function loadTournamentsFromDbPopup() {
        const overlay = document.createElement('div');

        // Populate select with tournaments from the database
        const select = document.createElement('select');
        select.id = 'tournamentSelect';
        select.style.width = '100%';
        select.style.marginTop = '0.5em';
        select.style.padding = '0.5em';
        select.style.borderRadius = '5px';
        select.style.border = '1px solid #ccc';
        select.style.fontSize = '1em';
        select.style.backgroundColor = '#fff';
        select.style.color = '#333';

        const dbTournaments = JSON.parse(localStorage.getItem('databaseTournaments')) || [];
        dbTournaments.forEach(tournament => {
            const option = document.createElement('option');
            option.value = tournament.id;
            option.textContent = tournament.navn;
            select.appendChild(option);
        });

        // Save button
        const saveBtn = document.createElement('button');
        saveBtn.textContent = 'Last inn turnering';

        overlay.appendChild(select);
        overlay.appendChild(saveBtn);

        saveBtn.onclick = () => {
            const selectedId = select.value;
            const selectedName = select.options[select.selectedIndex].textContent;
            if (selectedId) {
                Tournaments.create(4, 4, [], selectedName, "Gloppen", []);
                document.body.removeChild(overlay); // Remove popup first
                displayTournamentsList();
            } else {
                alert('Vennligst velg en turnering fra listen.');
            }
        }

        // Add overlay to DOM so popup appears
        overlay.style.position = 'fixed';
        overlay.style.top = 0;
        overlay.style.left = 0;
        overlay.style.width = '100vw';
        overlay.style.height = '100vh';
        overlay.style.background = 'rgba(0,0,0,0.3)';
        overlay.style.display = 'flex';
        overlay.style.alignItems = 'center';
        overlay.style.justifyContent = 'center';
        overlay.style.zIndex = 1000;

        // Create popup box for content
        const popupBox = document.createElement('div');
        popupBox.style.background = '#fff';
        popupBox.style.padding = '1.5em';
        popupBox.style.borderRadius = '10px';
        popupBox.style.boxShadow = '0 2px 12px rgba(0,0,0,0.2)';
        popupBox.style.minWidth = '260px';
        popupBox.style.maxWidth = '340px';
        popupBox.style.width = '100%';
        popupBox.style.display = 'flex';
        popupBox.style.flexDirection = 'column';
        popupBox.style.gap = '1em';

        // Add close/cancel button
        const cancelBtn = document.createElement('button');
        cancelBtn.textContent = 'Avbryt';
        cancelBtn.style.alignSelf = 'flex-end';
        cancelBtn.onclick = () => document.body.removeChild(overlay);

        // Move select and saveBtn into popupBox
        popupBox.appendChild(cancelBtn);
        popupBox.appendChild(select);
        popupBox.appendChild(saveBtn);
        overlay.appendChild(popupBox);
        document.body.appendChild(overlay);
    }
