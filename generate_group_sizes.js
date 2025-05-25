// Script to generate recommended_group_sizes.json
const fs = require('fs');

// Valid group sizes
const validSizes = [3,4,5,6,8,9,11,12,13,15,16,17,18,23,24,26,27,32,35,36,39,40,47,48,53,54,64,71,72,80];

// Generate recommendations for each total player count
function generateRecommendations() {
    const results = [];
    
    for (let totalPlayers = 8; totalPlayers <= 100; totalPlayers++) {
        const maxA = Math.floor(totalPlayers * 0.8); // A cannot be more than 80% of total
        const recommendations = [];
        
        // Find all valid combinations
        for (const sizeA of validSizes) {
            if (sizeA > maxA) continue; // A cannot be more than 80% of total
            
            const remainingPlayers = totalPlayers - sizeA;
            
            // Check if remaining players form a valid group B
            if (remainingPlayers === 0) {
                // Single group scenario
                recommendations.push({
                    A: sizeA,
                    B: 0
                });
            } else if (validSizes.includes(remainingPlayers)) {
                // Two group scenario
                if (sizeA >= remainingPlayers) { // A cannot be less than B
                    recommendations.push({
                        A: sizeA,
                        B: remainingPlayers
                    });
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
