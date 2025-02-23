import {generateUniqueId} from './utils.js';

export function createMatchSetup(totalPlayers, totalRounds, players) {
    if (totalPlayers % 2 !== 0) {
        console.log(`Total players is an odd number`,`(`,totalPlayers,`)`);
        totalPlayers = totalPlayers +1;
        console.log(`Startnumber `,totalPlayers, ` is set to be Walkover`)
        //addNewPlayer('Walkover');
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
        
        cascadeMatchSystem(totalRounds,totalCourts, matchSetup, players);
        console.log(`Gloppen system is selected`);
    }

    else if(gametypeElement.value === 'Alle mot alle'){
        //roundRobinSystem(totalRounds, totalPlayers, totalCourts,schedule);
        console.log(`Alle mot alle system is selected`);
    }
    else {
        //swissMatchSystem(totalRounds,totalCourts, schedule, players);
        console.log(`Swiss system is selected`);
    }
    console.log(`Total players: `,totalPlayers);


    return matchSetup;

}

function cascadeMatchSystem(totalRounds, totalCourts, matchSetup, players){
    const generatedIds = new Set();
    const tournamentName = "Test (Cascade)";
    const tournamentType = document.getElementById('gametypeSelect').value;

    for (let round = 1; round <= totalRounds; round++) {
        let matches = [];

        for (let court = 1; court <= totalCourts; court++) {
            const p1Id = ((court - 1 + round - 1) % totalCourts) + 1;
            const p2Id = ((court - 1 + 2 * (round - 1)) % totalCourts) + 1 + totalCourts;

            //const matchId = generateUniqueId(generatedIds);
            matches.push({matchId: generateUniqueId(generatedIds), court: court, p1Id: p1Id, p2Id: p2Id, players: players});
            console.log(`Pushed the folowwing data: Round: `,round,` Court: `,court,` Player 1: `,p1Id,` Player 2: `,p2Id);
            //pushMatches(roundMatches, matchId, court, p1Id, p2Id, players);
        }
        //const tournamentId = generateUniqueId(generatedIds);

        matchSetup.push({roundNumber: round, matches: matches});
        console.log(`Pushed the following data: Round: `,round,` Matches: `,matches);

    }
}



function swissMatchSystem(totalRounds, totalCourts, schedule, players){
    const generatedIds = new Set();


        roundMatches = [];

        for (let court = 1; court <= totalCourts; court++) {
            const p1Id = ((court - 1 + 0) % totalCourts) + 1; // round - 1 is 0 for the first round
            const p2Id = ((court - 1 + 2 * 0) % totalCourts) + 1 + totalCourts; // round - 1 is 0 for the first round
    
            const matchId = generateUniqueId(generatedIds);
    
            //pushMatches(roundMatches, matchId, court, p1Id, p2Id, players);
        }

        //pushSchedule(schedule, 1, roundMatches);

    
}

function roundRobinSystem(totalRounds, totalPlayers, totalCourts,schedule){
    for (let round = 1; round <= totalRounds; round++) {
        roundMatches = [];

    // First player fixed, all others rotate
    for (let match = 0; match < totalPlayers / 2; match++) {
        let player1 = (round + match) % totalPlayers + 1;
        let player2 = (round - match + totalPlayers - 1) % totalPlayers + 1;

        // Adjust for zero-based indexing if necessary
        if (player1 === totalPlayers + 1) player1 = 1;
        if (player2 === totalPlayers + 1) player2 = 1;

        //pushMatches(roundMatches, match, player1, player2);

    }
    //pushSchedule(schedule, round, roundMatches);
    }
}



