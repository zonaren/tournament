// startCards.js

import { startcardTemplate } from './startcard-template.js';
import Tournaments from '../classes/Tournament.js';

export function createStartCard(playerId, playerName, clubName, tournamentName) {
    return startcardTemplate(playerId, playerName, clubName, tournamentName);
}

export function createPrintStartCardsButton() {
    const button = document.createElement('button');
    button.textContent = 'Skriv ut startkort';
    button.id = 'printStartCardsButton';
    button.addEventListener('click', () => {
        const currentTournament = Tournaments.getCurrentTournament();
        if (!currentTournament) {
            console.error('No current tournament found.');
            alert('Ingen aktiv turnering funnet.');
            return;
        }
        const players = currentTournament.getPlayers();
        const tournamentName = currentTournament.name;
        if (players && players.length > 0) {
            const printWindow = window.open('', '_blank');
            // Add the CSS to the print window
            const styleLink = printWindow.document.createElement('link');
            styleLink.rel = 'stylesheet';
            styleLink.href = 'startkort/startcard.css';
            printWindow.document.head.appendChild(styleLink);

            // Add the start cards
            players.forEach(player => {
                // Gather round info for this player
                const roundInfos = [];
                if (currentTournament.matchSchedule) {
                    for (let round of currentTournament.matchSchedule) {
                        // Find the match for this player in this round
                        const match = round.matches.find(m => m.p1.id === player.id || m.p2.id === player.id);
                        if (match) {
                            const isP1 = match.p1.id === player.id;
                            const opponent = isP1 ? match.p2 : match.p1;
                            roundInfos.push({
                                court: match.court,
                                opponentId: opponent.id,
                                opponentName: opponent.name
                            });
                        } else {
                            // No match for this player in this round (e.g. bye)
                            roundInfos.push({
                                court: '',
                                opponentId: '',
                                opponentName: ''
                            });
                        }
                    }
                }
                const startCardTemplate = startcardTemplate(player.id, player.name, player.clubName, tournamentName, roundInfos);
                printWindow.document.body.appendChild(startCardTemplate);
            });
            printWindow.document.close();
            // Wait for CSS to load before printing
            styleLink.onload = () => {
                setTimeout(() => {
                    printWindow.focus();
                    printWindow.print();
                }, 50);
            };
        } else {
            console.error('No players found in the current tournament.');
            alert('Ingen spillere funnet i turneringen.');
        }
    });
    return button;
}
