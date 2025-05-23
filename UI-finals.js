// This file handles the UI for the finals stage of the tournament
import Tournaments from './classes/Tournament.js';
// import { displayTournamentOverview } from './UI-tournament.js';

// When clicking on startFinals, it will start the finals stage of the tournament
// 1. The user selects group sizes for the finals (group A and group B)
export function startFinals() {
    const tournament = Tournaments.getCurrentTournament();
    if (!tournament) {
        console.error('Tournament not found');
        return;
    }

    // Get recommended group sizes and show selection popup
    displayFinalsGroupSizeSelectionPopup(tournament);
}


import { getRecommendedFinalsGroupSizes } from './utils.js';

// Display a popup to select recommended finals group sizes
export async function displayFinalsGroupSizeSelectionPopup(tournament) {
    const totalPlayers = tournament.getPlayers().length;
    const recommended = await getRecommendedFinalsGroupSizes(totalPlayers);
    console.log("Recommended group sizes: ", recommended.length);
    if (!recommended.length) {
        alert('Ingen anbefalte gruppestørrelser for dette antallet spillere.');
        return;
    }

    // Create overlay
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = 0;
    overlay.style.left = 0;
    overlay.style.width = '100vw';
    overlay.style.height = '100vh';
    overlay.style.background = 'rgba(0,0,0,0.3)';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.zIndex = 1000;

    // Create popup box
    const popup = document.createElement('div');
    popup.style.background = '#fff';
    popup.style.padding = '2em';
    popup.style.borderRadius = '10px';
    popup.style.boxShadow = '0 2px 12px rgba(0,0,0,0.2)';
    popup.style.minWidth = '320px';

    // Title
    const title = document.createElement('h2');
    title.textContent = 'Velg gruppestørrelser for sluttspill';
    popup.appendChild(title);

    // List recommended options as radio buttons
    recommended.forEach((option, idx) => {
        const label = document.createElement('label');
        label.style.display = 'block';
        label.style.margin = '0.5em 0';
        const radio = document.createElement('input');
        radio.type = 'radio';
        radio.name = 'finals-group-size';
        radio.value = idx;
        if (idx === 0) radio.checked = true;
        label.appendChild(radio);
        label.appendChild(document.createTextNode(`Gruppe A: ${option.A} - Gruppe B: ${option.B}`));
        popup.appendChild(label);
    });

    // Confirm button
    const confirmBtn = document.createElement('button');
    confirmBtn.textContent = 'Bekreft valg';
    confirmBtn.style.marginTop = '1em';
    confirmBtn.onclick = () => {
        const selectedIdx = Array.from(popup.querySelectorAll('input[name="finals-group-size"]')).findIndex(r => r.checked);
        if (selectedIdx === -1) {
            alert('Velg en gruppestørrelse.');
            return;
        }
        const selected = recommended[selectedIdx];
        // Tag players with A or B
        const players = tournament.getPlayers();
        players.forEach((p, i) => {
            if (i < selected.A) {
                p.finalsGroup = 'A';
            } else if (i < selected.A + selected.B) {
                p.finalsGroup = 'B';
            } else {
                p.finalsGroup = undefined;
            }
        });
        // Optionally, save or update tournament here
        //tournament.finalsFormat = `A:${selected.A},B:${selected.B}`;
        tournament.finalsMatchSchedule = null;
        tournament.saveToLocalStorage();
        document.body.removeChild(overlay);
        // Optionally, refresh UI
        // displayTournamentOverview(tournament);
        alert('Spillere er nå tagget med gruppe A/B.');
    };
    popup.appendChild(confirmBtn);

    // Cancel button
    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Avbryt';
    cancelBtn.style.marginLeft = '1em';
    cancelBtn.onclick = () => {
        document.body.removeChild(overlay);
    };
    popup.appendChild(cancelBtn);

    overlay.appendChild(popup);
    document.body.appendChild(overlay);
}