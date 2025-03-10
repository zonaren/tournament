import Players from './classes/Player.js';
import {generateUniqueId} from './utils.js';

// Players are divided into two groups. Players in group 1 plays against players in group 2 (maximum 10 rounds)
// Players in group 1, moves one court after each round. Players in group 2, moves two courts after each round
// walkover is given if there is an odd number of players (random player)
function cascadeSystem(totalRounds, totalCourts, matchSetup){
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

// all players play against each other once (round robin)
function roundRobinSystem(totalRounds, totalCourts, matchSetup){
    const players = Players.getAll();
    const totalPlayers = players.length;
    
    // For a round robin tournament where each player plays exactly once against 
    // all other players, we need (n-1) rounds for n players
    const requiredRounds = totalPlayers - 1;
    
    // If the number of players is odd, we need to add a dummy player for byes
    const needDummy = totalPlayers % 2 !== 0;
    const effectivePlayers = needDummy ? totalPlayers + 1 : totalPlayers;
    
    // Create arrays representing players (using their IDs)
    // For the algorithm, we need a fixed player and a rotating array
    const playerIds = [];
    for (let i = 1; i <= effectivePlayers; i++) {
        // For the dummy player (if needed), use a value that won't match any real player
        playerIds.push(i <= totalPlayers ? i : -1); // -1 represents the dummy player
    }
    
    // We'll use the "circle method" - one player stays fixed, others rotate
    for (let round = 1; round <= requiredRounds; round++) {
        let matches = [];
        let court = 1;
        
        // Make the pairings for this round
        for (let i = 0; i < effectivePlayers / 2; i++) {
            // Get the paired players
            const firstIdx = i;
            const secondIdx = effectivePlayers - 1 - i;
            
            const p1Id = playerIds[firstIdx];
            const p2Id = playerIds[secondIdx];
            
            // Skip matches involving the dummy player
            if (p1Id === -1 || p2Id === -1) {
                continue;
            }
            
            pushMatches(matches, court, p1Id, p2Id, players);
            court++;
        }
        
        // Rotate players (keeping the first player fixed)
        // Rotation: the second element goes to the end, and everything else shifts
        const secondElement = playerIds[1];
        for (let i = 1; i < effectivePlayers - 1; i++) {
            playerIds[i] = playerIds[i + 1];
        }
        playerIds[effectivePlayers - 1] = secondElement;
        
        pushSchedule(matchSetup, round, matches);
    }
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