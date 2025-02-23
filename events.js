import TournamentSettings from './classes/TournamentSettings.js';
import Tournaments from './classes/Tournament.js';
import { displayPlayerOverview } from './UI.js';

const playerCountSelect = document.getElementById('playerCountSelect');
const roundCountSelect = document.getElementById('roundCountSelect');
const gametypeSelect = document.getElementById('gametypeSelect');
const titleTextElement = document.getElementById('titleText');

titleTextElement.innerHTML = `Banefordelingsnøkkel - GM ${TournamentSettings.getPlayerCount()}`;

function onPlayerCountChange() {
    const playerCount = parseInt(this.value, 10);
    TournamentSettings.setPlayerCount(playerCount);

    if (playerCount < 20 && roundCountSelect.value > playerCount / 2) {
        repopulateRoundCountSelect(this, roundCountSelect);
    } else {
        createRoundCountSelect();
    }

    resetPlayers();
    console.log(playerCount, ' deltakere er valgt');
    titleTextElement.innerHTML = `Banefordelingsnøkkel - GM ${playerCount}`;
}

function onRoundCountChange() {
    const roundCount = parseInt(this.value, 10);
    TournamentSettings.setRoundCount(roundCount);
    console.log(roundCount, ' runder er valgt');
    console.log(TournamentSettings.getPlayerCount(), ' deltakere er valgt');
}

function onGametypeChange() {
    const gametype = this.value;
    TournamentSettings.setGametype(gametype);
    console.log(gametypeSelect.value, ' er valgt');
}

function onPrintContent() {
    window.print();
}

function onPrepareTournament() {
    displayPlayerOverview();
    this.classList.add('hidden');
    const startTournamentButton = document.getElementById('start-btn');
    startTournamentButton.classList.remove('hidden');
}

function onStartTournament() {
    const matchSetup = createMatchSetup(players.length, TournamentSettings.getRoundCount(), players);
    const tournament = createTournament(TournamentSettings.getRoundCount(), players.length / 2, matchSetup, 'Test turnering', gametypeSelect.value);
    saveTournament(matchSetup, tournament);
    displayTournamentOverview(tournament);
    startTournamentButton.remove();
    const header = document.getElementById('header');
    header.remove();
}

function onShowMatchSetup() {
    const createMatchSetup = createMatchSetup(TournamentSettings.getPlayerCount(), TournamentSettings.getRoundCount());
    displayMatchSetup(createMatchSetup);
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