class TournamentSettings {
    constructor() {
        this.gametype = 'Gloppen';
        this.playerCount = 8;
        this.roundCount = 4;
    }

    setGametype(gametype) {
        this.gametype = gametype;
    }

    getGametype() {
        return this.gametype;
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