class TournamentSettings {
    constructor() {
        this.gametype = 'Gloppen';
        this.playerCount = 8;
        this.roundCount = 4;
        this.maximumRounds = this.playerCount < 20 ? this.playerCount / 2 : 10;
    }

    setGametype(gametype) {
        this.gametype = gametype;
        if(this.gametype === 'Gloppen') {
            this.maximumRounds = this.playerCount / 2;
        }
        else if (this.gametype === 'Alle mot alle' || this.gametype === 'NHM') {
            this.maximumRounds = this.playerCount - 1; // or any other default value you prefer
            this.roundCount = this.maximumRounds;
        }
        else {
            this.maximumRounds = 10; // or any other default value you prefer
    }
}

    getGametype() {
        return this.gametype;
    }

    setPlayerCount(count) {
        this.playerCount = count;
        if (this.playerCount < 20 && this.gametype === 'Gloppen') {
            this.maximumRounds = this.playerCount / 2;
        } else if (this.gametype === 'Alle mot alle' || this.gametype === 'NHM') {
            this.maximumRounds = this.playerCount - 1; // or any other default value you prefer
            this.roundCount = this.maximumRounds;
        }
        else {
            this.maximumRounds = 10; // or any other default value you prefer
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