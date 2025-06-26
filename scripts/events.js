import TournamentSettings from '../classes/TournamentSettings.js';
import Tournaments from '../classes/Tournament.js';
import Players from '../classes/Player.js';
import { mainContainer } from '../UI/UI-main.js';
import { createMatchSetup } from '../generateMatches.js';
import { displayTournamentOverview } from '../UI/UI-tournament.js';
import { displayTournamentsList, createEditTournamentPopup } from '../UI/UI-tournaments-list.js';
import { importPlayerListFromDb, importTournamentListFromDb } from './utils.js';

mainContainer.innerHTML = '';

displayTournamentsList();
onImportFromDb();

function onImportFromDb() {
    const playersUrl = location.hostname === 'localhost' || location.hostname === '127.0.0.1' ? 'http://127.0.0.1:5500/kastere.json' : 'https://resultater.hesteskokasting.no/filer/eksport/kastere.json';
    const tournamentsUrl = location.hostname === 'localhost' || location.hostname === '127.0.0.1' ? 'http://127.0.0.1:5500/stevner.json' : 'https://resultater.hesteskokasting.no/filer/eksport/stevner.json';
    if (playersUrl) {
        importPlayerListFromDb(playersUrl);
    }
    if (tournamentsUrl) {
        importTournamentListFromDb(tournamentsUrl);
    }
}

export function onCreateTournament() {
    Players.resetPlayers(TournamentSettings.getPlayerCount());
    const matchSetup = [];
    const tournament = Tournaments.create(4, 4, matchSetup, 'Ny turnering', "Gloppen", Players.getAll());
    Tournaments.setCurrentTournament(tournament.id);
    displayTournamentOverview(tournament);

    const header = document.getElementById('header');
    header.remove();
    createEditTournamentPopup(tournament.id);

}

export function onEditPlayers() {
    const tournament = Tournaments.getCurrentTournament();
    if (tournament) {

        Tournaments.update(tournament.id, {
            players: tournament.players,
        });
        console.log('Tournament updated:', tournament);
        displayTournamentOverview(tournament);
    }
}

function checkPlayerCount(playerCount, totalRounds, type) {
    if (playerCount % 2 !== 0) {
        playerCount += 1;
    }
    if (playerCount < 4) {
        alert('Det må være minst 4 spillere for å starte turneringen!');
        return true; // failed
    }
    if (type === "Gloppen" && totalRounds > playerCount/2) {
        alert('Det er for mange runder (maks. ' + playerCount/2 + '). Reduser antall runder eller endre til NHM eller Alle mot alle.');
        return true; // failed
    }
    return false; // all good
}

export function onStartTournament() {
    const tournament = Tournaments.getCurrentTournament();
    if (checkPlayerCount(Players.count(), tournament.totalRounds, tournament.type)) {
        return; // failed
    }
    const matchSetup = createMatchSetup(Players.count(), tournament.totalRounds, tournament.type);
    console.log('Match setup:', matchSetup);
    if (tournament) {

        // if cancel, do not start tournament
        if (confirm('Vil du starte turnering? Det er ikke mulig å endre spillere etter turneringsstart!')) {
            tournament.players = Players.getAll();
            tournament.matchSchedule = matchSetup;
            tournament.totalCourts = Players.count() / 2;
            // Set the tournament to started
            tournament.startTournament();
            displayTournamentOverview(tournament);
        } else {
            console.log('Tournament not started');
            return;
        }

    }   
}


function onShowTournaments() {
    displayTournamentsList();
}

function onPrintContent() {
    window.print();
}

function loadEventListeners() {
    // Add event listeners for buttons
    document.getElementById('printContent').addEventListener('click', onPrintContent);
    document.getElementById('createTournamentBtn').addEventListener('click', onCreateTournament);
    document.getElementById('showTournamentsBtn').addEventListener('click', onShowTournaments);
    document.getElementById('importDbPlayersBtn').addEventListener('click', onImportFromDb);
}

// Remove existing event listeners and call loadEventListeners
document.getElementById('printContent').removeEventListener('click', onPrintContent);
document.getElementById('createTournamentBtn').removeEventListener('click', onCreateTournament);
document.getElementById('showTournamentsBtn').removeEventListener('click', onShowTournaments);
document.getElementById('importDbPlayersBtn').removeEventListener('click', onImportFromDb);
loadEventListeners();