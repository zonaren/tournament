// Finals logic - Pure business logic functions for finals management
import { generateUniqueId, sortPlayers } from './utils.js';

/**
 * Load finals structure from JSON based on player count
 * @param {number} playerCount - Number of players
 * @returns {Object|null} - Finals structure or null if not found
 */
export async function loadFinalsStructure(playerCount) {
    try {
        const response = await fetch('./finals_structure_detailed.json');
        const structures = await response.json();
        return structures.find(s => s.totalPlayers === playerCount);
    } catch (error) {
        console.error('Error loading finals structure:', error);
        return null;
    }
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

/**
 * Create seeding pools based on structure and player rankings
 * @param {Array} players - Array of player objects
 * @param {Object} structure - Finals structure object
 * @returns {Array} - Array of player pools
 */
export function createSeedingPools(players, structure) {
    // Sort players
    const sortedPlayers = sortPlayers(players);

    const playerCount = sortedPlayers.length;
    let poolCount;
    
    // Determine number of pools based on structure (check if 3 players per court in first round)
    const firstRound = structure.rounds[0];
    const hasThreePlayerCourts = firstRound.courts && firstRound.courts.some(court => court.players === 3);
    
    if (hasThreePlayerCourts) {
        poolCount = 3; // Use 3 pools when there are 3-player courts
    } else {
        poolCount = 2; // Use 2 pools for standard 2-player courts
    }

    const pools = Array.from({ length: poolCount }, () => []);
    
    // For 2-player courts: put top half in pool 1, bottom half in pool 2
    // For 3-player courts: distribute evenly across 3 pools
    const playersPerPool = Math.ceil(playerCount / poolCount);
    
    sortedPlayers.forEach((player, index) => {
        const poolIndex = Math.floor(index / playersPerPool);
        pools[poolIndex].push(player);
    });

    return pools;
}

/**
 * Assign players with seeding to avoid same-pool matchups in first round
 * @param {Array} players - Array of player objects
 * @param {Object} structure - Finals structure object
 * @returns {Array} - Array of assigned players
 */
export function assignPlayersWithSeeding(players, structure) {
    const assigned = [];
    
    // Get first round courts
    const firstRound = structure.rounds[0];
    
    // Count how many walkover positions we have
    const walkoverCourts = firstRound.courts.filter(court => 
        court.court === 'WO1' || court.court.toString().startsWith('WO')
    );
    const totalWalkovers = walkoverCourts.length;
    
    // Get the sorted players (top-ranked first)
    const sortedPlayers = sortPlayers(players);
    
    // Assign top-ranked players to walkover positions first
    const walkoverPlayers = [];
    for (let i = 0; i < totalWalkovers && i < sortedPlayers.length; i++) {
        walkoverPlayers.push(sortedPlayers[i]);
    }
    
    // Remove walkover players from the remaining players for pool creation
    const remainingPlayers = sortedPlayers.slice(totalWalkovers);
    const pools = createSeedingPools(remainingPlayers, structure);

    // Shuffle each pool after pools are created, before assignment
    for (let i = 0; i < pools.length; i++) {
        shuffleArray(pools[i]);
    }
    
    // Now assign players to courts in the correct order
    let walkoverIndex = 0;
    let poolIndex = 0;
    
    for (const court of firstRound.courts) {
        if (court.court === 'WO1' || court.court.toString().startsWith('WO')) {
            // Assign top-ranked player to walkover position
            if (walkoverIndex < walkoverPlayers.length) {
                assigned.push(walkoverPlayers[walkoverIndex]);
                walkoverIndex++;
            }
        } else {            // Regular court - assign players from different pools if possible
            for (let i = 0; i < court.players; i++) {
                let assignedPlayer = null;
                
                // Try to assign from different pools in round-robin fashion
                for (let attempt = 0; attempt < pools.length; attempt++) {
                    const currentPoolIndex = (poolIndex + attempt) % pools.length;
                    const poolPlayerIndex = Math.floor(assigned.filter(p => !walkoverPlayers.includes(p)).length / pools.length);
                    
                    if (pools[currentPoolIndex].length > poolPlayerIndex) {
                        assignedPlayer = pools[currentPoolIndex][poolPlayerIndex];
                        break;
                    }
                }
                
                // If we couldn't find a player from different pools, assign sequentially
                if (!assignedPlayer) {
                    for (const pool of pools) {
                        for (const player of pool) {
                            if (!assigned.includes(player)) {
                                assignedPlayer = player;
                                break;
                            }
                        }
                        if (assignedPlayer) break;
                    }
                }
                
                if (assignedPlayer) {
                    assigned.push(assignedPlayer);
                }
                
                poolIndex = (poolIndex + 1) % pools.length;
            }
        }
    }
    
    return assigned;
}

/**
 * Assign players without seeding but with proper walkover handling
 * @param {Array} players - Array of player objects
 * @param {Object} structure - Finals structure object
 * @returns {Array} - Array of assigned players
 */
export function assignPlayersWithoutSeeding(players, structure) {
    // Get first round courts
    const firstRound = structure.rounds[0];
    
    // Count how many walkover positions we have
    const walkoverCourts = firstRound.courts.filter(court => 
        court.court === 'WO1' || court.court.toString().startsWith('WO')
    );
    const totalWalkovers = walkoverCourts.length;
    
    // Sort players (top-ranked first)
    const sortedPlayers = sortPlayers(players);
    const randomizedPlayers = sortedPlayers.slice().sort(() => Math.random() - 0.5); // Shuffle players
    
    // Assign top-ranked players to walkover positions first, then remaining players sequentially
    const assigned = [];
    let walkoverIndex = 0;
    let remainingPlayerIndex = totalWalkovers;
    
    for (const court of firstRound.courts) {
        if (court.court === 'WO1' || court.court.toString().startsWith('WO')) {
            // Assign top-ranked player to walkover position
            if (walkoverIndex < totalWalkovers && walkoverIndex < sortedPlayers.length) {
                assigned.push(sortedPlayers[walkoverIndex]);
                walkoverIndex++;
            }
        } else {
            // Regular court - assign remaining players randomly
            for (let i = 0; i < court.players; i++) {
                if (remainingPlayerIndex < sortedPlayers.length) {
                    assigned.push(randomizedPlayers[remainingPlayerIndex]);
                    remainingPlayerIndex++;
                }
            }
        }
    }
    
    return assigned;
}

/**
 * Get the next round number for finals in a specific group
 * @param {Object} tournament - Tournament object
 * @param {string} groupName - Group name (A, B, etc.)
 * @returns {number} - Next round number
 */
export function getNextFinalsRoundNumber(tournament, groupName) {
    let maxRound = 0;
    
    // Check regular finals matches
    if (tournament.finalsMatchSchedule) {
        tournament.finalsMatchSchedule.forEach(round => {
            if (round.groupName === groupName && round.roundNumber > maxRound) {
                maxRound = round.roundNumber;
            }
        });
    }
    
    // Check court assignments
    if (tournament.finalsCourtAssignments) {
        tournament.finalsCourtAssignments.forEach(round => {
            if (round.groupName === groupName && round.roundNumber > maxRound) {
                maxRound = round.roundNumber;
            }
        });
    }
    
    return maxRound + 1;
}

/**
 * Check if a structure uses 3-player courts
 * @param {Object} structure - Finals structure object
 * @returns {boolean} - True if structure has 3-player courts
 */
export function hasThreePlayerCourts(structure) {
    const firstRound = structure.rounds[0];
    return firstRound.courts && firstRound.courts.some(court => court.players === 3);
}

/**
 * Create 2-player finals matches
 * @param {Object} tournament - Tournament object
 * @param {string} groupName - Group name
 * @param {Array} players - Array of players
 * @param {Object} structure - Finals structure
 * @param {boolean} useSeeding - Whether to use seeding
 * @returns {Object} - Result object with success status and data
 */
export async function createTwoPlayerMatches(tournament, groupName, players, structure, useSeeding) {
    try {
        // Import needed classes
        const matchModule = await import('./classes/Match.js');
        const { Match } = matchModule;
        
        // Sort players for consistent ordering
        const sortedPlayers = sortPlayers(players);
        
        let assignedPlayers;
        
        if (useSeeding) {
            assignedPlayers = assignPlayersWithSeeding(sortedPlayers, structure);
        } else {
            assignedPlayers = assignPlayersWithoutSeeding(sortedPlayers, structure);
        }
        
        // Initialize finals match schedule if it doesn't exist
        if (!tournament.finalsMatchSchedule) {
            tournament.finalsMatchSchedule = [];
        }
        
        // Get the first round from structure
        const firstRound = structure.rounds[0];
        const matches = [];
        const usedIds = new Set();
        
        // Get existing match IDs to avoid duplicates
        if (tournament.matchSchedule) {
            tournament.matchSchedule.forEach(round => {
                round.matches.forEach(match => usedIds.add(match.matchId));
            });
        }
        if (tournament.finalsMatchSchedule) {
            tournament.finalsMatchSchedule.forEach(round => {
                round.matches.forEach(match => usedIds.add(match.matchId));
            });
        }
        
        // Create matches for first round
        let playerIndex = 0;
        let courtNumber = 1;
        
        for (const court of firstRound.courts) {
            if (court.court === 'WO1' || court.court.toString().startsWith('WO')) {
                // Handle walkover
                if (playerIndex < assignedPlayers.length) {
                    const walkoverPlayer = assignedPlayers[playerIndex];
                    const matchId = generateUniqueId(usedIds);
                    usedIds.add(matchId);
                    
                    // Create a walkover match (player vs bye)
                    const walkoverMatch = new Match(
                        matchId,
                        `WO-${groupName}`,
                        walkoverPlayer,
                        { id: 'BYE', name: 'Walkover', scorePoints: 0, matchPoints: 0 },
                        false
                    );
                    
                    // Set walkover scores
                    walkoverMatch.p1.scorePoints = 21;
                    walkoverMatch.p2.scorePoints = 0;
                    walkoverMatch.isCompleted = true;
                    
                    matches.push(walkoverMatch);
                    playerIndex++;
                }
            } else {
                // Regular match
                if (playerIndex + 1 < assignedPlayers.length) {
                    const p1 = assignedPlayers[playerIndex];
                    const p2 = assignedPlayers[playerIndex + 1];
                    const matchId = generateUniqueId(usedIds);
                    usedIds.add(matchId);
                    
                    const match = new Match(
                        matchId,
                        `${courtNumber}-${groupName}`,
                        p1,
                        p2,
                        false
                    );
                    
                    matches.push(match);
                    playerIndex += 2;
                    courtNumber++;
                }
            }
        }
        
        // Create Round object and add to tournament
        const roundNumber = getNextFinalsRoundNumber(tournament, groupName);
        const finalsRound = {
            roundNumber: roundNumber,
            matches: matches,
            groupName: groupName,
            roundName: firstRound.name || `Round 1 - Group ${groupName}`
        };
        
        tournament.finalsMatchSchedule.push(finalsRound);
        tournament.saveToLocalStorage();
        
        return {
            success: true,
            matches: matches.length,
            round: finalsRound
        };
        
    } catch (error) {
        console.error('Error creating 2-player matches:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Create 3-player court assignments
 * @param {Object} tournament - Tournament object
 * @param {string} groupName - Group name
 * @param {Array} players - Array of players
 * @param {Object} structure - Finals structure
 * @param {boolean} useSeeding - Whether to use seeding
 * @returns {Object} - Result object with success status and data
 */
export async function createThreePlayerCourtAssignments(tournament, groupName, players, structure, useSeeding) {
    try {
        // Sort players for consistent ordering
        const sortedPlayers = sortPlayers(players);
        
        let assignedPlayers;
        
        if (useSeeding) {
            assignedPlayers = assignPlayersWithSeeding(sortedPlayers, structure);
        } else {
            assignedPlayers = assignPlayersWithoutSeeding(sortedPlayers, structure);
        }
        
        // Initialize finals court assignments if it doesn't exist
        if (!tournament.finalsCourtAssignments) {
            tournament.finalsCourtAssignments = [];
        }
        
        // Get the first round from structure
        const firstRound = structure.rounds[0];
        const courtAssignments = [];
        
        // Create court assignments for first round
        let playerIndex = 0;
        let courtNumber = 1;
        
        for (const court of firstRound.courts) {
            if (court.court === 'WO1' || court.court.toString().startsWith('WO')) {
                // Handle walkover
                if (playerIndex < assignedPlayers.length) {
                    const walkoverPlayer = assignedPlayers[playerIndex];
                    
                    courtAssignments.push({
                        courtNumber: `WO-${courtNumber}`,
                        players: [walkoverPlayer],
                        playersToAdvance: court.advance,
                        isWalkover: true,
                        isCompleted: false,
                        advancedPlayers: []
                    });
                    
                    playerIndex++;
                }
            } else {
                // Regular 3-player court
                const courtPlayers = [];
                for (let i = 0; i < court.players && playerIndex < assignedPlayers.length; i++) {
                    courtPlayers.push(assignedPlayers[playerIndex]);
                    playerIndex++;
                }
                
                if (courtPlayers.length > 0) {
                    courtAssignments.push({
                        courtNumber: courtNumber,
                        players: courtPlayers,
                        playersToAdvance: court.advance,
                        isWalkover: false,
                        isCompleted: false,
                        advancedPlayers: []
                    });
                    courtNumber++;
                }
            }
        }
        
        // Create Round object and add to tournament
        const roundNumber = getNextFinalsRoundNumber(tournament, groupName);
        const finalsRound = {
            roundNumber: roundNumber,
            courtAssignments: courtAssignments,
            groupName: groupName,
            roundName: firstRound.name || `Round 1 - Group ${groupName}`,
            isThreePlayerRound: true
        };
        
        tournament.finalsCourtAssignments.push(finalsRound);
        tournament.saveToLocalStorage();
        
        return {
            success: true,
            assignments: courtAssignments.length,
            round: finalsRound
        };
        
    } catch (error) {
        console.error('Error creating 3-player court assignments:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Main function to create finals matches/assignments
 * @param {Object} tournament - Tournament object
 * @param {string} groupName - Group name
 * @param {Array} players - Array of players
 * @param {Object} structure - Finals structure
 * @param {boolean} useSeeding - Whether to use seeding
 * @returns {Object} - Result object
 */
export async function createFinalsMatchesOrAssignments(tournament, groupName, players, structure, useSeeding) {
    console.log(`Creating finals for group ${groupName}`, { players: players.length, structure, useSeeding });
    
    if (hasThreePlayerCourts(structure)) {
        return await createThreePlayerCourtAssignments(tournament, groupName, players, structure, useSeeding);
    } else {
        return await createTwoPlayerMatches(tournament, groupName, players, structure, useSeeding);
    }
}

/**
 * Update player advancement for 3-player court
 * @param {Object} tournament - Tournament object
 * @param {Object} assignment - Court assignment object
 * @param {Array} selectedPlayers - Array of selected players
 * @returns {boolean} - Success status
 */
export function updatePlayerAdvancement(tournament, assignment, selectedPlayers) {
    try {
        if (selectedPlayers.length !== assignment.playersToAdvance) {
            throw new Error(`Expected ${assignment.playersToAdvance} players, got ${selectedPlayers.length}`);
        }
        
        assignment.advancedPlayers = [...selectedPlayers];
        assignment.isCompleted = true;
        tournament.saveToLocalStorage();
        
        return true;
    } catch (error) {
        console.error('Error updating player advancement:', error);
        return false;
    }
}
