import { proceedToNextRoundBtn, toggleAllRoundsBtn, showAllRounds } from './UI-swiss.js';
import { handleWalkover} from './score-logics.js';
import { openScorePopup } from './UI-popup.js';

export function displayTournamentOverview(tournament) {
    
    // Create tournament info
    const tournamentInfoDiv = document.createElement('div');
    tournamentInfoDiv.id = 'tournamentInfo';
    tournamentInfoDiv.innerHTML = '';
    const tournamentName = document.createElement('h3');
    tournamentName.textContent = tournament.name + ' - ' + tournament.type;
    tournamentInfoDiv.appendChild(tournamentName);
    
    const mainContainer = document.getElementById('mainContainer');
    mainContainer.appendChild(tournamentInfoDiv);

    const matchOverviewContainer = document.getElementById('matchOverview');
    


    // Display matches
    displayMatchOverview(tournament, matchOverviewContainer, tournamentInfoDiv);

    if(tournament.type === 'NHM') {

    }
    
}

function displayMatchOverview(tournament, matchOverviewContainer, tournamentInfoDiv) {
    // if the tournament is NHM, sort the rounds in descending order
    matchOverviewContainer.innerHTML = '';
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
        confirmButton.textContent = 'Bekreft';

        const editScoresButton = document.createElement('button');
        editScoresButton.id = 'editScoresButton-' + match.matchId;
        editScoresButton.classList.add('edit-scores-btn');
        editScoresButton.textContent = '+';

        row.appendChild(document.createElement('td')).textContent = match.court;

        const p1NameCell = document.createElement('td');
        p1NameCell.classList.add('fade-in');
        p1NameCell.textContent = match.p1.name;
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
        p2NameCell.textContent = match.p2.name;
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
            updateTotalScores(match.p1.id, match.p2.id, match.p1.scorePoints, match.p2.scorePoints);
            confirmButton.textContent = 'Bekreftet';
            confirmButton.disabled = true;
            editScoresButton.disabled = true;
        });

        handleWalkover(match, p1ScoreCell, p2ScoreCell, confirmButton, editScoresButton);


        editScoresButton.addEventListener('click', function() {
            openScorePopup(match, match.p1, match.p2);
        });

        setTimeout(() => {
            p1NameCell.classList.add('visible');
        }, 100 * (round.matches.indexOf(match) * 2)); // Adjust the delay as needed

        setTimeout(() => {
            p2NameCell.classList.add('visible');
        }, 100 * (round.matches.indexOf(match) * 2 + 1)); // Adjust the delay as needed
    }
    document.getElementById('matchOverview').appendChild(table);
}

function updateScoreDisplay(match, player1Score, player2Score) {
    const p1ScoreCell = document.getElementById(`p1-score-${match.matchId}`);
    const p2ScoreCell = document.getElementById(`p2-score-${match.matchId}`);
    const confirmButton = document.getElementById('confirmButton-' + match.matchId);
    confirmButton.disabled = false;
    match.p1.scorePoints = player1Score;
    match.p2.scorePoints = player2Score;
    p1ScoreCell.textContent = match.p1.scorePoints;
    p2ScoreCell.textContent = match.p2.scorePoints;
}