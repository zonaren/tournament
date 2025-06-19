// Create main elements
const header = document.createElement('div');
header.id = 'header';
header.className = 'header';

const versionText = document.createElement('p');
versionText.id = 'versionText';
versionText.textContent = '0.0.1j (19. jun 2025)';
header.appendChild(versionText);

const titleText = document.createElement('h2');
titleText.id = 'titleText';
titleText.textContent = 'Turneringsoppsett';
header.appendChild(titleText);

const menuButtons = document.createElement('div');
menuButtons.id = 'menu-buttons';
menuButtons.className = 'no-print';

const createTournamentBtn = document.createElement('button');
createTournamentBtn.id = 'createTournamentBtn';
createTournamentBtn.textContent = 'Opprett turnering';
menuButtons.appendChild(createTournamentBtn);

const showTournamentsBtn = document.createElement('button');
showTournamentsBtn.id = 'showTournamentsBtn';
showTournamentsBtn.textContent = 'Vis turneringer';
menuButtons.appendChild(showTournamentsBtn);

const importDbPlayersBtn = document.createElement('button');
importDbPlayersBtn.id = 'importDbPlayersBtn';
importDbPlayersBtn.textContent = 'Hent fra database';
menuButtons.appendChild(importDbPlayersBtn);

const printContentBtn = document.createElement('button');
printContentBtn.id = 'printContent';
printContentBtn.className = 'print-btn hidden';
printContentBtn.textContent = 'Skriv ut';
menuButtons.appendChild(printContentBtn);

header.appendChild(menuButtons);

const mainContainer = document.createElement('div');
mainContainer.id = 'mainContainer';
mainContainer.className = 'main-container';


// Append elements to the body
document.body.appendChild(header);
document.body.appendChild(mainContainer);

export { createTournamentBtn, printContentBtn, mainContainer, titleText };
