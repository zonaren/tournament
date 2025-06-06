import TournamentSettings from '../classes/TournamentSettings.js';
import Tournaments from '../classes/Tournament.js';
import Players from '../classes/Player.js';
import { mainContainer } from '../UI/UI-main.js';
import { createMatchSetup } from '../generateMatches.js';
import { displayTournamentOverview } from '../UI/UI-tournament.js';
import { displayTournamentsList, createEditTournamentPopup } from '../UI/UI-tournaments-list.js';
import { importPlayerListFromDb } from './utils.js';

mainContainer.innerHTML = '';

function onImportDbPlayers() {
            const url = 'http://127.0.0.1:5500/kastere.json';
        if (url) {
            importPlayerListFromDb(url);
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

        const playerCount = Players.count();
        checkPlayerCount(playerCount, tournament.totalRounds, tournament.type);
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
        return false;
    }
    if (type === "Gloppen" && totalRounds >= playerCount) {
        TournamentSettings.setRoundCount(playerCount / 2);
        // Update the current tournament's totalRounds as well
        const tournament = Tournaments.getCurrentTournament();
        if (tournament) {
            tournament.totalRounds = playerCount / 2;
            Tournaments.update(tournament.id, { totalRounds: playerCount / 2 });
        }
        alert('Antall runder er satt til ' + playerCount / 2 + ' fordi det var for mange runder.');
        return true;
    }
}

export function onStartTournament() {
    const tournament = Tournaments.getCurrentTournament();
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
    document.getElementById('importDbPlayersBtn').addEventListener('click', onImportDbPlayers);
}

// Remove existing event listeners and call loadEventListeners
document.getElementById('printContent').removeEventListener('click', onPrintContent);
document.getElementById('createTournamentBtn').removeEventListener('click', onCreateTournament);
document.getElementById('showTournamentsBtn').removeEventListener('click', onShowTournaments);
document.getElementById('importDbPlayersBtn').removeEventListener('click', onImportDbPlayers);
loadEventListeners();