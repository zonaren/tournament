import Players from './classes/Player.js';

function updateTotalScores(p1id, p2id, p1Score, p2Score) {
    const players = Players.getAll();
    // Calculate total scores
    const player1 = players.find(p => p.id === p1id);
    const player2 = players.find(p => p.id === p2id);

    const player1Score = parseInt(p1Score);
    const player2Score = parseInt(p2Score);
    player1.scorePoints += p1Score;
    player2.scorePoints += p2Score;

    //Update match points
    if (player1Score >= 21 && player2Score < 11) {
        player1.matchPoints += 2;
        player2.matchPoints += 0;
    } else if (player1Score >= 21 && player2Score >= 11 && player1Score > player2Score) {
        player1.matchPoints += 2;
        player2.matchPoints += 1;
    } else if (player2Score >= 21 && player1Score < 11) {
        player1.matchPoints += 0;
        player2.matchPoints += 2;
    } else if (player2Score >= 21 && player1Score >= 11 && player2Score > player1Score) {
        player1.matchPoints += 1;
        player2.matchPoints += 2;
    } else if (player1Score >= 21 && player2Score >= 21 && player1Score === player2Score) {
        player1.matchPoints += 1.5;
        player2.matchPoints += 1.5;
    }

    displayPlayerOverview();
}

function handleWalkover(match, p1ScoreCell, p2ScoreCell, confirmButton, editScoresButton) {
    const isWalkover = match.p1.name === 'Walkover' || match.p2.name === 'Walkover';
    if (isWalkover) {
        match.p1.scorePoints = match.p1.name === 'Walkover' ? 0 : 21;
        match.p2.scorePoints = match.p2.name === 'Walkover' ? 0 : 21;
        p1ScoreCell.textContent = match.p1.scorePoints;
        p2ScoreCell.textContent = match.p2.scorePoints;
        editScoresButton.disabled = true;
        confirmButton.disabled = false;
    }
}

export { updateTotalScores, handleWalkover };