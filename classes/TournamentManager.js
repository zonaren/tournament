import Players from './Player.js';
import Round from './Round.js';
import { Match } from './Match.js';
import { generateUniqueId } from '../utils.js';

class TournamentManager {
    constructor() {
        this.rounds = [];
        this.matches = [];
        this.generatedIds = new Set();
    }

    createMatch(p1, p2, court) {
        const matchId = generateUniqueId(this.generatedIds);
        const match = new Match(matchId, court, p1, p2, false);
        this.matches.push(match);
        return match;
    }

    addRound(roundNumber, matches) {
        const round = new Round(roundNumber, matches);
        this.rounds.push(round);
        return round;
    }

    generateCascadeSystem(totalRounds, totalCourts) {
    const players = Players.getAll();
    const playedPairs = new Set();
    const recommendedRounds = players.length / 2;

    // Main rounds (recommended: players / 2)
    for (let round = 1; round <= Math.min(totalRounds, recommendedRounds); round++) {
        let matches = [];
        for (let court = 1; court <= totalCourts; court++) {
            const p1Id = ((court - 1 + round - 1) % totalCourts) + 1;
            const p2Id = ((court - 1 + 2 * (round - 1)) % totalCourts) + 1 + totalCourts;
            const p1 = players.find(p => p.id === p1Id);
            const p2 = players.find(p => p.id === p2Id);
            if (p1 && p2) {
                // Track the pair
                const pairKey = [p1.id, p2.id].sort().join('-');
                playedPairs.add(pairKey);
                matches.push(this.createMatch(p1, p2, court));
            }
        }
        this.addRound(round, matches);
    }

    // Extra rounds (if totalRounds > players / 2)
    let roundNum = Math.floor(recommendedRounds) + 1;
    while (roundNum <= totalRounds) {
        let matches = [];
        let usedPlayers = new Set();
        for (let court = 1; court <= totalCourts; court++) {
            // Find two players who have not played each other and are not used in this round
            let found = false;
            for (let i = 0; i < players.length; i++) {
                if (usedPlayers.has(players[i].id)) continue;
                for (let j = i + 1; j < players.length; j++) {
                    if (usedPlayers.has(players[j].id)) continue;
                    const pairKey = [players[i].id, players[j].id].sort().join('-');
                    if (!playedPairs.has(pairKey)) {
                        matches.push(this.createMatch(players[i], players[j], court));
                        playedPairs.add(pairKey);
                        usedPlayers.add(players[i].id);
                        usedPlayers.add(players[j].id);
                        found = true;
                        break;
                    }
                }
                if (found) break;
            }
        }
        if (matches.length === 0) break; // No more unique pairs available
        this.addRound(roundNum, matches);
        roundNum++;
    }

    }

    generateSwissSystem(totalCourts) {
        const players = Players.getAll();
        let matches = [];
        let court = 1;
        for (let i = 1; i <= players.length; i += 2) {
            if (i + 1 <= players.length && court <= totalCourts) {
                const p1 = players.find(p => p.id === i);
                const p2 = players.find(p => p.id === i + 1);
                if (p1 && p2) {
                    matches.push(this.createMatch(p1, p2, court));
                    court++;
                }
            }
        }
        this.addRound(1, matches);
    }

    generateRoundRobinSystem() {
        const players = Players.getAll();
        const totalPlayers = players.length;
        const requiredRounds = totalPlayers - 1;
        const needDummy = totalPlayers % 2 !== 0;
        const effectivePlayers = needDummy ? totalPlayers + 1 : totalPlayers;
        const playerIds = [];
        for (let i = 1; i <= effectivePlayers; i++) {
            playerIds.push(i <= totalPlayers ? i : -1);
        }
        for (let round = 1; round <= requiredRounds; round++) {
            let matches = [];
            let court = 1;
            for (let i = 0; i < effectivePlayers / 2; i++) {
                const firstIdx = i;
                const secondIdx = effectivePlayers - 1 - i;
                const p1Id = playerIds[firstIdx];
                const p2Id = playerIds[secondIdx];
                if (p1Id === -1 || p2Id === -1) continue;
                const p1 = players.find(p => p.id === p1Id);
                const p2 = players.find(p => p.id === p2Id);
                if (p1 && p2) {
                    matches.push(this.createMatch(p1, p2, court));
                    court++;
                }
            }
            // Rotate players (keeping the first player fixed)
            const secondElement = playerIds[1];
            for (let i = 1; i < effectivePlayers - 1; i++) {
                playerIds[i] = playerIds[i + 1];
            }
            playerIds[effectivePlayers - 1] = secondElement;
            this.addRound(round, matches);
        }
    }

    // Add methods for single/double elimination as needed
}

export default TournamentManager;
