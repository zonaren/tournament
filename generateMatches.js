import {generateUniqueId} from './utils.js';
import Players from './classes/Player.js';
import { cascadeSystem, swissSystem, roundRobinSystem } from './tournamentSystems.js';

export function createMatchSetup(totalPlayers, totalRounds) {
    if (totalPlayers % 2 !== 0) {
        console.log(`Total players is an odd number`,`(`,totalPlayers,`)`);
        totalPlayers = totalPlayers +1;
        console.log(`Startnumber `,totalPlayers, ` is set to be Walkover`)
        Players.create(totalPlayers, 'Walkover');
    }

    
    const totalCourts = totalPlayers / 2;
    const maximumRounds = totalPlayers -1;
    //const remainingRounds = maximumRounds - totalCourts;
    const gametypeElement = document.getElementById('gametypeSelect');
    let matchSetup = [];

    if(totalRounds > totalCourts){
        console.log(`Selected rounds `,totalRounds,` is greater than maximum rounds: `,totalCourts);
        totalRounds = totalCourts;
        console.log(`Total rounds is set to maximum rounds: `,totalRounds);
        //console.log(`Fill the remaining rounds randomly`,remainingRounds);
        //roundRobinSystem(totalRounds, totalPlayers, totalCourts,schedule);
    }


    if(gametypeElement.value === 'Gloppen'){
        
        cascadeSystem(totalRounds,totalCourts, matchSetup);
        console.log(`Gloppen system is selected`);
    }

    else if(gametypeElement.value === 'Alle mot alle'){
        roundRobinSystem(totalRounds, totalPlayers, totalCourts,schedule);
        console.log(`Alle mot alle system is selected`);
    }
    else {
        swissSystem(totalCourts, matchSetup);
        console.log(`Swiss system is selected`);
    }


    return matchSetup;

}
