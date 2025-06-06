// create a function that will calculate the next round based on the current round and the players scores

import Player from "./classes/Player.js";
import { generateUniqueId } from "./scripts/utils.js";
import { Match } from './classes/Match.js';

// rules for swiss tournament:
// 1. Competitors meet one-on-one in each round and are paired using a set of rules designed to ensure that each competitor plays opponents 
// with a similar score (except in the first round, which is random or seeded).
// 2. No player is paired against the same opponent twice.
// 3. If there is an odd number of players, one player is given a bye, which counts as a win.
// 4. The player with the lowest score, should, if possible receive a bye (walkover).
// 5. Players cannot receive more than one bye (walkover) in a tournament.

// general recommendations for swiss tournament
//1. Pairing should be seeded in the first round

// Possible solution:
// 1. Check all matches in all previous rounds and create a list of players that have not played against each other
// this list will be used to pair the players in the next round (tournament.schedule.matches)
// this list should be stored in a new object for future reference
// 2. check total matchPoints and scorePoints for each player so that we can use this information to pair the players in the next round (players)

function calculateNextRound(tournament, roundNumber) {
    // Do NOT reset total scores here! Only per-match points are reset in match objects.
    const matches = tournament.matchSchedule.slice(0, roundNumber).flatMap(round => round.matches);
    console.log(matches);
    // call function to check all matches in all previous rounds and create a list of players that have not played against each other
    const { unplayedMatches, playerStats } = checkMatches(matches);
    pairPlayers(unplayedMatches, playerStats, roundNumber, tournament);
}

function checkMatches(matches) {
    let unplayedMatches = {};
    const players = Player.getAll();

    // Initialize unplayedMatches with all possible pairs
    players.forEach(player1 => {
        unplayedMatches[player1.id] = players.filter(player2 => player1.id !== player2.id).map(player2 => player2.id);
    });
    
    console.log(unplayedMatches);
    
    // Remove pairs that have already played against each other
    matches.forEach(match => {
        const p1 = match.p1.id;
        const p2 = match.p2.id;
        if (unplayedMatches[p1]) {
            unplayedMatches[p1] = unplayedMatches[p1].filter(opponentId => opponentId !== p2);
        } else {
            console.log("Player with id ", p1, " has no unplayed matches");
        }
        if (unplayedMatches[p2]) {
            unplayedMatches[p2] = unplayedMatches[p2].filter(opponentId => opponentId !== p1);
        } else {
            console.log("Player with id ", p2, " has no unplayed matches");
        }
    });

    // Create a list of players with their matchPoints and scorePoints
    let playerStats = players.map(player => ({
        id: player.id,
        name: player.name,
        matchPoints: player.matchPoints,
        scorePoints: player.scorePoints
    }));
    console.log(playerStats);
    console.log(unplayedMatches);

    return { unplayedMatches, playerStats };
}

// create a function that will pair the players in the next round

// possible solution:
// 1. since we have a list of players that have not played against each other, we can use this list to pair the players in the next round (unplayedMatches)
// 2. we can use the total matchPoints and scorePoints for each player to pair the players in the next round (playerstats)
// 3. we need to add a new round to the tournament.schedule array which contains the following information:
//    - roundNumber
//    - matches (array of objects containing: matchId (auto), court, p1, p2)
//    - p1 and p2 contains the following information:  id, name, scorePoints, matchPoints, details (array of objects containing: points, ringers)
// 4. we also need to save the tournament object to the database (localStorage)


function pairPlayers(unplayedMatches, playerStats, roundNumber, tournament) {
    let matches = [];
    let playersPaired = new Set();
    const generatedIds = new Set();

    // Track byes for each player (store in tournament object if not present)
    if (!tournament.byes) tournament.byes = {};
    playerStats.forEach(p => { if (tournament.byes[p.id] === undefined) tournament.byes[p.id] = 0; });

    // Helper to find the lowest ranked eligible player for a bye
    function getByeCandidate(stats) {
        // Only players who have not had a bye yet
        const eligible = stats.filter(p => tournament.byes[p.id] < 1);
        if (eligible.length === 0) return null;
        // Sort by matchPoints, scorePoints, id (lowest ranked last)
        eligible.sort((a, b) => a.matchPoints - b.matchPoints || a.scorePoints - b.scorePoints || b.id - a.id);
        return eligible[0];
    }

    // Recursive backtracking pairing
    function tryPairing(stats, paired, matchesSoFar) {
        if (stats.length === 0) return matchesSoFar;
        // Odd number: assign bye to lowest ranked eligible player
        if (stats.length % 2 === 1) {
            const byePlayer = getByeCandidate(stats);
            if (!byePlayer) return null; // No eligible bye
            tournament.byes[byePlayer.id]++;
            const matchId = generateUniqueId(generatedIds);
            // Ensure per-match points are reset
            matchesSoFar.push(new Match(matchId, matchesSoFar.length + 1, { ...byePlayer, scorePoints: 0, matchPoints: 0 }, { id: -1, name: 'Walkover', scorePoints: 0, matchPoints: 0 }, false));
            const nextStats = stats.filter(p => p.id !== byePlayer.id);
            const result = tryPairing(nextStats, new Set([...paired, byePlayer.id]), matchesSoFar);
            if (result) return result;
            // Backtrack
            tournament.byes[byePlayer.id]--;
            matchesSoFar.pop();
            return null;
        }
        // Try to pair first unpaired player with a valid opponent
        for (let i = 0; i < stats.length; i++) {
            const p1 = stats[i];
            for (let j = i + 1; j < stats.length; j++) {
                const p2 = stats[j];
                if (unplayedMatches[p1.id] && unplayedMatches[p1.id].includes(p2.id)) {
                    // Try this pair, ensure per-match points are reset
                    const matchId = generateUniqueId(generatedIds);
                    const match = new Match(matchId, matchesSoFar.length + 1, { ...p1, scorePoints: 0, matchPoints: 0 }, { ...p2, scorePoints: 0, matchPoints: 0 }, false);
                    matchesSoFar.push(match);
                    const nextStats = stats.filter(p => p.id !== p1.id && p.id !== p2.id);
                    const result = tryPairing(nextStats, new Set([...paired, p1.id, p2.id]), matchesSoFar);
                    if (result) return result;
                    // Backtrack
                    matchesSoFar.pop();
                }
            }
        }
        return null; // No valid pairing found
    }

    // Sort by matchPoints, scorePoints, id (top ranked first)
    playerStats.sort((a, b) => b.matchPoints - a.matchPoints || b.scorePoints - a.scorePoints || a.id - b.id);
    const result = tryPairing(playerStats, new Set(), []);
    if (!result) {
        console.error("Failed to pair all players using backtracking.");
        alert("Paring er ikke mulig. Se loggen for mer informasjon.");
        return;
    }
    tournament.addRound(roundNumber + 1, result);
    return result;
}

export { calculateNextRound };



