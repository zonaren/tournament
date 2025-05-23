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

// Utility to get all recommended group sizes for a given totalPlayers


export async function getRecommendedFinalsGroupSizes(totalPlayers) {
    const response = await fetch('recommended_group_sizes.json');
    const data = await response.json();
    const entry = data.find(e => e.totalPlayers === totalPlayers);
    console.log("Recommended group sizes for " + totalPlayers + " players: ", entry);
    return entry ? entry.recommended : [];
}

export { generateUniqueId };