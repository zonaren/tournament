import Round from "./Match.js";
import { Match } from "./Match.js";
import { generateUniqueId } from "../scripts/utils.js";

// Tournament Stage Constants
export const TOURNAMENT_STAGES = {
    NOT_STARTED: 'not_started',
    PRELIMINARY: 'preliminary', 
    FINALS: 'finals',
    COMPLETED: 'completed'
};

// Human-readable stage names for display
export const STAGE_DISPLAY_NAMES = {
    [TOURNAMENT_STAGES.NOT_STARTED]: 'Ikke startet',
    [TOURNAMENT_STAGES.PRELIMINARY]: 'Innledende runder',
    [TOURNAMENT_STAGES.FINALS]: 'Sluttspill',
    [TOURNAMENT_STAGES.COMPLETED]: 'Fullført'
};

class Tournaments {
    constructor() {
        this.tournaments = [];
        this.currentTournament = null;
        this.loadFromLocalStorage();
    }    
    
    create(totalRounds, totalCourts, matchSchedule, tournamentName, prelimsFormat, players, isStarted = false, finalsFormat = null, finalsCourtAssignments = null, stage = null, dbId = null) {
        const tournament = new Tournament(totalRounds, totalCourts, matchSchedule, tournamentName, prelimsFormat, finalsFormat, finalsCourtAssignments, players, isStarted, stage, dbId);
        this.tournaments.push(tournament);
        this.saveToLocalStorage();
        console.log("Tournament created: ", tournament);
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
    }    loadFromLocalStorage() {
        const savedTournaments = localStorage.getItem('tournaments');
        if (savedTournaments) {
            const parsedTournaments = JSON.parse(savedTournaments);
            this.tournaments = parsedTournaments.map(tournamentData => {
                // Determine stage for backward compatibility
                let stage = tournamentData.stage;
                if (!stage) {
                    // For old tournaments without stage property
                    stage = tournamentData.isStarted ? TOURNAMENT_STAGES.PRELIMINARY : TOURNAMENT_STAGES.NOT_STARTED;
                }
                
                const tournament = new Tournament(
                    tournamentData.totalRounds,
                    tournamentData.totalCourts,
                    tournamentData.matchSchedule,
                    tournamentData.name,
                    tournamentData.prelimsFormat || null,
                    tournamentData.finalsFormat || null,
                    tournamentData.finalsCourtAssignments || [],
                    tournamentData.players,
                    tournamentData.isStarted || false,
                    stage,
                    tournamentData.dbId || null
                );
                tournament.id = tournamentData.id;
                tournament.dateCreated = tournamentData.dateCreated;
                return tournament;
            });
        }
    }
}

class Tournament {    constructor(totalRounds, totalCourts, matchSchedule, tournamentName, prelimsFormat, finalsFormat = null, finalsCourtAssignments = [], players, isStarted = false, stage = null, dbId = null) {
        // Set stage - prioritize explicit stage parameter, otherwise use isStarted for backward compatibility
        if (stage !== null) {
            this.stage = stage;
        } else {
            this.stage = isStarted ? TOURNAMENT_STAGES.PRELIMINARY : TOURNAMENT_STAGES.NOT_STARTED;
        }
        
        // Update isStarted for backward compatibility
        this.isStarted = this.stage !== TOURNAMENT_STAGES.NOT_STARTED;
        this.id = generateUniqueId(new Set());
        this.dbId = dbId; // Optional database ID for persistence
        this.name = tournamentName;
        this.dateCreated = new Date().toLocaleString();
        this.prelimsFormat = prelimsFormat;
        this.finalsFormat = finalsFormat;
        this.finalsCourtAssignments = finalsCourtAssignments || [];
        this.totalRounds = totalRounds;
        this.totalCourts = totalCourts;
        // Convert plain match objects to Match instances in each round
        this.matchSchedule = matchSchedule.map(round => {
            const matches = round.matches.map(matchData => {
                if (matchData instanceof Match) {
                    return matchData;
                }
                return new Match(
                    matchData.matchId, 
                    matchData.court, 
                    matchData.p1, 
                    matchData.p2, 
                    matchData.isCompleted || false
                );
            });
            return new Round(round.roundNumber, matches);        });
        this.players = players;
    }

    startTournament() {
        this.isStarted = true;
        this.stage = TOURNAMENT_STAGES.PRELIMINARY;
        this.saveToLocalStorage();
        console.log('Tournament started:', this.name);
    }

    // Stage management methods
    getCurrentStage() {
        return this.stage;
    }

    getCurrentStageDisplayName() {
        return STAGE_DISPLAY_NAMES[this.stage] || 'Ukjent stadium';
    }

    setStage(stage) {
        if (!Object.values(TOURNAMENT_STAGES).includes(stage)) {
            throw new Error(`Invalid tournament stage: ${stage}`);
        }
        
        const oldStage = this.stage;
        this.stage = stage;
        
        // Update isStarted for backward compatibility
        this.isStarted = stage !== TOURNAMENT_STAGES.NOT_STARTED;
        
        console.log(`Tournament stage changed from ${oldStage} to ${stage}`);
        this.saveToLocalStorage();
    }

    canAdvanceToStage(targetStage) {
        const stageOrder = [
            TOURNAMENT_STAGES.NOT_STARTED,
            TOURNAMENT_STAGES.PRELIMINARY, 
            TOURNAMENT_STAGES.FINALS,
            TOURNAMENT_STAGES.COMPLETED
        ];
        
        const currentIndex = stageOrder.indexOf(this.stage);
        const targetIndex = stageOrder.indexOf(targetStage);
        
        // Can only advance to the next stage or stay in current stage
        return targetIndex >= currentIndex && targetIndex <= currentIndex + 1;
    }

    advanceToNextStage() {
        const stageProgression = {
            [TOURNAMENT_STAGES.NOT_STARTED]: TOURNAMENT_STAGES.PRELIMINARY,
            [TOURNAMENT_STAGES.PRELIMINARY]: TOURNAMENT_STAGES.FINALS,
            [TOURNAMENT_STAGES.FINALS]: TOURNAMENT_STAGES.COMPLETED,
            [TOURNAMENT_STAGES.COMPLETED]: TOURNAMENT_STAGES.COMPLETED // Stay completed
        };
        
        const nextStage = stageProgression[this.stage];
        if (nextStage && this.canAdvanceToStage(nextStage)) {
            this.setStage(nextStage);
            return true;
        }
        return false;
    }

    isStageCompleted(stage = this.stage) {
        switch (stage) {
            case TOURNAMENT_STAGES.NOT_STARTED:
                return this.stage !== TOURNAMENT_STAGES.NOT_STARTED;
            case TOURNAMENT_STAGES.PRELIMINARY:
                if (!this.matchSchedule || this.matchSchedule.length === 0) return false;
                return this.matchSchedule.every(round => 
                    round.matches.every(match => match.isCompleted)
                );
            case TOURNAMENT_STAGES.FINALS:
                // Check if finals are completed (all court assignments completed)
                if (!this.finalsCourtAssignments || this.finalsCourtAssignments.length === 0) return true;
                return this.finalsCourtAssignments.every(round => 
                    round.courtAssignments.every(assignment => assignment.isCompleted || assignment.isWalkover)
                );
            case TOURNAMENT_STAGES.COMPLETED:
                return true;
            default:
                return false;
        }
    }

    startFinalsStage() {
        if (this.stage === TOURNAMENT_STAGES.PRELIMINARY && this.isStageCompleted(TOURNAMENT_STAGES.PRELIMINARY)) {
            this.setStage(TOURNAMENT_STAGES.FINALS);
            return true;
        }
        return false;
    }    completeTournament() {
        if (this.isStageCompleted(this.stage)) {
            this.setStage(TOURNAMENT_STAGES.COMPLETED);
            return true;
        }
        return false;
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
        // Ensure finalsCourtAssignments is saved
        tournaments[index] = {
            ...this,
            finalsCourtAssignments: this.finalsCourtAssignments
        };
        localStorage.setItem('tournaments', JSON.stringify(tournaments));
    }
}

export { Tournament };
export default new Tournaments();