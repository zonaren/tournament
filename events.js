const addPlayersBtn = document.getElementById('add-players-btn');

addPlayersBtn.addEventListener('click', function() {
    const matchSetupContainer = document.getElementById('matchSetup');
    matchSetupContainer.remove();
    displayPlayerOverview();
    addPlayersBtn.remove();
    const startTournamentButton = document.getElementById('start-btn');
        startTournamentButton.classList.remove('hidden');

});




const startTournamentButton = document.getElementById('start-btn');

startTournamentButton.addEventListener('click', function() {
    schedule = [];
    roundMatches = [];
  const matchSetup = createMatchSetup(playerCount, roundCount, players);
  const tournament = createTournament(roundCount, playerCount / 2, matchSetup, "Test turnering", gametypeSelect.value);
  saveTournament(matchSetup, tournament);
  displayTournamentOverview(tournament);
    startTournamentButton.remove();
    const header = document.getElementById('header');
    header.remove();
});

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


