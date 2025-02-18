// create proceed to next round button
function proceedToNextRoundBtn(tournament) {
    const proceedToNextRoundBtn = document.createElement('button');
    proceedToNextRoundBtn.textContent = 'Gå til neste runde';
    proceedToNextRoundBtn.classList.add('proceed-to-next-round-btn');
    proceedToNextRoundBtn.addEventListener('click', function() {
        // calculate the next round

        const round = tournament.schedule.length;

        const nextRound = calculateNextRound(tournament, round);
        // if the next round is not null, update the current round and the UI
        if (nextRound !== null) {
            //updateUI();
            displayTournamentOverview(tournament)
        }
    });
    return proceedToNextRoundBtn;
}

let showAllRounds = false; // State variable to keep track of whether all rounds are being shown

function toggleAllRoundsBtn(tournament) {
    const showAllRoundsBtn = document.createElement('button');
    showAllRoundsBtn.textContent = 'Show all';
    showAllRoundsBtn.classList.add('show-all-rounds-btn');
    showAllRoundsBtn.addEventListener('click', function() {
        showAllRounds = !showAllRounds; // Toggle the state
        showAllRoundsBtn.textContent = showAllRounds ? 'Show latest' : 'Show all'; // Update the button text
        displayTournamentOverview(tournament);
    });
    return showAllRoundsBtn;
}
