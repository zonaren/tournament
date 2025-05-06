import Round from "./Match.js";
import { Match } from "./Match.js";
import { generateUniqueId } from "../utils.js";

class Tournaments {
    constructor() {
        this.tournaments = [];
        this.currentTournament = null;
        this.loadFromLocalStorage();
    }

    create(totalRounds, totalCourts, matchSchedule, tournamentName, tournamentType, players, isStarted = false) {
        const tournament = new Tournament(totalRounds, totalCourts, matchSchedule, tournamentName, tournamentType, players, isStarted);
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
            this.saveToLocalStorage();
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
        console.log("current tournament set to: ", this.currentTournament);
        this.saveToLocalStorage();
        return this.currentTournament;
    }

    getCurrentTournament() {
        //console.log("current tournament: ", this.currentTournament);
        return this.currentTournament;
    }

    saveToLocalStorage() {
        const tournamentsJson = JSON.stringify(this.tournaments);
        localStorage.setItem('tournaments', tournamentsJson);

        const currentTournamentJson = JSON.stringify(this.currentTournament);
        localStorage.setItem('currentTournament', currentTournamentJson);
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
                    tournamentData.players,
                    tournamentData.isStarted || false
                );
                tournament.id = tournamentData.id;
                tournament.dateCreated = tournamentData.dateCreated;
                return tournament;
            });
        }
    }
}

class Tournament {
    constructor(totalRounds, totalCourts, matchSchedule, tournamentName, tournamentType, players, isStarted = false) {
        this.isStarted = isStarted;
        this.id = generateUniqueId(new Set());
        this.name = tournamentName;
        this.dateCreated = new Date().toLocaleString();
        this.type = tournamentType;
        this.totalRounds = totalRounds;
        this.totalCourts = totalCourts;
        
        // Convert plain match objects to Match instances in each round
        this.matchSchedule = matchSchedule.map(round => {
            const matches = round.matches.map(matchData => {
                // If the match is already a Match instance, use it as is
                if (matchData instanceof Match) {
                    return matchData;
                }
                // Otherwise, create a new Match instance
                return new Match(
                    matchData.matchId, 
                    matchData.court, 
                    matchData.p1, 
                    matchData.p2, 
                    matchData.isCompleted || false
                );
            });
            return new Round(round.roundNumber, matches);
        });
        
        this.players = players;
    }

    startTournament() {
        this.isStarted = true;
        this.saveToLocalStorage();
        console.log('Tournament started:', this.name);
    }

    addRound(roundNumber, matches) {
        // Ensure all matches are Match instances
        const matchInstances = matches.map(match => {
            if (match instanceof Match) {
                return match;
            }
            return new Match(
                match.matchId,
                match.court,
                match.p1,
                match.p2,
                match.isCompleted || false
            );
        });
        
        this.matchSchedule.push(new Round(roundNumber, matchInstances));
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