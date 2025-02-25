// create a function that will calculate the next round based on the current round and the players scores

import Player from "./classes/Player.js";
import { generateUniqueId } from "./utils.js";

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

    // Function to attempt pairing players
    function attemptPairing(playerStats) {
        matches = [];
        playersPaired = new Set();

        for (let i = 0; i < playerStats.length; i++) {
            const player = playerStats[i];
            if (!playersPaired.has(player.id)) {
                let opponentId = null;
                for (let j = i + 1; j < playerStats.length; j++) {
                    const potentialOpponent = playerStats[j];
                    if (!playersPaired.has(potentialOpponent.id) && unplayedMatches[player.id].includes(potentialOpponent.id)) {
                        opponentId = potentialOpponent.id;
                        break;
                    }
                }

                let opponent = playerStats.find(p => p.id === opponentId);
                if (opponent) {
                    matches.push({
                        matchId: generateUniqueId(new Set()),
                        court: matches.length + 1, // Assuming each match is on a separate court
                        p1: {
                            id: player.id,
                            name: player.name,
                            scorePoints: 0,
                            matchPoints: 0,
                            details: [] // Add details as needed
                        },
                        p2: {
                            id: opponent.id,
                            name: opponent.name,
                            scorePoints: 0,
                            matchPoints: 0,
                            details: [] // Add details as needed
                        }
                    });
                    playersPaired.add(player.id);
                    playersPaired.add(opponent.id);
                } else {
                    console.error("Failed to find opponent for player with id ", player.id);
                    return false; // Pairing failed
                }
            }
        }
        return true; // Pairing succeeded
    }

    // Try pairing with different sorting options
    // Sort by matchPoints and scorePoints in descending order (highest first)
    const sortingOptions = [
        (a, b) => b.matchPoints - a.matchPoints || b.scorePoints - a.scorePoints, // MatchPoints first, then scorePoints
        
        (a, b) => b.scorePoints - a.scorePoints || b.matchPoints - a.matchPoints, // ScorePoints first, then matchPoints
        (a, b) => b.matchPoints - a.matchPoints, // Only matchPoints
        (a, b) => b.scorePoints - a.scorePoints, // Only scorePoints
        // Ascending order. Make sure to place the top players on court 1, 2, 3, etc.
        (a, b) => a.matchPoints - b.matchPoints || a.scorePoints - b.scorePoints, // MatchPoints first, then scorePoints (ascending)
        (a, b) => a.scorePoints - b.scorePoints || a.matchPoints - b.matchPoints, // ScorePoints first, then matchPoints (ascending)
        (a, b) => a.matchPoints - b.matchPoints, // Only matchPoints (ascending)
        (a, b) => a.scorePoints - b.scorePoints  // Only scorePoints (ascending)
    ];

    let pairingSucceeded = false;
    for (const sortOption of sortingOptions) {
        playerStats.sort(sortOption);
        if (attemptPairing(playerStats)) {
            console.log("Pairing succeeded with sorting option: ", sortOption);
            pairingSucceeded = true;
            break;
        }
    }

    // If pairing still fails, try randomizing the playerStats
    if (!pairingSucceeded) {
        console.warn("Pairing failed with all sorting options, attempting random pairing.");
        for (let i = 0; i < 10; i++) { // Try randomizing up to 10 times
            playerStats.sort(() => Math.random() - 0.5);
            if (attemptPairing(playerStats)) {
                console.log("Pairing succeeded after randomizing.");
                pairingSucceeded = true;
                break;
            }
        }
    }

    if (!pairingSucceeded) {
        console.error("Failed to pair all players after randomizing.");
        console.error("Unpaired players: ", playerStats.filter(player => !playersPaired.has(player.id)));
        // Handle the case where pairing failed (e.g., log an error, throw an exception, etc.)
        return;
    }

    tournament.addRound(roundNumber + 1, matches);

    console.log("matches: ", matches);
    console.log("tournament: ", tournament);

    return matches;
}

export { calculateNextRound };



