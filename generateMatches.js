
import Players from './classes/Player.js';
import TournamentManager from './classes/TournamentManager.js';


export function createMatchSetup(totalPlayers, totalRounds, gametype) {
    totalPlayers = addWalkover(totalPlayers);
    const totalCourts = totalPlayers / 2;
    const manager = new TournamentManager();

    console.log('gametype: ', gametype);

    if (gametype === 'Gloppen') {
        manager.generateCascadeSystem(totalRounds, totalCourts);
        console.log(`Cascade system (Gloppen) is selected`);
    } else if (gametype === 'Alle mot alle') {
        manager.generateRoundRobinSystem();
        console.log(`Round robin system (Alle mot alle) is selected`);
    } else if (gametype === 'NHM') {
        manager.generateSwissSystem(totalCourts);
        console.log(`Swiss system (NHM) is selected`);
    } else {
        console.log(`No valid gametype selected`);
        return [];
    }

    // Return the rounds array for compatibility with previous code
    return manager.rounds;
}

function addWalkover(totalPlayers) {
    if (totalPlayers % 2 !== 0) {
        console.log(`Total players is an odd number`, `(`, totalPlayers, `)`);
        totalPlayers = totalPlayers + 1;
        console.log(`Startnumber `, totalPlayers, ` is set to be Walkover`);
        Players.create(totalPlayers, 'Walkover');
    }
    return totalPlayers;
}
