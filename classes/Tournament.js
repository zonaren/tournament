import Round from "./Match";

class Tournaments {
    constructor() {
        this.tournaments = [];
    }

    createTournament(totalRounds, totalCourts, matches, tournamentName, tournamentType) {
        const tournament = new Tournament(totalRounds, totalCourts, matches, tournamentName, tournamentType);
        this.tournaments.push(tournament);
        return tournament;
    }

    getTournament(id) {
        return this.tournaments.find(tournament => tournament.id === id);
    }

    getAllTournaments() {
        return this.tournaments;
    }

    updateTournament(id, data) {
        const tournament = this.getTournament(id);
        if (tournament) {
            Object.assign(tournament, data);
        }
    }

    deleteTournament(id) {
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