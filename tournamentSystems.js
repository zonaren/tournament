import Players from './classes/Player.js';
import {generateUniqueId} from './utils.js';

// Players are divided into two groups. Players in group 1 plays against players in group 2 (maximum 10 rounds)
// Players in group 1, moves one court after each round. Players in group 2, moves two courts after each round
// walkover is given if there is an odd number of players (random player)
function cascadeSystem(totalRounds, totalCourts, matchSetup){
    const tournamentName = "Test (Cascade)";
    const tournamentType = document.getElementById('gametypeSelect').value;
    const players = Players.getAll();
    

    for (let round = 1; round <= totalRounds; round++) {
        let matches = [];

        for (let court = 1; court <= totalCourts; court++) {
            const p1Id = ((court - 1 + round - 1) % totalCourts) + 1;
            const p2Id = ((court - 1 + 2 * (round - 1)) % totalCourts) + 1 + totalCourts;


            pushMatches(matches, court, p1Id, p2Id, players);
        }
        pushSchedule(matchSetup, round, matches);
    }
}

// swiss system (initial round only. See swiss.js for calculating rounds). Players are matched against players with the same score.
// walkover is given if there is an odd number of players (lowest rank)
function swissSystem(totalCourts, matchSetup){
    const players = Players.getAll();
    let matches = [];

    for (let court = 1; court <= totalCourts; court++) {
        const p1Id = ((court - 1 + 0) % totalCourts) + 1; // round - 1 is 0 for the first round
        const p2Id = ((court - 1 + 2 * 0) % totalCourts) + 1 + totalCourts; // round - 1 is 0 for the first round

        pushMatches(matches, court, p1Id, p2Id, players);
    }
    pushSchedule(matchSetup, 1, matches);
}

// all players play against each other once
function roundRobinSystem(totalRounds, totalPlayers, totalCourts,schedule){

}

// single elimination system. Loser is out of the tournament
// walkover is given if there is an odd number of players (highest rank)
function singleEliminationSystem(totalPlayers, totalCourts,schedule){

}

// double elimination system. Loser is moved to the loser bracket
// walkover is given if there is an odd number of players (highest rank)
function doubleEliminationSystem(totalPlayers, totalCourts,schedule){

}

// cointains the match schedule for the tournament
function pushSchedule(matchSetup, round, matches) {
    matchSetup.push({
        roundNumber: round,
        matches: matches,
    });
}

// cointains all the matches for each round
function pushMatches(matches, court, p1, p2) {
    const generatedIds = new Set();
    const players = Players.getAll();
    const player1 = players.find(p => p.id === p1);
    const player2 = players.find(p => p.id === p2);

    if (!player1 || !player2) {
        throw new Error('Player not found');
    }


    matches.push({
        matchId: generateUniqueId(generatedIds),
        court: court,
        p1: {
            id: p1,
            name: player1.name,
            scorePoints: 0,
            matchPoints: 0,
            details: [
                {points: 0, ringers: 0}
            ]
        },
        p2: {
            id: p2,
            name: player2.name,
            scorePoints: 0,
            matchPoints: 0,
            details: [
                {points: 0, ringers: 0}
            ]
        }
    });
}

export { cascadeSystem, swissSystem, roundRobinSystem, singleEliminationSystem, doubleEliminationSystem };