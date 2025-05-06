import TournamentSettings from './classes/TournamentSettings.js';
import Tournaments from './classes/Tournament.js';
import Players from './classes/Player.js';
import { createMatchSetup } from './generateMatches.js';
import { playerCountSelect, roundCountSelect, gametypeSelect, titleText, showMatchSetupBtn } from './UI-main.js';
import { createRoundCountSelectOptions } from './generateSelectList.js';
import { displayTournamentOverview } from './UI-tournament.js';
import { displayMatchSetup } from './UI-matchSetup.js';
import { displayTournamentsList, editTournament } from './UI-tournaments-list.js';

const mainContainer = document.getElementById('mainContainer');
    mainContainer.innerHTML = '';

function onGametypeChange() {
    const gametype = this.value;
    TournamentSettings.setGametype(gametype);

    if (gametype === 'Alle mot alle') {
        roundCountSelect.disabled = true;
        TournamentSettings.setRoundCount(TournamentSettings.getPlayerCount() - 1);
        showMatchSetupBtn.disabled = true;
    } else if (gametype === 'NHM') {
        showMatchSetupBtn.disabled = true;
    }
    else {
        roundCountSelect.disabled = false;
        showMatchSetupBtn.disabled = false;
    }
    createRoundCountSelectOptions();

}

function onPlayerCountChange() {
    const playerCount = parseInt(this.value, 10);
    TournamentSettings.setPlayerCount(playerCount);
    createRoundCountSelectOptions();

    console.log('Player count was set to ', TournamentSettings.getPlayerCount());
    titleText.textContent = `${playerCount} spillere`;
}

function onRoundCountChange() {
    const roundCount = parseInt(this.value, 10);
    TournamentSettings.setRoundCount(roundCount);
    console.log('Round count was set to ', TournamentSettings.getRoundCount());
}

export function onCreateTournament() {
    Players.resetPlayers(TournamentSettings.getPlayerCount());
    const matchSetup = [];
    const tournament = Tournaments.create(TournamentSettings.getRoundCount(), TournamentSettings.getPlayerCount() / 2, matchSetup, 'Ny turnering', TournamentSettings.getGametype(), Players.getAll());
    Tournaments.setCurrentTournament(tournament.id);
    displayTournamentOverview(tournament);

    const header = document.getElementById('header');
    header.remove();
    editTournament(tournament.id);

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
    if (type === "Gloppen" && totalRounds > playerCount / 2) {
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

function onShowMatchSetup() {
    Players.resetPlayers(TournamentSettings.getPlayerCount());
    const matchSetup = createMatchSetup(Players.count(), TournamentSettings.getRoundCount(), "Gloppen");
    displayMatchSetup(matchSetup, TournamentSettings.getPlayerCount());
}

function onPrintContent() {
    window.print();
}

function loadEventListeners() {
    playerCountSelect.addEventListener('change', onPlayerCountChange);
    roundCountSelect.addEventListener('change', onRoundCountChange);
    gametypeSelect.addEventListener('change', onGametypeChange);

    document.getElementById('showMatchSetup').addEventListener('click', onShowMatchSetup);
    document.getElementById('printContent').addEventListener('click', onPrintContent);
    document.getElementById('createTournamentBtn').addEventListener('click', onCreateTournament);
    //document.getElementById('start-btn').addEventListener('click', onStartTournament);
    document.getElementById('showTournamentsBtn').addEventListener('click', onShowTournaments);
}

// Remove existing event listeners and call loadEventListeners
playerCountSelect.removeEventListener('change', onPlayerCountChange);
roundCountSelect.removeEventListener('change', onRoundCountChange);
gametypeSelect.removeEventListener('change', onGametypeChange);
document.getElementById('showMatchSetup').removeEventListener('click', onShowMatchSetup);
document.getElementById('printContent').removeEventListener('click', onPrintContent);
document.getElementById('createTournamentBtn').removeEventListener('click', onCreateTournament);
//document.getElementById('start-btn').removeEventListener('click', onStartTournament);
document.getElementById('showTournamentsBtn').removeEventListener('click', onShowTournaments);
loadEventListeners();