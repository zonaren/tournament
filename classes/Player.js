class Players {
    constructor() {
        this.players = [];
    }

    create(id, name = "Spiller" + id, clubName = "", clubId = null, dbId = null) {
        const player = new Player(id);
        player.name = name;
        player.clubName = clubName;
        player.clubId = clubId;
        player.dbId = dbId;
        this.players.push(player);
        this.saveToLocalStorage();
        return player;
        
    }

    get(id) {
        return this.players.find(player => player.id === id);
    }

    getAll() {
        return this.players;
    }

    count() {
        return this.players.length;
    }

    update(id, data) {
        const player = this.get(id);
        if (player) {
            Object.assign(player, data);
            // Only recalculate if player is a Player instance
            if (typeof player.recalculateTotals === 'function') {
                player.recalculateTotals();
            }
        }
        this.saveToLocalStorage();
    }

    setFinalRank(id, rank) {
        const player = this.get(id);
        if (player) {
            player.finalRank = rank;
        }
        this.saveToLocalStorage();
    }

    delete(id) {
        const index = this.players.findIndex(player => player.id === id);
        if (index !== -1) {
            this.players.splice(index, 1);
        }
        this.saveToLocalStorage();
    }

    addDefaultPlayers(count) {
        for (let i = 1; i <= count; i++) {
            this.create(i);
        }
        this.saveToLocalStorage();
    }

    resetPlayers(count) {
        this.players = [];
        this.addDefaultPlayers(count);
    }

    loadPlayersFromTournament(players) {
        // Ensure all loaded players are Player instances
        this.players = players.map(p => {
            const player = new Player(p.id);
            Object.assign(player, p);
            return player;
        });
        this.saveToLocalStorage();
    }

    saveToLocalStorage() {
        const playersJson = JSON.stringify(this.players);
        localStorage.setItem('players', playersJson);
    }
}

class Player {
    constructor(id) {
        this.id = id; // this is also the start number of the player for now
        this.dbId = null; // database id, if player is imported from database
        this.name = "Spiller " + id;
        this.clubName = ""; // club name
        this.clubId = null; // club id
        this.scorePoints = 0; // sum of all score points from all matches
        this.matchPoints = 0; // sum of all match points from all matches
        this.scorePointsDiff = 0; // difference between score points for and against
        this.finalRank = null; // final rank in the tournament
        this.startNumber = null; // start number for the player. Will be set when the tournament is started to avoid manipulation
        this.matches = [];
    }

    // Recalculate totals from all matches
    recalculateTotals() {
        this.scorePoints = this.matches.reduce((sum, m) => sum + (m.scorePoints || 0), 0);
        this.matchPoints = this.matches.reduce((sum, m) => sum + (m.matchPoints || 0), 0);
        this.scorePointsDiff = this.matches.reduce((sum, m) => sum + (m.scorePoints || 0) - (m.opponentScore || 0), 0);
    }
}

// player1.matches:
// matchId: matchId,
// opponentId: player2.id,
// opponentScore: player2Score,
// scorePoints: player1Score,
// matchPoints: player1.matchPoints

export default new Players();