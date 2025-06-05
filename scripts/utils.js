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

    return players.slice().sort((a, b) => {
        // 1. Group by finalsGroup alphabetically (players without finalsGroup go last)
        const aGroup = a.finalsGroup || 'ZZZ'; // Players without group go to end
        const bGroup = b.finalsGroup || 'ZZZ';
        if (aGroup !== bGroup) {
            return aGroup.localeCompare(bGroup);
        }

        // 2. Within same group, sort by eliminated status (non-eliminated first, then by elimination round descending)
        if (a.eliminated !== b.eliminated) {
            // Non-eliminated (null) should come first
            if (a.eliminated === null || a.eliminated === undefined) return -1;
            if (b.eliminated === null || b.eliminated === undefined) return 1;
            
            // Both are eliminated, sort by elimination round descending (higher rounds first)
            return b.eliminated - a.eliminated;
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
        return getHighestSingleScore(b) - getHighestSingleScore(a);
    });
}

// Function to set player ranks based on their scores
function setPlayerRanks(tournament) {
    // Sort players using the sortPlayers function
    const sortedPlayers = sortPlayers(tournament.getPlayers());

    // Assign ranks based on sorted order
    sortedPlayers.forEach((player, index) => {
        player.rank = index + 1; // Ranks start from 1
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

export { generateUniqueId, checkForIncompleteMatches, checkForWalkoverPlayers, deleteWalkoverPlayers, shuffleArray, sortPlayers, generateRandomString, setPlayerRanks };