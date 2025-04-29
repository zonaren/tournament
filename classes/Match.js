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
        this.p1 = p1;
        this.p2 = p2;
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