// Create main elements
const header = document.createElement('div');
header.id = 'header';
header.className = 'header';

const titleText = document.createElement('h2');
titleText.id = 'titleText';
header.appendChild(titleText);

const menuButtons = document.createElement('div');
menuButtons.id = 'menu-buttons';
menuButtons.className = 'no-print';

const gametypeSelect = document.createElement('select');
gametypeSelect.id = 'gametypeSelect';
menuButtons.appendChild(gametypeSelect);

const playerCountSelect = document.createElement('select');
playerCountSelect.id = 'playerCountSelect';
menuButtons.appendChild(playerCountSelect);

const roundCountSelect = document.createElement('select');
roundCountSelect.id = 'roundCountSelect';
menuButtons.appendChild(roundCountSelect);

const addPlayersBtn = document.createElement('button');
addPlayersBtn.id = 'add-players-btn';
addPlayersBtn.textContent = 'Opprett turnering';
menuButtons.appendChild(addPlayersBtn);

const startBtn = document.createElement('button');
startBtn.id = 'start-btn';
startBtn.className = 'hidden';
startBtn.textContent = 'Start turnering';
menuButtons.appendChild(startBtn);

const printContentBtn = document.createElement('button');
printContentBtn.id = 'printContent';
printContentBtn.className = 'print-btn hidden';
printContentBtn.textContent = 'Skriv ut';
menuButtons.appendChild(printContentBtn);

header.appendChild(menuButtons);

const matchSetup = document.createElement('div');
matchSetup.id = 'matchSetup';

const mainContainer = document.createElement('div');
mainContainer.id = 'mainContainer';
mainContainer.className = 'main-container';

const tournamentOverview = document.createElement('div');
tournamentOverview.id = 'tournamentOverview';

const matchOverview = document.createElement('div');
matchOverview.id = 'matchOverview';
tournamentOverview.appendChild(matchOverview);

const playerOverview = document.createElement('div');
playerOverview.id = 'playerOverview';
tournamentOverview.appendChild(playerOverview);

mainContainer.appendChild(tournamentOverview);

// Append elements to the body
document.body.appendChild(header);
document.body.appendChild(matchSetup);
document.body.appendChild(mainContainer);
