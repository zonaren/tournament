class Round {
    constructor(roundNumber, matches) {
        this.roundNumber = roundNumber;
        this.matches = matches;
    }
}



class Match {
    constructor(matchId, court, p1, p2, isCompleted) {
        this.matchId = matchId;
        this.court = court;
        this.p1 = {
            id: p1.id,
            name: p1.name,
            scorePoints: p1.scorePoints || 0,
            matchPoints: p1.matchPoints || 0,
            details: Array.isArray(p1.details) ? p1.details : [{ points: 0, ringers: 0 }]
        };
        this.p2 = {
            id: p2.id,
            name: p2.name,
            scorePoints: p2.scorePoints || 0,
            matchPoints: p2.matchPoints || 0,
            details: Array.isArray(p2.details) ? p2.details : [{ points: 0, ringers: 0 }]
        };
        this.isCompleted = isCompleted || false;
    }

    static create(matchId, court, p1, p2, isCompleted) {
        return new Match(matchId, court, p1, p2, isCompleted);
    }

    static read(matchId) {
        return roundMatches.find(match => match.matchId === matchId);
    }

    static update(matchId, data) {
        const match = Match.read(matchId);
        if (match) {
            Object.assign(match, data);
        }
    }

    static delete(matchId) {
        const index = roundMatches.findIndex(match => match.matchId === matchId);
        if (index !== -1) {
            roundMatches.splice(index, 1);
        }
    }
}

export default Round;
export { Match };