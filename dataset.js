function generateRandomString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

function generateUniqueId(existingIds, length = 10) {
    let id;
    do {
        id = generateRandomString(length);
    } while (existingIds.has(id));
    existingIds.add(id);
    return id;
}

// contains the tournament metadata and the match schedule
function createTournament(totalRounds, totalCourts, schedule, tournamentName, tournamentType) {
    return {
        id: generateUniqueId(new Set()), // Generate a unique ID for the tournament
        name: tournamentName,
        dateCreated: new Date().toLocaleString(),
        type: tournamentType,
        totalRounds: totalRounds,
        totalCourts: totalCourts,
        schedule: schedule
    };
}

// Create a player object
function createPlayer(id) {
    return {
        id: id,
        name: "Spiller " + id,
        scorePoints: 0,
        matchPoints: 0,
        details: [
            {points: 0, ringers: 0}
        ]
    };
}

// list of players. Contains accumulated points and match points
const players = [];
function pushPlayers(players, id) {
    players.push(createPlayer(id));
}

// cointains the match schedule for the tournament
function pushSchedule(schedule, round, roundMatches) {
    schedule.push({
        roundNumber: round,
        matches: roundMatches,
    });
}

// cointains all the matches for each round
function pushMatches(roundMatches, matchId, court, p1, p2, players) {
    const player1 = players.find(p => p.id === p1);
    const player2 = players.find(p => p.id === p2);
    //console.log(player1, player2);

    if (!player1 || !player2) {
        throw new Error('Player not found');
    }


    roundMatches.push({
        matchId: matchId,
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

function updatePlayerNames(players, tournament, playerNames) {
    for (let round of tournament.schedule) {
        for (let match of round.matches) {
            const player1 = players.find(p => p.id === match.p1.id);
            const player2 = players.find(p => p.id === match.p2.id);

            if (player1) {
                match.p1.name = playerNames[player1.id - 1]; // Assuming playerNames is an array indexed by player ID - 1
            }
            if (player2) {
                match.p2.name = playerNames[player2.id - 1]; // Assuming playerNames is an array indexed by player ID - 1
            }
        }
    }

    // Save the updated tournament object to local storage
    localStorage.setItem('tournament', JSON.stringify(tournament));

    displayTournamentOverview(tournament);
}

function savePlayers() {
    //const players = [];
    for (let i = 1; i <= playerCount; i++) {
        pushPlayers(players, i);
    }
    const playersJson = JSON.stringify(players);
    localStorage.setItem('players', playersJson);
    console.log("spillere lagret");
    }