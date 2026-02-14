// Script to generate recommended_group_sizes.json
const fs = require('fs');

// Valid sizes for single-group tournaments (can use walkovers)
const validSizes = [4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,22,23,24,26,27,30,31,32,34,35,36,40,46,47,48,52,53,54,62,63,64,70,71,72,80,81,94,95,96];

// Check if a group size is valid (must eventually reach 2 or 4 players)
function isValidGroupSize(size) {
    if (size < 2) return false;
    if (size === 2 || size === 4) return true;
    
    let current = size;
    const visited = new Set();
    
    while (current > 4 && !visited.has(current)) {
        visited.add(current);
        
        // Try dividing by 3 first (prefer 3-player courts)
        if (current % 3 === 0) {
            current = (current / 3) * 2; // Each 3-player court advances 2
        } else if (current % 2 === 0) {
            current = (current / 2) * 1; // Each 2-player court advances 1
        } else {
            return false; // Can't divide evenly
        }
    }
    
    return current === 2 || current === 4;
}

// Calculate how many players advance from a group size
function getAdvancingPlayers(groupSize) {
    if (groupSize === 0) return 0;
    
    // Prefer 3-player courts, fall back to 2-player courts
    if (groupSize % 3 === 0) {
        // 3-player courts: 2 advance from each court
        return (groupSize / 3) * 2;
    } else if (groupSize % 2 === 0) {
        // 2-player courts: 1 advances from each court
        return (groupSize / 2) * 1;
    }
    return 0;
}

// Generate recommendations for each total player count
function generateRecommendations() {
    const results = [];
    
    for (let totalPlayers = 8; totalPlayers <= 100; totalPlayers++) {
        const maxA = Math.floor(totalPlayers * 0.8); // A cannot be more than 80% of total
        const recommendations = [];
        
        // Find all valid combinations
        for (const sizeA of validSizes) {
            const remainingPlayers = totalPlayers - sizeA;
            
            // Check if remaining players form a valid group B
            if (remainingPlayers === 0) {
                // Single group scenario - all players advance to finals
                recommendations.push({
                    A: sizeA,
                    B: 0
                });
            } else if (remainingPlayers > 0 && isValidGroupSize(remainingPlayers) && isValidGroupSize(sizeA)) {
                // Two group scenario - both groups must be divisible by 2 or 3
                // Apply 80% rule (but override if totalPlayers <= 14)
                const allow80Rule = totalPlayers > 14 ? sizeA <= maxA : true;
                if (allow80Rule && sizeA >= remainingPlayers) { // A cannot be less than B
                    // Check if combined advancing players form a valid finals bracket
                    const advanceA = getAdvancingPlayers(sizeA);
                    const advanceB = getAdvancingPlayers(remainingPlayers);
                    const totalAdvancing = advanceA + advanceB;
                    
                    if (validSizes.includes(totalAdvancing)) {
                        recommendations.push({
                            A: sizeA,
                            B: remainingPlayers
                        });
                    }
                }
            }
        }
        
        // Sort recommendations by A size (descending), then by B size (ascending)
        recommendations.sort((a, b) => {
            if (b.A !== a.A) return b.A - a.A;
            return a.B - b.B;
        });
        
        if (recommendations.length > 0) {
            results.push({
                totalPlayers: totalPlayers,
                recommended: recommendations
            });
        }
    }
    
    return results;
}

// Generate the data
const data = generateRecommendations();

// Write to file
fs.writeFileSync('recommended_group_sizes.json', JSON.stringify(data, null, 4));

console.log(`Generated recommendations for ${data.length} different player counts`);
console.log('File saved as recommended_group_sizes.json');

// Show some examples
console.log('\nExample entries:');
data.slice(0, 3).forEach(entry => {
    console.log(`${entry.totalPlayers} players: ${entry.recommended.length} options`);
    entry.recommended.forEach(rec => {
        console.log(`  A:${rec.A}, B:${rec.B}`);
    });
});
