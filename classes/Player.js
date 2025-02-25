class Players {
    constructor() {
        this.players = [];
    }

    create(id, name = "Spiller" + id) {
        const player = new Player(id);
        player.name = name;
        this.players.push(player);
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
        }
    }

    delete(id) {
        const index = this.players.findIndex(player => player.id === id);
        if (index !== -1) {
            this.players.splice(index, 1);
        }
    }

    addPlayers(count) {
        for (let i = 1; i <= count; i++) {
            this.create(i);
        }
        this.saveToLocalStorage();
    }

    resetPlayers(count) {
        this.players = [];
        this.addPlayers(count);
    }

    saveToLocalStorage() {
        const playersJson = JSON.stringify(this.players);
        localStorage.setItem('players', playersJson);
        console.log("spillere lagret");
    }
}

class Player {
    constructor(id) {
        this.id = id; // this is also the start number of the player
        this.name = "Spiller " + id;
        this.scorePoints = 0;
        this.matchPoints = 0;
        this.details = [
            { inning: 0, points: 0, ringers: 0 }
        ];
    }
}

export default new Players();