class Players {
    constructor() {
        this.players = [];
    }

    create(id, name = "Spiller" + id) {
        const player = new Player(id);
        player.name = name;
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
        this.players = players;
        this.saveToLocalStorage();
    }

    saveToLocalStorage() {
        const playersJson = JSON.stringify(this.players);
        localStorage.setItem('players', playersJson);
    }
}

class Player {
    constructor(id) {
        this.id = id; // this is also the start number of the player
        this.name = "Spiller " + id;
        this.scorePoints = 0; // sum of all score points from all matches
        this.matchPoints = 0; // sum of all match points from all matches
        this.matches = [];
    }

    // Recalculate totals from all matches
    recalculateTotals() {
        this.scorePoints = this.matches.reduce((sum, m) => sum + (m.scorePoints || 0), 0);
        this.matchPoints = this.matches.reduce((sum, m) => sum + (m.matchPoints || 0), 0);
    }
}

// player.matches:
// [{matchId: 1, scorePoints: 0, matchPoints: 0, details: {points: 0, ringers: 0}}]

export default new Players();