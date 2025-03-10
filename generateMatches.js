import Players from './classes/Player.js';
import { cascadeSystem, swissSystem, roundRobinSystem } from './tournamentSystems.js';

export function createMatchSetup(totalPlayers, totalRounds) {
    const gametypeElement = document.getElementById('gametypeSelect');
    if(gametypeElement.value !== 'Alle mot alle') {
        addWalkover(totalPlayers);
    }
    
    const totalCourts = totalPlayers / 2;
    let matchSetup = [];


    if(gametypeElement.value === 'Gloppen'){
        cascadeSystem(totalRounds,totalCourts, matchSetup);
        console.log(`Cascade system is selected`);
    }

    else if(gametypeElement.value === 'Alle mot alle'){
        roundRobinSystem(totalRounds, totalCourts,matchSetup);
        console.log(`Round robin system is selected`);
    }
    else {
        swissSystem(totalCourts, matchSetup);
        console.log(`Swiss system is selected`);
    }


    return matchSetup;

}

function addWalkover(totalPlayers) {
    if (totalPlayers % 2 !== 0) {
        console.log(`Total players is an odd number`,`(`,totalPlayers,`)`);
        totalPlayers = totalPlayers +1;
        console.log(`Startnumber `,totalPlayers, ` is set to be Walkover`)
        Players.create(totalPlayers, 'Walkover');
    }
}
