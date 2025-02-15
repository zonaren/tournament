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
      const matchSetup = createMatchSetup(playerCount, roundCount, players);
      displayMatchSetup(matchSetup)
        console.log(playerCount, " deltakere er valgt");
        console.log(roundCount, " runder er valgt");
        titleTextElement.innerHTML = `Banefordelingsnøkkel - GM ${playerCount}`
  
    });

    roundCountSelect.addEventListener('change', function() {
      roundCount = this.value;
      console.log(roundCount, " runder er valgt");
      const matchSetup = createMatchSetup(playerCount, roundCount, players);
      displayMatchSetup(matchSetup)
        console.log(playerCount, " deltakere er valgt");
  
    });

    gametypeSelect.addEventListener('change', function() {
      const matchSetup = createMatchSetup(playerCount, roundCount, players);
      displayMatchSetup(matchSetup)
      console.log(gametypeSelect.value, " er valgt");
    });
    
    const matchSetup = createMatchSetup(playerCount, roundCount, players);
    displayMatchSetup(matchSetup)

  });


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

  