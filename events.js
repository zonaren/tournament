import TournamentSettings from './classes/TournamentSettings.js';
import Tournaments from './classes/Tournament.js';
import Players from './classes/Player.js';
import { displayPlayerOverview } from './UI-players.js';
import { createMatchSetup } from './generateMatches.js';
import { playerCountSelect, roundCountSelect, gametypeSelect, titleText } from './UI-main.js';
import { createRoundCountSelectOptions } from './generateSelectList.js';
import { displayTournamentOverview } from './UI-tournament.js';
import { displayMatchSetup } from './UI-matchSetup.js';

function onGametypeChange() {
    const gametype = this.value;
    TournamentSettings.setGametype(gametype);
    console.log('Gametype was set to ', TournamentSettings.getGametype());
}

function onPlayerCountChange() {
    const playerCount = parseInt(this.value, 10);
    TournamentSettings.setPlayerCount(playerCount);
    createRoundCountSelectOptions();

    console.log('Player count was set to ', TournamentSettings.getPlayerCount());
    titleText.innerHTML = `Banefordelingsnøkkel - GM ${playerCount}`;
}

function onRoundCountChange() {
    const roundCount = parseInt(this.value, 10);
    TournamentSettings.setRoundCount(roundCount);
    console.log('Round count was set to ', TournamentSettings.getRoundCount());
}



function onPrepareTournament() {
    Players.resetPlayers(TournamentSettings.getPlayerCount());
    displayPlayerOverview();
    this.classList.add('hidden');
    const startTournamentButton = document.getElementById('start-btn');
    startTournamentButton.classList.remove('hidden');
}

function onStartTournament() {
    const matchSetup = createMatchSetup(Players.count(), TournamentSettings.getRoundCount());
    const tournament = Tournaments.create(TournamentSettings.getRoundCount(), TournamentSettings.getPlayerCount() / 2, matchSetup, 'Test turnering', TournamentSettings.getGametype());
    displayTournamentOverview(tournament);
    console.log('Tournament was created', tournament);
    const header = document.getElementById('header');
    const addPlayerButton = document.getElementById('addPlayerButton');
    addPlayerButton.remove();
    header.remove();
}

function onShowMatchSetup() {
    Players.resetPlayers(TournamentSettings.getPlayerCount());
    const matchSetup = createMatchSetup(Players.count(), TournamentSettings.getRoundCount());
    displayMatchSetup(matchSetup);
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
    document.getElementById('start-btn').addEventListener('click', onStartTournament);
}

// Remove existing event listeners and call loadEventListeners
playerCountSelect.removeEventListener('change', onPlayerCountChange);
roundCountSelect.removeEventListener('change', onRoundCountChange);
gametypeSelect.removeEventListener('change', onGametypeChange);
document.getElementById('showMatchSetup').removeEventListener('click', onShowMatchSetup);
document.getElementById('printContent').removeEventListener('click', onPrintContent);
document.getElementById('prepareTournamentBtn').removeEventListener('click', onPrepareTournament);
document.getElementById('start-btn').removeEventListener('click', onStartTournament);
loadEventListeners();