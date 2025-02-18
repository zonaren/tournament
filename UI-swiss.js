// create proceed to next round button
function proceedToNextRoundBtn(tournament) {
    const proceedToNextRoundBtn = document.createElement('button');
    proceedToNextRoundBtn.textContent = 'Gå til neste runde';
    proceedToNextRoundBtn.classList.add('proceed-to-next-round-btn');
    proceedToNextRoundBtn.addEventListener('click', function() {
        // calculate the next round
        currentRound += 1;
        console.log("currentRound: ", currentRound);
        const nextRound = calculateNextRound(tournament, currentRound);
        // if the next round is not null, update the current round and the UI
        if (nextRound !== null) {
            console.log("currentRound: ", currentRound);
            //updateUI();
            displayTournamentOverview(tournament)
        }
    });
    return proceedToNextRoundBtn;
}
