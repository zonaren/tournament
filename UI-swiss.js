import { calculateNextRound } from './swiss.js';
import { displayTournamentOverview } from './UI-tournament.js';

// create proceed to next round button
export function proceedToNextRoundBtn(tournament) {
    const proceedToNextRoundBtn = document.createElement('button');
    proceedToNextRoundBtn.textContent = 'Gå til neste runde';
    proceedToNextRoundBtn.classList.add('proceed-to-next-round-btn');
    proceedToNextRoundBtn.addEventListener('click', function() {
        // calculate the next round

        const round = tournament.matchSchedule.length;

        const nextRound = calculateNextRound(tournament, round);
        // if the next round is not null, update the current round and the UI
        if (nextRound !== null) {
            //updateUI();
            displayTournamentOverview(tournament)
        }
    });
    return proceedToNextRoundBtn;
}

export let showAllRounds = false; // State variable to keep track of whether all rounds are being shown

export function toggleAllRoundsBtn(tournament) {
    const showAllRoundsBtn = document.createElement('button');
    showAllRoundsBtn.textContent = 'Vis alle runder';
    showAllRoundsBtn.classList.add('show-all-rounds-btn');
    showAllRoundsBtn.addEventListener('click', function() {
        showAllRounds = !showAllRounds; // Toggle the state
        showAllRoundsBtn.textContent = showAllRounds ? 'Vis siste runde' : 'Vis alle runder'; // Update the button text
        displayTournamentOverview(tournament);
    });
    if (showAllRounds) {
        showAllRoundsBtn.textContent = 'Vis siste runde';
    }
    return showAllRoundsBtn;
}
