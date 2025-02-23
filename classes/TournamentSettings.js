class TournamentSettings {
    constructor() {
        this.playerCount = 0;
        this.roundCount = 0;
    }

    setPlayerCount(count) {
        this.playerCount = count;
    }

    getPlayerCount() {
        return this.playerCount;
    }

    setRoundCount(count) {
        this.roundCount = count;
    }

    getRoundCount() {
        return this.roundCount;
    }
}

export default new TournamentSettings();