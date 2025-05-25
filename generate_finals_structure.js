// Generates finals bracket structures for totalPlayers from 4 to 100
// Rules:
// - 3 players per court when possible, 2 per court in semifinals/finals
// - 2 best advance from 3-player courts, 1 from 2-player courts
// - Walkovers (byes) go to best ranked in first round if needed (max 2)
// - All courts in a round must have same number of players (2 or 3)
// - All players must play in every round (except walkovers in first round)

function generateBracket(totalPlayers) {
  let rounds = [];
  let players = totalPlayers;
  let roundNum = 1;
  let walkovers = 0;

  // Helper to add semifinals/finals/bronze
  function addFinalsStructure(playersLeft) {
    if (playersLeft === 4) {
      rounds.push({
        name: "Semifinals",
        players: 4,
        courts: [
          { court: 1, players: 2, advance: 1, eliminated: 1 },
          { court: 2, players: 2, advance: 1, eliminated: 1 }
        ],
        totalAdvance: 2,
        totalEliminated: 2,
        note: "Winners to Final, Losers to Bronze Final"
      });
      rounds.push({
        name: "Finals",
        players: 2,
        courts: [
          { court: "Final", players: 2, advance: 1, eliminated: 1 }
        ]
      });
      rounds.push({
        name: "Bronze Final",
        players: 2,
        courts: [
          { court: "Bronze Final", players: 2, advance: 1, eliminated: 1 }
        ]
      });
      return true;
    }
    return false;
  }

  // Try to find a valid tournament structure with different walkover counts
  function tryGenerateRounds(startPlayers, startWalkovers = 0) {
    let testRounds = [];
    let testPlayers = startPlayers;
    let testRoundNum = 1;
    let totalWalkovers = startWalkovers;
    
    // First round with potential walkovers
    if (startWalkovers > 0) {
      let roundPlayers = testPlayers - startWalkovers;
      let courts = 0;
      let playersPerCourt = 0;
      
      if (roundPlayers % 3 === 0) {
        courts = roundPlayers / 3;
        playersPerCourt = 3;
      } else if (roundPlayers % 2 === 0) {
        courts = roundPlayers / 2;
        playersPerCourt = 2;
      } else {
        return null; // Invalid configuration
      }
      
      let round = {
        name: `Round ${testRoundNum}`,
        players: testPlayers,
        courts: [],
        totalAdvance: 0,
        totalEliminated: 0
      };
      
      // Add playing courts
      for (let i = 1; i <= courts; i++) {
        if (playersPerCourt === 3) {
          round.courts.push({ court: i, players: 3, advance: 2, eliminated: 1 });
          round.totalAdvance += 2;
          round.totalEliminated += 1;
        } else {
          round.courts.push({ court: i, players: 2, advance: 1, eliminated: 1 });
          round.totalAdvance += 1;
          round.totalEliminated += 1;
        }
      }
      
      // Add walkovers
      for (let i = 0; i < startWalkovers; i++) {
        round.courts.push({ court: `WO${i+1}`, players: 1, advance: 1, eliminated: 0 });
        round.totalAdvance += 1;
      }
      
      if (startWalkovers > 0) {
        round.note = `Walkover(s) for ${startWalkovers} player(s)`;
      }
      
      testRounds.push(round);
      testPlayers = round.totalAdvance;
      testRoundNum++;
    }
    
    // Continue with subsequent rounds
    while (testPlayers > 4) {
      let courts = 0;
      let playersPerCourt = 0;
      
      // Prefer 3 players per court, fall back to 2
      if (testPlayers % 3 === 0) {
        courts = testPlayers / 3;
        playersPerCourt = 3;
      } else if (testPlayers % 2 === 0) {
        courts = testPlayers / 2;
        playersPerCourt = 2;
      } else {
        return null; // Invalid configuration
      }
      
      let round = {
        name: `Round ${testRoundNum}`,
        players: testPlayers,
        courts: [],
        totalAdvance: 0,
        totalEliminated: 0
      };
      
      for (let i = 1; i <= courts; i++) {
        if (playersPerCourt === 3) {
          round.courts.push({ court: i, players: 3, advance: 2, eliminated: 1 });
          round.totalAdvance += 2;
          round.totalEliminated += 1;
        } else {
          round.courts.push({ court: i, players: 2, advance: 1, eliminated: 1 });
          round.totalAdvance += 1;
          round.totalEliminated += 1;
        }
      }
      
      testRounds.push(round);
      testPlayers = round.totalAdvance;
      testRoundNum++;
    }
    
    return { rounds: testRounds, finalPlayers: testPlayers, walkovers: totalWalkovers };
  }
  // Try different walkover counts, preferring configurations with 3-player courts
  let bestResult = null;
  let bestScore = -1;
  
  for (let wo = 0; wo <= 2; wo++) {
    let result = tryGenerateRounds(players, wo);
    if (result) {
      // Calculate score: prefer fewer courts and 3-player courts over 2-player courts
      let score = 0;
      if (result.rounds.length > 0) {
        let firstRound = result.rounds[0];
        let playingCourts = firstRound.courts.filter(c => typeof c.court === 'number');
        if (playingCourts.length > 0) {
          let playersPerCourt = playingCourts[0].players;
          if (playersPerCourt === 3) {
            score = 1000 - playingCourts.length; // High score for 3-player courts, fewer courts is better
          } else {
            score = 500 - playingCourts.length; // Lower score for 2-player courts
          }
        }
      }
      
      if (score > bestScore) {
        bestScore = score;
        bestResult = result;
      }
    }
  }
  
  if (bestResult) {
    rounds = bestResult.rounds;
    players = bestResult.finalPlayers;
    walkovers = bestResult.walkovers;
  }
  
  if (rounds.length === 0) {
    throw new Error(`Cannot create valid tournament structure for ${totalPlayers} players`);
  }

  // Add finals structure if we have exactly 4 players left
  if (players === 4) {
    addFinalsStructure(players);
  }
  
  return { totalPlayers, rounds, totalWalkovers: walkovers };
}

function generateAll(min, max) {
  let all = [];
  let unsupported = [];
  for (let i = min; i <= max; i++) {
    try {
      all.push(generateBracket(i));
    } catch (e) {
      unsupported.push(i);
    }
  }
  if (unsupported.length > 0) {
    console.log('Unsupported player counts:', unsupported.join(', '));
  }
  return all;
}

const fs = require('fs');
const data = generateAll(4, 100);
fs.writeFileSync('finals_structure_detailed.json', JSON.stringify(data, null, 2));
