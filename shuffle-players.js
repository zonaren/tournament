import Players from './classes/Player.js';
import { updatePlayerTable } from '../UI/UI-players.js';

export function shuffleStartNumbers() {
    const players = Players.getAll();
    const shuffled = shuffle(players);
    shuffled.forEach((player, index) => {
        player.id = index + 1;
    });
    Players.saveToLocalStorage();
    updatePlayerTable();
}

function shuffle(array) {

    const shuffled = [...array]
        .map(a => ({sort: Math.random(), value: a}))
        .sort((a, b) => a.sort - b.sort)
        .map(a => a.value);

    return shuffled;
}