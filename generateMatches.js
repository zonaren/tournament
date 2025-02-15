function createMatchSetup(totalPlayers, totalRounds, players) {
    if (totalPlayers % 2 !== 0) {
        console.log(`Total players is an odd number`,`(`,totalPlayers,`)`);
        totalPlayers = totalPlayers +1;
        console.log(`Startnumber `,totalPlayers, ` is set to be Walkover`)
    }

    const totalCourts = totalPlayers / 2;
    const maximumRounds = totalPlayers -1;
    //const remainingRounds = maximumRounds - totalCourts;
    const gametypeElement = document.getElementById('gametypeSelect');
    let schedule = [];

    if(totalRounds > totalCourts){
        totalRounds = totalCourts;
        console.log(`Selected rounds `,totalRounds,` is greater than maximum rounds: `,totalCourts);
        //console.log(`Fill the remaining rounds randomly`,remainingRounds);
        //roundRobinSystem(totalRounds, totalPlayers, totalCourts,schedule);
    }

    savePlayers();

    if(gametypeElement.value === 'Gloppen'){
        
        cascadeMatchSystem(totalRounds,totalCourts, schedule, players);
        console.log(`Gloppen system is selected`);
    }

    else if(gametypeElement.value === 'Alle mot alle'){
        roundRobinSystem(totalRounds, totalPlayers, totalCourts,schedule);
        console.log(`Alle mot alle system is selected`);
    }
    else {
        swissMatchSystem(totalRounds,totalCourts, schedule, players);
        console.log(`Swiss system is selected`);
    }



    return schedule;
}



    const numberOfPlayers = playerCount;  // Should be an even number
    const numberOfRounds = roundCount;  // Should be an even number
    
    //const matchSetup = createMatchSetup(numberOfPlayers, numberOfRounds, players);
    //const tournament = createTournament(numberOfRounds, numberOfPlayers / 2, tournamentSchedule, "Test", "Gloppen");



function cascadeMatchSystem(totalRounds, totalCourts, schedule, players){
    const generatedIds = new Set();
    const tournamentName = "Test (Cascade)";
    const tournamentType = document.getElementById('gametypeSelect').value;


    for (let round = 1; round <= totalRounds; round++) {
        let roundMatches = [];

        for (let court = 1; court <= totalCourts; court++) {
            const p1Id = ((court - 1 + round - 1) % totalCourts) + 1;
            const p2Id = ((court - 1 + 2 * (round - 1)) % totalCourts) + 1 + totalCourts;

            const matchId = generateUniqueId(generatedIds);

            pushMatches(roundMatches, matchId, court, p1Id, p2Id, players);
        }
        const tournamentId = generateUniqueId(generatedIds);

        pushSchedule(schedule, round, roundMatches, tournamentId, tournamentName, "01.04.2025", tournamentType);

    }
}



function swissMatchSystem(totalRounds, totalCourts, schedule, players){
    const generatedIds = new Set();


        let roundMatches = [];

        for (let court = 1; court <= totalCourts; court++) {
            const p1Id = ((court - 1 + 0) % totalCourts) + 1; // round - 1 is 0 for the first round
            const p2Id = ((court - 1 + 2 * 0) % totalCourts) + 1 + totalCourts; // round - 1 is 0 for the first round
    
            const matchId = generateUniqueId(generatedIds);
    
            pushMatches(roundMatches, matchId, court, p1Id, p2Id, players);
        }

        pushSchedule(schedule, 1, roundMatches);

    
}

function roundRobinSystem(totalRounds, totalPlayers, totalCourts,schedule){
    for (let round = 1; round <= totalRounds; round++) {
        let roundMatches = [];

    // First player fixed, all others rotate
    for (let match = 0; match < totalPlayers / 2; match++) {
        let player1 = (round + match) % totalPlayers + 1;
        let player2 = (round - match + totalPlayers - 1) % totalPlayers + 1;

        // Adjust for zero-based indexing if necessary
        if (player1 === totalPlayers + 1) player1 = 1;
        if (player2 === totalPlayers + 1) player2 = 1;

        roundMatches.push({
            court: match + 1,
            player1: player1,
            player2: player2
        });
    }

        schedule.push({
            roundNumber: round,
            matches: roundMatches
        });
    }
}



