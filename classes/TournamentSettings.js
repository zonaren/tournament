class TournamentSettings {
    constructor() {
        this.gametype = 'Gloppen'; // Default gametype
        this.playerCount = 8; // Default player count
        this.roundCount = 4; // Default round count
        this.maximumRounds = this.calculateMaximumRounds();
    }

    calculateMaximumRounds() {
        // For Gloppen and NHM, max 12 if playerCount > 14
        if ((this.gametype === 'Gloppen' || this.gametype === 'NHM') && this.playerCount > 14) {
            return 12;
        }
        // All gametypes can support playerCount - 1 rounds by default
        return this.playerCount - 1;
    }

    setGametype(gametype) {
        this.gametype = gametype;
        this.maximumRounds = this.calculateMaximumRounds();
        // Only 'Alle mot alle' should auto-set roundCount to maximumRounds
        if (this.gametype === 'Alle mot alle') {
            this.roundCount = this.maximumRounds;
        }
    }

    getGametype() {
        return this.gametype;
    }

    setPlayerCount(count) {
        this.playerCount = count;
        this.maximumRounds = this.calculateMaximumRounds();
        // Only 'Alle mot alle' should auto-set roundCount to maximumRounds
        if (this.gametype === 'Alle mot alle') {
            this.roundCount = this.maximumRounds;
        }
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

    getMaximumRounds() {
        return this.maximumRounds;
    }
}

export default new TournamentSettings();