import Tournaments from '../classes/Tournament.js';

export function deleteTournamentAndRow(id, row) {
        Tournaments.delete(id);
        row.remove();
}

export function loadTournament(id) {
    const tournament = Tournaments.get(id);
    if (tournament) {
        Tournaments.setCurrentTournament(tournament.id);
        console.log('Load tournament:', tournament, 'id: ', tournament.id);
        Players.loadPlayersFromTournament(tournament.getPlayers());
        const tournamentsList = document.getElementById('tournamentsList');
        tournamentsList.remove();
        displayTournamentOverview(tournament);
        const header = document.getElementById('header');
        header.remove();
        
    }
}