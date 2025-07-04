import Tournaments from "../classes/Tournament.js";

// General player sorting function for ranking, finals, tables, etc.
function sortPlayers(players) {
    // Helper: get mutual result between two players (returns 1 if a beat b, -1 if b beat a, 0 if draw or not found)
    function getMutualResult(a, b) {
        const aMatch = a.matches && a.matches.find(m => m.opponentId === b.id);
        const bMatch = b.matches && b.matches.find(m => m.opponentId === a.id);
        if (aMatch && bMatch) {
            if (aMatch.scorePoints > bMatch.scorePoints) return 1;
            if (aMatch.scorePoints < bMatch.scorePoints) return -1;
            return 0;
        }
        return 0;
    }
    
    // Helper: get highest single match scorePoints for a player
    function getHighestSingleScore(player) {
        if (!player.matches || !player.matches.length) return 0;
        return Math.max(...player.matches.map(m => m.scorePoints || 0));
    }

    // If no matches are completed, sort by id
    const tournament = Tournaments.getCurrentTournament();
    if (tournament && !anyMatchesCompleted(tournament)) {
        return players.slice().sort((a, b) => a.id - b.id);
    }

    return players.slice().sort((a, b) => {


        // 0. Prioritize finalRank if available
        if (a.finalRank != null && b.finalRank != null) {
            return a.finalRank - b.finalRank;
        }

        // 1. Group by finalsGroup alphabetically (players without finalsGroup go last)
        const aGroup = a.finalsGroup || 'ZZZ'; // Players without group go to end
        const bGroup = b.finalsGroup || 'ZZZ';
        if (aGroup !== bGroup) {
            return aGroup.localeCompare(bGroup);
        }

        // 2. Within same group, sort by eliminated status (non-eliminated first, then by elimination round ascending)
        const aElim = (a.eliminated === null || a.eliminated === undefined) ? -1 : a.eliminated;
        const bElim = (b.eliminated === null || b.eliminated === undefined) ? -1 : b.eliminated;
        if (aElim !== bElim) {
            return aElim - bElim;
        }

        // 3. Match points (descending)
        if (b.matchPoints !== a.matchPoints) return b.matchPoints - a.matchPoints;

        // 4. Score points (descending)
        if (b.scorePoints !== a.scorePoints) return b.scorePoints - a.scorePoints;

        // 5. Mutual result (if only two players have same points)
        if (a.matches && b.matches && players.filter(p => p.matchPoints === a.matchPoints && p.scorePoints === a.scorePoints).length === 2) {
            const mutual = getMutualResult(a, b);
            if (mutual !== 0) return -mutual;
        }

        // 6. Highest single match scorePoints
        const scoreDiff = getHighestSingleScore(b) - getHighestSingleScore(a);
        if (scoreDiff !== 0) return scoreDiff;

        // 7. Finally, sort by id (start number) if all else is equal
        // This ensures that players with same points are sorted by their start number
        return a.id - b.id;
    });
}

function completeAllMatches(tournament) {
    // Iterate through all rounds and matches, marking them as completed
    tournament.matchSchedule.forEach(round => {
        round.matches.forEach(match => {
            match.isCompleted = true; // Mark match as completed
        });
    });
}

function anyMatchesCompleted(tournament) {
    // Returns true if at least one match in the tournament is completed
    return tournament.matchSchedule.some(round =>
        round.matches.some(match => match.isCompleted)
    );
}

// Function to set player ranks based on their scores
function setPlayerRanks(tournament) {
    // Sort players using the sortPlayers function
    const sortedPlayers = sortPlayers(tournament.getPlayers());

    // Assign ranks based on sorted order
    sortedPlayers.forEach((player, index) => {
        player.finalRank = index + 1; // Ranks start from 1
    });

    // Save the updated tournament to local storage
    tournament.saveToLocalStorage();
}

function generateRandomString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

function generateUniqueId(existingIds, length = 10) {
    let id;
    do {
        id = generateRandomString(length);
    } while (existingIds.has(id));
    existingIds.add(id);
    return id;
}

function checkForIncompleteMatches(tournament) {
    const incompleteMatches = tournament.matchSchedule.flatMap(round => 
        round.matches.filter(match => !match.isCompleted)
    );
    return incompleteMatches.length > 0;
}

function checkForWalkoverPlayers(tournament) {
    const walkoverPlayers = tournament.getPlayers().filter(player => player.name === "Walkover");
    return walkoverPlayers.length > 0;
}

function deleteWalkoverPlayers(tournament) {
    const players = tournament.getPlayers();
    const walkoverPlayers = players.filter(player => player.name === "Walkover");
    walkoverPlayers.forEach(walkoverPlayer => {
        const index = players.indexOf(walkoverPlayer);
        if (index > -1) {
            players.splice(index, 1);
        }
    });
}

/**
 * Shuffle array in place using Fisher-Yates algorithm
 * @param {Array} array
 * @returns {Array}
 */
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// import playerlist from external url in json format
async function importPlayerListFromDb(url) {
    fetch(url)
      .then(response => response.json())
      .then(data => {
        console.log('Success:', data);
        saveDatabasePlayersToLocalStorage(data);
        displayImportSuccessMessage();
        
      })
      .catch(error => console.error('Error:', error));

      function displayImportSuccessMessage() {
        const message = document.createElement('h3');
        message.className = 'import-success';
        message.textContent = 'Spillerlisten ble importert fra databasen!';
        message.style.color = 'green';
        message.style.textAlign = 'center';
        document.body.appendChild(message);
        setTimeout(() => {
            message.remove();
        }, 3000);
    
    }
}

async function importTournamentListFromDb(url) {
    fetch(url)
      .then(response => response.json())
      .then(data => {
        console.log('Success:', data);
        saveDatabaseTournamentsToLocalStorage(data);
        displayImportSuccessMessage();
        
      })
      .catch(error => console.error('Error:', error));

      function displayImportSuccessMessage() {
        const message = document.createElement('h3');
        message.className = 'import-success';
        message.textContent = 'Turneringene ble importert fra databasen!';
        message.style.color = 'green';
        message.style.textAlign = 'center';
        document.body.appendChild(message);
        setTimeout(() => {
            message.remove();
        }, 3000);
    
    }
}

function saveDatabasePlayersToLocalStorage(databasePlayers) {
    // Save players to local storage
    localStorage.setItem('databasePlayers', JSON.stringify(databasePlayers));
}

function saveDatabaseTournamentsToLocalStorage(databaseTournaments) {
    // Save tournaments to local storage
    localStorage.setItem('databaseTournaments', JSON.stringify(databaseTournaments));
}

function exportTournamentResults(tournamentId) {
    const tournament = Tournaments.get(tournamentId);
    if (!tournament) return;

    const safeName = tournament.name.replace(/[^a-z0-9]/gi, '_'); // Replace non-alphanumeric with _

    //if(tournament.dbId !== null && tournament.dbId !== undefined) {
    exportCsvForDatabase();
    //}

    exportCsvForExcel();

    function exportCsvForExcel() {
        const headerExcel = ["Pl.nr", "St.nr", "Navn", "Klubb", "Poeng", "Skår"];

        // Prepare the second csv row - used in excel
        const excelRows = tournament.players
            .slice()
            .sort((a, b) => a.finalRank - b.finalRank)
            .map(player => [
                player.finalRank, //plassering
                player.id, //startnummer
                player.name, //navn
                player.clubName, //klubb
                player.matchPoints, //poeng
                player.scorePoints //skår
            ]);

        // Build CSV content
        const excelContent = "data:text/csv;charset=utf-8," +
            [headerExcel, ...excelRows].map(e => e.join(",")).join("\n");

        const encodedUri2 = encodeURI(excelContent);
        const link2 = document.createElement("a");
        link2.setAttribute("href", encodedUri2);
        link2.setAttribute("download", `EXCEL_${tournamentId}_${safeName}.csv`);
        document.body.appendChild(link2);
        link2.click();
        document.body.removeChild(link2);
    }

    function exportCsvForDatabase() {
        const header = ["StevneId", "Plassering", "KasterId", "KlubbId", "KlasseId", "GruppeId"];
        const classId = 1; // Default class ID

        const rows = tournament.players.map(player => [
            tournament.dbId,
            player.finalRank,
            player.dbId,
            player.clubId,
            classId,
            player.finalsGroup === "A" ? 1 : player.finalsGroup === "B" ? 2 : 1
        ]);

        // Build CSV content
        const csvContent = "data:text/csv;charset=utf-8," +
            [header, ...rows].map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `DATABASE_${tournamentId}_${safeName}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

export { generateUniqueId, checkForIncompleteMatches, checkForWalkoverPlayers, deleteWalkoverPlayers, shuffleArray, sortPlayers, generateRandomString, setPlayerRanks, importPlayerListFromDb, saveDatabasePlayersToLocalStorage, importTournamentListFromDb, saveDatabaseTournamentsToLocalStorage, exportTournamentResults, completeAllMatches };