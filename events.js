import TournamentSettings from './classes/TournamentSettings.js';
import Tournaments from './classes/Tournaments.js';

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
    const matchSetup = createMatchSetup(playerCount, TournamentSettings.getRoundCount(), players);
    displayMatchSetup(matchSetup);
    console.log(playerCount, ' deltakere er valgt');
    console.log(TournamentSettings.getRoundCount(), ' runder er valgt');
    titleTextElement.innerHTML = `Banefordelingsnøkkel - GM ${playerCount}`;
}

function onRoundCountChange() {
    const roundCount = parseInt(this.value, 10);
    TournamentSettings.setRoundCount(roundCount);
    console.log(roundCount, ' runder er valgt');
    const matchSetup = createMatchSetup(TournamentSettings.getPlayerCount(), roundCount, players);
    displayMatchSetup(matchSetup);
    console.log(TournamentSettings.getPlayerCount(), ' deltakere er valgt');
}

function onGametypeChange() {
    const matchSetup = createMatchSetup(TournamentSettings.getPlayerCount(), TournamentSettings.getRoundCount(), players);
    displayMatchSetup(matchSetup);
    console.log(gametypeSelect.value, ' er valgt');
}

function onPrintContent() {
    window.print();
}

function onAddPlayers() {
    const matchSetupContainer = document.getElementById('matchSetup');
    matchSetupContainer.remove();
    displayPlayerOverview();
    addPlayersBtn.remove();
    const startTournamentButton = document.getElementById('start-btn');
    startTournamentButton.classList.remove('hidden');
    schedule = [];
    roundMatches = [];
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

function loadEventListeners() {
    playerCountSelect.addEventListener('change', onPlayerCountChange);
    roundCountSelect.addEventListener('change', onRoundCountChange);
    gametypeSelect.addEventListener('change', onGametypeChange);
    document.getElementById('printContent').addEventListener('click', onPrintContent);
    document.getElementById('add-players-btn').addEventListener('click', onAddPlayers);
    document.getElementById('start-btn').addEventListener('click', onStartTournament);
}

// Remove existing event listeners and call loadEventListeners
playerCountSelect.removeEventListener('change', changePlayerCount);
roundCountSelect.removeEventListener('change', changeRoundCount);
gametypeSelect.removeEventListener('change', changeGametype);
document.getElementById('printContent').removeEventListener('click', printContent);
document.getElementById('add-players-btn').removeEventListener('click', addPlayers);
document.getElementById('start-btn').removeEventListener('click', startTournament);
loadEventListeners();

const matchSetup = createMatchSetup(TournamentSettings.getPlayerCount(), TournamentSettings.getRoundCount(), players);
displayMatchSetup(matchSetup);

const addPlayersBtn = document.getElementById('add-players-btn');
const startTournamentButton = document.getElementById('start-btn');

function saveTournament(matchSetup, tournament) {
    // Serialize JSON object to a string
    const tournamentJson = JSON.stringify(tournament);
    const matchSetupJson = JSON.stringify(matchSetup);

    // Store the string in local storage
    localStorage.setItem('tournament', tournamentJson);
    localStorage.setItem('matchSetup', matchSetupJson);

    //const storedSchedule = localStorage.getItem('tournamentSchedule');
    //console.log(storedSchedule);
}