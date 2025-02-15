// Select the element by its ID
const gametypeElement = document.getElementById('gametypeSelect');
const playerCountElement = document.getElementById('playerCountSelect');
const roundCountElement = document.getElementById('roundCountSelect');

function createGametypeSelect() {
  const gametypes = ['Gloppen', 'NHM (Swiss)', "Alle mot alle"];
  for (let i = 0; i < gametypes.length; i++) {
    const option = document.createElement('option');
    option.value = gametypes[i];
    option.textContent = gametypes[i];
    gametypeElement.appendChild(option);
  }
}

function createPlayerCountSelect() {
  // Loop from 12 to 100 to create options for even numbers
  for (let i = 4; i <= 100; i += 2) {
    // Create a new option element
    const option = document.createElement('option');
    // Set the value and text of the option
    option.value = i;
    option.textContent = `${i} deltakere`;

    // Set the default value to 20
    if (i === 20) {
      option.selected = true;
    }

    // Append the option to the select element
    playerCountElement.appendChild(option);
  }
}

function createRoundCountSelect() {
  // Clear existing options
  roundCountElement.innerHTML = '';
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
    roundCountElement.appendChild(option);
    roundCountElement.value = roundCount;;
  }
}


createGametypeSelect();
createPlayerCountSelect();
createRoundCountSelect();