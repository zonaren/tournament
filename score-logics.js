import Players from './classes/Player.js';
import Tournaments from './classes/Tournament.js';
import { updatePlayerTable } from './UI-players.js';

function updateTotalScores(matchId, p1id, p2id, p1Score, p2Score) {
    const currentTournament = Tournaments.getCurrentTournament();
    const players = currentTournament.getPlayers();
    // Calculate total scores
    const player1 = players.find(p => p.id === p1id);
    const player2 = players.find(p => p.id === p2id);

    const player1Score = parseInt(p1Score);
    const player2Score = parseInt(p2Score);
    player1.scorePoints = p1Score;
    player2.scorePoints = p2Score;

        //Update match points
    if (player1Score >= 21 && player2Score < 11) {
        player1.matchPoints = 2;
        player2.matchPoints = 0;
    } else if (player1Score >= 21 && player2Score >= 11 && player1Score > player2Score) {
        player1.matchPoints = 2;
        player2.matchPoints = 1;
    } else if (player2Score >= 21 && player1Score < 11) {
        player1.matchPoints = 0;
        player2.matchPoints = 2;
    } else if (player2Score >= 21 && player1Score >= 11 && player2Score > player1Score) {
        player1.matchPoints = 1;
        player2.matchPoints = 2;
    } else if (player1Score >= 21 && player2Score >= 21 && player1Score === player2Score) {
        player1.matchPoints = 1.5;
        player2.matchPoints = 1.5;
    }

    // Update or add match for player1
    let p1Match = player1.matches.find(m => m.matchId === matchId);
    if (p1Match) {
        p1Match.opponentId = player2.id;
        p1Match.scorePoints = player1Score;
        p1Match.matchPoints = player1.matchPoints;
        p1Match.isCompleted = true;
    } else {
        player1.matches.push({
            matchId: matchId,
            opponentId: player2.id,
            scorePoints: player1Score,
            matchPoints: player1.matchPoints,
            isCompleted: true
        });
    }

    // Update or add match for player2
    let p2Match = player2.matches.find(m => m.matchId === matchId);
    if (p2Match) {
        p2Match.opponentId = player1.id;
        p2Match.scorePoints = player2Score;
        p2Match.matchPoints = player2.matchPoints;
        p2Match.isCompleted = true;
    } else {
        player2.matches.push({
            matchId: matchId,
            opponentId: player1.id,
            scorePoints: player2Score,
            matchPoints: player2.matchPoints,
            isCompleted: true
        });
    }

    Players.update(player1.id, player1);
    Players.update(player2.id, player2);
    currentTournament.addPlayers(Players.getAll());
    updatePlayerTable();
}

function updateMatchScores(match, player1Score, player2Score) {
    const p1ScoreCell = document.getElementById(`p1-score-${match.matchId}`);
    const p2ScoreCell = document.getElementById(`p2-score-${match.matchId}`);
    const confirmButton = document.getElementById('confirmButton-' + match.matchId);
    confirmButton.disabled = false;
    match.p1.scorePoints = player1Score;
    match.p2.scorePoints = player2Score;
    p1ScoreCell.textContent = match.p1.scorePoints;
    p2ScoreCell.textContent = match.p2.scorePoints;
}

function handleWalkover(match, p1ScoreCell, p2ScoreCell, confirmButton, editScoresButton) {
    const isWalkover = match.p1.name === 'Walkover' || match.p2.name === 'Walkover';
    if (isWalkover) {
        match.p1.scorePoints = match.p1.name === 'Walkover' ? 0 : 21;
        match.p2.scorePoints = match.p2.name === 'Walkover' ? 0 : 21;
        p1ScoreCell.textContent = match.p1.scorePoints;
        p2ScoreCell.textContent = match.p2.scorePoints;
        editScoresButton.disabled = true;
        confirmButton.disabled = match.isCompleted;
    }
}

export { updateTotalScores, handleWalkover, updateMatchScores };