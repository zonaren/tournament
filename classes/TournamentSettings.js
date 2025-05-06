class TournamentSettings {
    constructor() {
        this.gametype = 'Gloppen'; // Default gametype
        this.playerCount = 8; // Default player count
        this.roundCount = 4; // Default round count
        this.maximumRounds = this.playerCount < 14 ? this.playerCount -1 : 12; // Default maximum rounds
    }

    setGametype(gametype) {
        this.gametype = gametype;
        if(this.gametype === 'Gloppen') {
            this.maximumRounds = this.playerCount - 1;
        }
        else if (this.gametype === 'Alle mot alle' || this.gametype === 'NHM') {
            this.maximumRounds = this.playerCount - 1; // or any other default value you prefer
            this.roundCount = this.maximumRounds;
        }
        else {
            this.maximumRounds = 12; // or any other default value you prefer
    }
}

    getGametype() {
        return this.gametype;
    }

    setPlayerCount(count) {
        this.playerCount = count;
        if (this.playerCount < 14 && this.gametype === 'Gloppen') {
            this.maximumRounds = this.playerCount - 1;
        } else if (this.gametype === 'Alle mot alle' || this.gametype === 'NHM') {
            this.maximumRounds = this.playerCount - 1;
            this.roundCount = this.maximumRounds;
        }
        else {
            this.maximumRounds = 12; // or any other default value you prefer
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