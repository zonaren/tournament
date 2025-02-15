let playerCount = 20;
let roundCount = 10;
let maximumRounds = 0;

document.addEventListener('DOMContentLoaded', function() {
    const playerCountSelect = document.getElementById('playerCountSelect');
    //const roundCountSelect = document.getElementById('roundCountSelect');
    const gametypeSelect = document.getElementById('gametypeSelect');
    const titleTextElement = document.getElementById('titleText');
    titleTextElement.innerHTML = `Banefordelingsnøkkel - GM ${playerCount}`
    playerCountSelect.addEventListener('change', function() {

      if(playerCountSelect.value < 20 && roundCountSelect.value > playerCountSelect.value / 2) {
        repopulateRoundCountSelect(this, roundCountSelect);
      }
      else{
        createRoundCountSelect();
      }
      playerCount = this.value;
      const matchSetup = createMatchSetup(playerCount, roundCount);
      displayMatchSetup(matchSetup)
        console.log(playerCount, " deltakere er valgt");
        console.log(roundCount, " runder er valgt");
        titleTextElement.innerHTML = `Banefordelingsnøkkel - GM ${playerCount}`
  
    });

    roundCountSelect.addEventListener('change', function() {
      roundCount = this.value;
      console.log(roundCount, " runder er valgt");
      const matchSetup = createMatchSetup(playerCount, roundCount);
      displayMatchSetup(matchSetup)
        console.log(playerCount, " deltakere er valgt");
  
    });

    gametypeSelect.addEventListener('change', function() {
      const matchSetup = createMatchSetup(playerCount, roundCount);
      displayMatchSetup(matchSetup)
      console.log(gametypeSelect.value, " er valgt");
    });
    

    const startTournamentButton = document.getElementById('start-btn');
    //startTournamentButton.addEventListener('click', function() {
      const matchSetup = createMatchSetup(playerCount, roundCount);
      const tournament = createTournament(roundCount, playerCount / 2, matchSetup, "Test turnering", gametypeSelect.value);
      saveTournament(matchSetup, tournament);
      displayTournamentOverview(tournament);
      displayPlayerOverview();
    //});
  });

  function saveTournament(matchSetup, tournament) {
        // Serialize JSON object to a string
        const tournamentJson = JSON.stringify(tournament);
        const matchSetupJson = JSON.stringify(matchSetup);

        // Store the string in local storage
        localStorage.setItem('tournament', tournamentJson);
        localStorage.setItem('matchSetup', matchSetupJson);

        const players = [];
        for (let i = 1; i <= playerCount; i++) {
            pushPlayers(players, i);
        }
        const playersJson = JSON.stringify(players);
        localStorage.setItem('players', playersJson);
        //const storedSchedule = localStorage.getItem('tournamentSchedule');
        //console.log(storedSchedule);
  }

  document.getElementById('printContent').addEventListener('click', function() {
    window.print(); // This command triggers the printing functionality of the browser.
  });


  function repopulateRoundCountSelect(playerCountElement, roundCountElement) {
    const maxRounds = Math.floor(playerCountElement.value / 2);
    roundCountElement.innerHTML = '';
  
    for (let i = 2; i <= maxRounds; i++) {
      const option = document.createElement('option');
      option.value = i;
      option.textContent = `${i} runder`;
      roundCountElement.appendChild(option);
    }

    roundCountElement.value = maxRounds;
    roundCount = maxRounds;

  }

  