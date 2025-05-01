import TournamentSettings from './classes/TournamentSettings.js';
import Tournaments from './classes/Tournament.js';
import Players from './classes/Player.js';
import { displayPlayerOverview, createButtonsContainer } from './UI-players.js';
import { createMatchSetup } from './generateMatches.js';
import { playerCountSelect, roundCountSelect, gametypeSelect, titleText, showMatchSetupBtn } from './UI-main.js';
import { createRoundCountSelectOptions } from './generateSelectList.js';
import { displayTournamentOverview } from './UI-tournament.js';
import { displayMatchSetup } from './UI-matchSetup.js';
import { displayTournamentsList } from './UI-tournaments-list.js';

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

function onPrepareTournament() {
    Players.resetPlayers(TournamentSettings.getPlayerCount());
    mainContainer.innerHTML = '';
    mainContainer.appendChild(createButtonsContainer());
    displayPlayerOverview(mainContainer);
    this.classList.add('hidden');
    const header = document.getElementById('header');
    header.remove();
}

export function onSaveTournament(name) {
    const matchSetup = createMatchSetup(Players.count(), TournamentSettings.getRoundCount(), TournamentSettings.getGametype());
    const tournament = Tournaments.create(TournamentSettings.getRoundCount(), TournamentSettings.getPlayerCount() / 2, matchSetup, name, TournamentSettings.getGametype(), Players.getAll());
    displayTournamentOverview(tournament);
    Tournaments.setCurrentTournament(tournament.id);
    console.log('Tournament was created', tournament);

}

function onStartTournament() {
    const tournament = Tournaments.getCurrentTournament();
    if (tournament) {
        // Set the tournament to started
        tournament.startTournament();
        console.log('Tournament started:', tournament);

        alert('Turneringen er startet! Det er ikke mulig å endre spillere eller baner nå.');
        this.remove();
    } else {
        alert('Ingen turnering er valgt. Vennligst opprett eller velg en turnering først.');
    }
}


function onShowTournaments() {
    displayTournamentsList();
}

function onShowMatchSetup() {
    Players.resetPlayers(TournamentSettings.getPlayerCount());
    const matchSetup = createMatchSetup(Players.count(), TournamentSettings.getRoundCount());
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
    document.getElementById('prepareTournamentBtn').addEventListener('click', onPrepareTournament);
    //document.getElementById('start-btn').addEventListener('click', onStartTournament);
    document.getElementById('showTournamentsBtn').addEventListener('click', onShowTournaments);
}

// Remove existing event listeners and call loadEventListeners
playerCountSelect.removeEventListener('change', onPlayerCountChange);
roundCountSelect.removeEventListener('change', onRoundCountChange);
gametypeSelect.removeEventListener('change', onGametypeChange);
document.getElementById('showMatchSetup').removeEventListener('click', onShowMatchSetup);
document.getElementById('printContent').removeEventListener('click', onPrintContent);
document.getElementById('prepareTournamentBtn').removeEventListener('click', onPrepareTournament);
//document.getElementById('start-btn').removeEventListener('click', onStartTournament);
document.getElementById('showTournamentsBtn').removeEventListener('click', onShowTournaments);
loadEventListeners();