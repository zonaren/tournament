import { proceedToNextRoundBtn, toggleAllRoundsBtn, showAllRounds } from './UI-swiss.js';
import { handleWalkover, updateTotalScores} from '../score-logics.js';
import { openScorePopup } from './UI-popup.js';
import { displayPlayerOverview, createNewPlayerPrompt } from './UI-players.js';
import { createPrintStartCardsButton } from '../startkort/startCards.js';
import { onStartTournament } from '../scripts/events.js';
import { shuffleStartNumbers } from '../shuffle-players.js';
import Tournaments  from '../classes/Tournament.js';
import { editTournament } from './UI-tournaments-list.js';
import { startFinals, displayFinalsOverview } from './UI-finals.js';
import { setPlayerRanks } from '../scripts/utils.js';



export function displayTournamentOverview(tournament) {
    
    const tournamentOverview = document.createElement('div');
    tournamentOverview.id = 'tournamentOverview';

    // Create tournament info
    const tournamentInfoDiv = document.createElement('div');
    tournamentInfoDiv.id = 'tournamentInfo';
    tournamentInfoDiv.innerHTML = '';
    const tournamentName = document.createElement('h3');
    tournamentName.textContent = tournament.name + ' - ' + tournament.type;
    tournamentInfoDiv.appendChild(tournamentName);

    if(tournament.getCurrentStage() === 'preliminary') {
        const startFinalsBtn = createStartFinalsButton();
        tournamentInfoDiv.appendChild(startFinalsBtn);
    }

    if(tournament.isStarted === true && tournament.getCurrentStage() !== 'completed') {
        tournamentInfoDiv.appendChild(createPrintStartCardsButton());
        const completeTournamentBtn = createCompleteTournamentButton();
        tournamentInfoDiv.appendChild(completeTournamentBtn);
    }
    else if(tournament.isStarted === false && tournament.getCurrentStage() === 'not_started') {
        const startTournamentBtn = startTournamentButton();
        tournamentInfoDiv.appendChild(startTournamentBtn);
    }
    else{
        const tournamentStatusText = document.createElement('p');
        tournamentStatusText.textContent = 'Status: ' + (tournament.getCurrentStageDisplayName());
        tournamentStatusText.style.fontWeight = 'bold';
        tournamentInfoDiv.appendChild(tournamentStatusText);
    }
    
    const mainContainer = document.getElementById('mainContainer');
    mainContainer.replaceChildren(tournamentOverview);
    tournamentOverview.appendChild(tournamentInfoDiv);

    const matchOverviewContainer = document.createElement('div');
    matchOverviewContainer.id = 'matchOverview';

    if(tournament.isStarted === false) {
    matchOverviewContainer.appendChild(createButtonsContainer());
    }

    const playerOverviewContainer = document.createElement('div');
    playerOverviewContainer.id = 'playerOverview';

    tournamentOverview.appendChild(matchOverviewContainer);
    displayPlayerOverview(tournamentOverview);
    

    if(tournament.isStarted) {
        // Display matches
    displayMatchOverview(tournament, matchOverviewContainer, tournamentInfoDiv);
    }


    if(tournament.type === 'NHM') {

    }
    
}

function createButtonsContainer() {
    const container = document.createElement('div');
    container.classList.add('buttons-container');

    const roundsText = document.createElement('h3');
    roundsText.textContent = 'Antall runder: ' + Tournaments.getCurrentTournament().totalRounds;

    container.appendChild(roundsText);
    container.appendChild(createAddPlayerButton());
    container.appendChild(createShuffleButton());
    container.appendChild(createEditTournamentButton());
    return container;
}

/**
 * Creates the "Add Player" button
 * @returns {HTMLButtonElement} The created button
 */

function createEditTournamentButton() {
    const button = document.createElement('button');
    button.id = 'editTournamentButton';
    button.textContent = 'Rediger turnering';
    const currentTournament = Tournaments.getCurrentTournament();
    button.addEventListener('click', () => editTournament(currentTournament.id));
    return button;
}

function createAddPlayerButton() {
    const button = document.createElement('button');
    button.id = 'addPlayerButton';
    button.textContent = 'Legg til spiller';
    button.addEventListener('click', () => createNewPlayerPrompt());
    return button;
}

function createShuffleButton() {
    const button = document.createElement('button');
    button.id = 'shuffleStartNumbers';
    button.textContent = 'Tilfeldige startnummer';
    button.addEventListener('click', () => shuffleStartNumbers());
    return button;
}

function startTournamentButton() {
    const startTournamentBtn = document.createElement('button');
    startTournamentBtn.textContent = 'Start turnering';
    startTournamentBtn.classList.add('start-tournament-btn');
    startTournamentBtn.addEventListener('click', () => onStartTournament());
    return startTournamentBtn;
}

function createStartFinalsButton() {
    const startFinalsBtn = document.createElement('button');
    startFinalsBtn.textContent = 'Sluttspill: ' + Tournaments.getCurrentTournament().finalsFormat;
    startFinalsBtn.classList.add('start-finals-btn');
    startFinalsBtn.addEventListener('click', () => startFinals());
    return startFinalsBtn;
}

function createCompleteTournamentButton() {
    const completeTournamentBtn = document.createElement('button');
    completeTournamentBtn.textContent = 'Fullfør turnering';
    completeTournamentBtn.classList.add('complete-tournament-btn');
    completeTournamentBtn.addEventListener('click', () => {
        const tournament = Tournaments.getCurrentTournament();
        tournament.setStage('completed');
        setPlayerRanks(tournament);
        tournament.saveToLocalStorage();
        displayTournamentOverview(tournament);
        alert('Turneringen er fullført!');
    });
    return completeTournamentBtn;
}

function displayMatchOverview(tournament, matchOverviewContainer, tournamentInfoDiv) {
    // if the tournament is NHM, sort the rounds in descending order
    matchOverviewContainer.innerHTML = '';

    const currentStage = tournament.getCurrentStage();
    console.log('Current stage:', currentStage);


    // show finals if stage is set to finals
    if(currentStage === 'finals') {
    displayFinalsOverview(tournament, matchOverviewContainer);
    }
        // show preliminary rounds
    displayPreliminaryRounds(tournament, tournamentInfoDiv, matchOverviewContainer);


}

function displayPreliminaryRounds(tournament, tournamentInfoDiv, matchOverviewContainer) {
    switch (tournament.type) {
        case 'NHM':
            const nextRoundButton = proceedToNextRoundBtn(tournament);
            tournamentInfoDiv.appendChild(nextRoundButton);
            const toggleAllRoundsButton = toggleAllRoundsBtn(tournament);
            tournamentInfoDiv.appendChild(toggleAllRoundsButton);

            tournament.matchSchedule.sort((a, b) => a.roundNumber - b.roundNumber);
            console.log('Gametype is ', tournament.type, ". Sorting rounds in descending order", tournament.matchSchedule);
            console.log('Round', tournament.matchSchedule[0].roundNumber);

            if (showAllRounds) {
                // Display all rounds
                for (let index of tournament.matchSchedule) {
                    displayRound(index, matchOverviewContainer);
                }
            } else {
                // Only display the last round
                const lastRound = tournament.matchSchedule[tournament.matchSchedule.length - 1];
                displayRound(lastRound, matchOverviewContainer);
            }
            break;
        default:
            // Display all rounds for other tournament types
            for (let index of tournament.matchSchedule) {
                displayRound(index, matchOverviewContainer);
            }
            break;
    }
}

function displayRound(round, matchOverviewContainer) {
    const roundText = document.createElement('h3');
    roundText.textContent = `Runde ${round.roundNumber}`;
    matchOverviewContainer.appendChild(roundText);

    const table = document.createElement('table');
    table.id = 'matchTable-' + round.roundNumber;
    const thead = table.createTHead();
    const tbody = table.appendChild(document.createElement('tbody'));
    const headerRow = thead.insertRow();

    // Create header
    ['B', 'P1', 'S1', 'S2', 'P2', ''].forEach(text => {
        headerRow.appendChild(document.createElement('th')).textContent = text;
    });

    for (let match of round.matches) {
        const row = tbody.insertRow();

        const confirmButton = document.createElement('button');
        confirmButton.id = 'confirmButton-' + match.matchId;
        confirmButton.classList.add('confirm-scores-btn');
        confirmButton.textContent = match.isCompleted ? 'Bekreftet' : 'Bekreft';

        const editScoresButton = document.createElement('button');
        editScoresButton.id = 'editScoresButton-' + match.matchId;
        editScoresButton.classList.add('edit-scores-btn');
        editScoresButton.textContent = '+';
        editScoresButton.disabled = match.isCompleted;

        row.appendChild(document.createElement('td')).textContent = match.court;

        const p1NameCell = document.createElement('td');
        p1NameCell.classList.add('fade-in');
        p1NameCell.textContent = match.p1.name + ' (' + match.p1.id + ')';
        row.appendChild(p1NameCell);

        const p1ScoreCell = document.createElement('td');
        p1ScoreCell.id = 'p1-score-' + match.matchId;
        p1ScoreCell.textContent = match.p1.scorePoints;
        p1ScoreCell.addEventListener('click', function() {
            openScorePopup(match, match.p1, match.p2);
        });
        row.appendChild(p1ScoreCell);

        const p2ScoreCell = document.createElement('td');
        p2ScoreCell.id = 'p2-score-' + match.matchId;
        p2ScoreCell.textContent = match.p2.scorePoints;
        p2ScoreCell.addEventListener('click', function() {
            openScorePopup(match, match.p1, match.p2);
        });
        row.appendChild(p2ScoreCell);

        const p2NameCell = document.createElement('td');
        p2NameCell.classList.add('fade-in');
        p2NameCell.textContent = match.p2.name + ' (' + match.p2.id + ')';
        row.appendChild(p2NameCell);

        // Create a cell to hold the buttons
        const buttonCell = document.createElement('td');
        buttonCell.classList.add('button-cell-container');
        buttonCell.appendChild(editScoresButton);
        buttonCell.appendChild(confirmButton);
        row.appendChild(buttonCell);

        confirmButton.disabled = true;
        confirmButton.addEventListener('click', function() {
            if(match.p1.scorePoints < 21 && match.p2.scorePoints < 21) {
                alert('Ingen spillere kan ha mindre enn 21 poeng');
                return;
            }
            match.isCompleted = true
            updateTotalScores(match.matchId,match.p1.id, match.p2.id, match.p1.scorePoints, match.p2.scorePoints);
            confirmButton.textContent = 'Bekreftet';
            confirmButton.disabled = true;
            editScoresButton.disabled = true;
        });

        handleWalkover(match, p1ScoreCell, p2ScoreCell, confirmButton, editScoresButton);


        editScoresButton.addEventListener('click', function() {
            openScorePopup(match, match.p1, match.p2);
        });        setTimeout(() => {
            p1NameCell.classList.add('visible');
        }, 100 * (round.matches.indexOf(match) * 2)); // Adjust the delay as needed
        
        setTimeout(() => {
            p2NameCell.classList.add('visible');
        }, 100 * (round.matches.indexOf(match) * 2 + 1)); // Adjust the delay as needed
    }
    document.getElementById('matchOverview').appendChild(table);
}