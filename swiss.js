// create a function that will calculate the next round based on the current round and the players scores

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
    const matches = tournament.schedule.slice(0, roundNumber).flatMap(round => round.matches);
    console.log(matches);
 // call function to check all matches in all previous rounds and create a list of players that have not played against each other
 const { unplayedMatches, playerStats } = checkMatches(players, matches);
 pairPlayers(unplayedMatches, playerStats, roundNumber, tournament);
}

function checkMatches(players, matches) {
    let unplayedMatches = {};

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

    // Sort players by matchPoints and scorePoints
    playerStats.sort((a, b) => b.matchPoints - a.matchPoints || b.scorePoints - a.scorePoints);

    // Pair players
    playerStats.forEach(player => {
        if (!playersPaired.has(player.id)) {
            let opponentId = unplayedMatches[player.id].find(opponentId => !playersPaired.has(opponentId));
            if (opponentId) {
                let opponent = playerStats.find(p => p.id === opponentId);
                matches.push({
                    matchId: matches.length + 1,
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
                // Handle bye (walkover) if no opponent is found
                matches.push({
                    matchId: matches.length + 1,
                    court: matches.length + 1,
                    p1: {
                        id: player.id,
                        name: player.name,
                        scorePoints: 0,
                        matchPoints: 0,
                        details: [] // Add details as needed
                    },
                    p2: null // No opponent
                });
                playersPaired.add(player.id);
            }
        }
    });

    // Add new round to the tournament schedule
    tournament.schedule.push({
        roundNumber: roundNumber +1,
        matches: matches
    });

    console.log("matches: ", matches);

    // Save the tournament object to the database (localStorage)
    localStorage.setItem('tournament', JSON.stringify(tournament));

    return matches;
}



