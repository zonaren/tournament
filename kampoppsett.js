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
      const tournamentSchedule = generateTournamentSchedule(playerCount, roundCount);
      displayTournamentSchedule(tournamentSchedule)
        console.log(playerCount, " deltakere er valgt");
        console.log(roundCount, " runder er valgt");
        titleTextElement.innerHTML = `Banefordelingsnøkkel - GM ${playerCount}`
  
    });

    roundCountSelect.addEventListener('change', function() {
      roundCount = this.value;
      console.log(roundCount, " runder er valgt");
      const tournamentSchedule = generateTournamentSchedule(playerCount, roundCount);
      displayTournamentSchedule(tournamentSchedule)
        console.log(playerCount, " deltakere er valgt");
  
    });

    gametypeSelect.addEventListener('change', function() {
      const tournamentSchedule = generateTournamentSchedule(playerCount, roundCount);
      displayTournamentSchedule(tournamentSchedule)
      console.log(gametypeSelect.value, " er valgt");
    });
    

    const startTournamentButton = document.getElementById('start-btn');
    startTournamentButton.addEventListener('click', function() {
      const tournamentSchedule = generateTournamentSchedule(playerCount, roundCount);
      startTournament(tournamentSchedule);
      displayMatchOverview(tournamentSchedule);
    });
  });

  function startTournament(tournamentSchedule) {
        // Serialize JSON object to a string
        const jsonString = JSON.stringify(tournamentSchedule);
        console.log(jsonString);
        // Store the string in local storage
        localStorage.setItem('tournamentSchedule', jsonString);

        const players = [];
        for (let i = 1; i <= playerCount; i++) {
            players.push({id: i, name: `Spiller ${i}`, totalScore: 0, totalRingers: 0, details: []});
        }
        const playersString = JSON.stringify(players);
        localStorage.setItem('players', playersString);
        //const storedSchedule = localStorage.getItem('tournamentSchedule');
        //console.log(storedSchedule);
  }

  document.getElementById('printContent').addEventListener('click', function() {
    window.print(); // This command triggers the printing functionality of the browser.
  });


  function repopulateRoundCountSelect(playerCountElement, roundCountElement) {
    const maxRounds = Math.floor(playerCountElement.value / 2);
  
    // Clear existing options
    roundCountElement.innerHTML = '';
  
    // Repopulate options based on the new maxRounds
    for (let i = 2; i <= maxRounds; i++) {
      const option = document.createElement('option');
      option.value = i;
      option.textContent = `${i} runder`;
      roundCountElement.appendChild(option);
    }
  
      roundCountElement.value = maxRounds;
      roundCount = maxRounds;
    

  }

  