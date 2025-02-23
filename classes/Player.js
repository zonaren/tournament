class Players {
    constructor() { 
        this.players = [];
    }
}

class Player {
    constructor(id) {
        this.id = id; // this is also the startnumber of the player
        this.name = "Spiller " + id;
        this.scorePoints = 0;
        this.matchPoints = 0;
        this.details = [
            { inning: 0, points: 0, ringers: 0 }
        ];
    }

    static create(id) {
        return new Player(id);
    }

    static get(id) {
        return Player.players.find(player => player.id === id);
    }

    static update(id, data) {
        const player = Player.read(id);
        if (player) {
            Object.assign(player, data);
        }
    }

    static delete(id) {
        const index = Player.players.findIndex(player => player.id === id);
        if (index !== -1) {
            Player.players.splice(index, 1);
        }
    }

    static addPlayers(id) {
        Player.players.push(Player.create(id));
    }

    static resetPlayers() {
        Player.players = [];
        for (let i = 1; i <= Player.playerCount; i++) {
            Player.addPlayers(i);
        }
        Player.saveToLocalStorage();
    }

    static saveToLocalStorage() {
        const playersJson = JSON.stringify(Player.players);
        localStorage.setItem('players', playersJson);
        console.log("spillere lagret");
    }
}

export default Player;