function generateRandomString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
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

function createPlayer(id) {
    return {
        id: id,
        name: 'player ' + id,
        score: 0,
        details: [
            {points: 0, ringers: 0}
        ]
    };
}

function pushSchedule(schedule, round, roundMatches, tournamentId, tournamentName, tournamentDate, tournamentType) {
    const formattedDate = new Date().toLocaleString();
    schedule.push({
        id: tournamentId,
        name: tournamentName,
        dateCreated: formattedDate,
        type: tournamentType,
        roundNumber: round,
        matches: roundMatches,
    });
}

function pushMatches(roundMatches, matchId, court, p1Id, p2Id) {
    roundMatches.push({
        matchId: matchId,
        court: court,
        p1: createPlayer(p1Id),
        p2: createPlayer(p2Id)
    });
}