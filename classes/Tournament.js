import Round from "./Match.js";

class Tournaments {
    constructor() {
        this.tournaments = [];
    }

    create(totalRounds, totalCourts, matches, tournamentName, tournamentType) {
        const tournament = new Tournament(totalRounds, totalCourts, matches, tournamentName, tournamentType);
        this.tournaments.push(tournament);
        return tournament;
    }

    get(id) {
        return this.tournaments.find(tournament => tournament.id === id);
    }

    getAll() {
        return this.tournaments;
    }

    update(id, data) {
        const tournament = this.get(id);
        if (tournament) {
            Object.assign(tournament, data);
        }
    }

    delete(id) {
        const index = this.tournaments.findIndex(tournament => tournament.id === id);
        if (index !== -1) {
            this.tournaments.splice(index, 1);
        }
    }

    saveToLocalStorage() {
        const tournamentsJson = JSON.stringify(this.tournaments);
        localStorage.setItem('tournaments', tournamentsJson);
        console.log("turneringer lagret");
    }
}

class Tournament {
    constructor(totalRounds, totalCourts, matchSchedule, tournamentName, tournamentType) {
        this.id = generateUniqueId(new Set());
        this.name = tournamentName;
        this.dateCreated = new Date().toLocaleString();
        this.type = tournamentType;
        this.totalRounds = totalRounds;
        this.totalCourts = totalCourts;
        this.matchSchedule = matchSchedule.map(round => new Round(round.roundNumber, round.matches));
    }

}

export default Tournaments;