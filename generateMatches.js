import {generateUniqueId} from './utils.js';
import Players from './classes/Player.js';

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
        
        cascadeMatchSystem(totalRounds,totalCourts, matchSetup);
        console.log(`Gloppen system is selected`);
    }

    else if(gametypeElement.value === 'Alle mot alle'){
        //roundRobinSystem(totalRounds, totalPlayers, totalCourts,schedule);
        console.log(`Alle mot alle system is selected`);
    }
    else {
        swissMatchSystem(totalCourts, matchSetup);
        console.log(`Swiss system is selected`);
    }


    return matchSetup;

}

function cascadeMatchSystem(totalRounds, totalCourts, matchSetup){
    const tournamentName = "Test (Cascade)";
    const tournamentType = document.getElementById('gametypeSelect').value;
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



function swissMatchSystem(totalCourts, matchSetup){
        const players = Players.getAll();
        let matches = [];

        for (let court = 1; court <= totalCourts; court++) {
            const p1Id = ((court - 1 + 0) % totalCourts) + 1; // round - 1 is 0 for the first round
            const p2Id = ((court - 1 + 2 * 0) % totalCourts) + 1 + totalCourts; // round - 1 is 0 for the first round
    
            pushMatches(matches, court, p1Id, p2Id, players);
        }


        pushSchedule(matchSetup, 1, matches);

    
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



