import TournamentSettings from "./classes/TournamentSettings.js";
import { gametypeSelect, playerCountSelect, roundCountSelect,  } from "./UI-main.js";


function createGametypeSelectOptions() {
  const gametypes = ['Gloppen', 'NHM', "Alle mot alle"];
  for (let i = 0; i < gametypes.length; i++) {
    const option = document.createElement('option');
    option.value = gametypes[i];
    option.textContent = gametypes[i];
    gametypeSelect.appendChild(option);
  }
}

function createPlayerCountSelectOptions() {
  // Loop from 12 to 100 to create options for even numbers
  for (let i = 4; i <= 100; i += 2) {
    // Create a new option element
    const option = document.createElement('option');
    // Set the value and text of the option
    option.value = i;
    option.textContent = `${i} deltakere`;

    // Set the default value to 20
    if (i === 8) {
      option.selected = true;
    }

    // Append the option to the select element
    playerCountSelect.appendChild(option);
  }
}

function createRoundCountSelectOptions() {
  // Clear existing options
  roundCountSelect.innerHTML = '';
  for (let i = 2; i <= 10; i += 1) {
    // Create a new option element
    const option = document.createElement('option');
    // Set the value and text of the option
    option.value = i;
    option.textContent = `${i} runder`;
  
    // Check if the iteration is at the default value (10)
    if (i === 10) {
      option.selected = true; // Set the 'selected' attribute to make it the default
    }
    // Append the option to the select element
    roundCountSelect.appendChild(option);
    TournamentSettings.setRoundCount(i);
  }
}


createGametypeSelectOptions();
createPlayerCountSelectOptions();
createRoundCountSelectOptions();