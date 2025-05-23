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


import { getRecommendedFinalsGroupSizes, sortPlayersForFinals } from './utils.js';

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
    title.style.color = '#333';
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
        // Improved label formatting for readability
        label.style.fontSize = '1.1em';
        label.style.fontWeight = 'bold';
        label.style.padding = '0.4em 0.6em';
        label.style.background = '#f3f6fa';
        label.style.borderRadius = '6px';
        label.style.marginBottom = '0.7em';
        label.appendChild(document.createTextNode(`Gruppe A: ${option.A} spillere  |  Gruppe B: ${option.B} spillere`));
        popup.appendChild(label);
    });

    // Player preview area
    const previewDiv = document.createElement('div');
    previewDiv.style.margin = '1em 0';
    popup.appendChild(previewDiv);

    function updatePreview() {
        const selectedIdx = Array.from(popup.querySelectorAll('input[name="finals-group-size"]')).findIndex(r => r.checked);
        if (selectedIdx === -1) return;
        const selected = recommended[selectedIdx];
        const players = sortPlayersForFinals(tournament.getPlayers());
        let html = '';
        html += '<table style="width:100%;margin-bottom:1em;text-align:left">';
        html += `<tr><th>Gruppe A (${selected.A})</th><th>Gruppe B (${selected.B})</th></tr>`;
        const groupA = players.slice(0, selected.A);
        const groupB = players.slice(selected.A, selected.A + selected.B);
        const maxRows = Math.max(groupA.length, groupB.length);
        for (let i = 0; i < maxRows; i++) {
            html += '<tr>';
            html += `<td>${groupA[i] ? groupA[i].name : ''}</td>`;
            html += `<td>${groupB[i] ? groupB[i].name : ''}</td>`;
            html += '</tr>';
        }
        html += '</table>';
        previewDiv.innerHTML = html;
    }

    // Update preview on radio change
    popup.querySelectorAll('input[name="finals-group-size"]').forEach(radio => {
        radio.addEventListener('change', updatePreview);
    });
    // Initial preview
    updatePreview();

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
        // Tag players with A or B using correct sorting
        const players = sortPlayersForFinals(tournament.getPlayers());
        players.forEach((p, i) => {
            if (i < selected.A) {
                p.finalsGroup = 'A';
            } else if (i < selected.A + selected.B) {
                p.finalsGroup = 'B';
            } else {
                p.finalsGroup = undefined;
            }
        });
        tournament.finalsMatchSchedule = null;
        tournament.saveToLocalStorage();
        document.body.removeChild(overlay);
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