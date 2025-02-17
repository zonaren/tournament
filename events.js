const addPlayersBtn = document.getElementById('add-players-btn');

addPlayersBtn.addEventListener('click', function() {

    displayPlayerOverview();
    addPlayersBtn.style.display = 'none';

});




const startTournamentButton = document.getElementById('start-btn');

startTournamentButton.addEventListener('click', function() {
    schedule = [];
    roundMatches = [];
  const matchSetup = createMatchSetup(playerCount, roundCount, players);
  const tournament = createTournament(roundCount, playerCount / 2, matchSetup, "Test turnering", gametypeSelect.value);
  saveTournament(matchSetup, tournament);
  displayTournamentOverview(tournament);
    startTournamentButton.style.display = 'none';
    const header = document.getElementById('header');
    header.style.display = 'none';
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


