import Round from "./Match.js";
import { generateUniqueId } from "../utils.js";

class Tournaments {
    constructor() {
        this.tournaments = [];
        this.currentTournament = null;
        this.loadFromLocalStorage();
    }

    create(totalRounds, totalCourts, matchSchedule, tournamentName, tournamentType, players) {
        const tournament = new Tournament(totalRounds, totalCourts, matchSchedule, tournamentName, tournamentType, players);
        this.tournaments.push(tournament);
        this.saveToLocalStorage();
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
        this.saveToLocalStorage();
    }

    setCurrentTournament(id) {
        this.currentTournament = this.get(id);
        return this.currentTournament;
    }

    getCurrentTournament() {
        return this.currentTournament;
    }

    saveToLocalStorage() {
        const tournamentsJson = JSON.stringify(this.tournaments);
        localStorage.setItem('tournaments', tournamentsJson);
        console.log("turneringer lagret");
    }

    loadFromLocalStorage() {
        const savedTournaments = localStorage.getItem('tournaments');
        if (savedTournaments) {
            const parsedTournaments = JSON.parse(savedTournaments);
            this.tournaments = parsedTournaments.map(tournamentData => {
                const tournament = new Tournament(
                    tournamentData.totalRounds,
                    tournamentData.totalCourts,
                    tournamentData.matchSchedule,
                    tournamentData.name,
                    tournamentData.type,
                    tournamentData.players
                );
                tournament.id = tournamentData.id;
                tournament.dateCreated = tournamentData.dateCreated;
                return tournament;
            });
        }
    }
}

class Tournament {
    constructor(totalRounds, totalCourts, matchSchedule, tournamentName, tournamentType, players) {
        this.id = generateUniqueId(new Set());
        this.name = tournamentName;
        this.dateCreated = new Date().toLocaleString();
        this.type = tournamentType;
        this.totalRounds = totalRounds;
        this.totalCourts = totalCourts;
        this.matchSchedule = matchSchedule.map(round => new Round(round.roundNumber, round.matches));
        this.players = players;
    }

    addRound(roundNumber, matches) {
        this.matchSchedule.push(new Round(roundNumber, matches));
        this.saveToLocalStorage();
    }

    addPlayers(players) {
        this.players = players;
        this.saveToLocalStorage();
    }

    getPlayers() {
        return this.players;
    }

    saveToLocalStorage() {
        const tournaments = JSON.parse(localStorage.getItem('tournaments'));
        const index = tournaments.findIndex(tournament => tournament.id === this.id);
        tournaments[index] = this;
        localStorage.setItem('tournaments', JSON.stringify(tournaments));
    }

}

export { Tournament };
export default new Tournaments();