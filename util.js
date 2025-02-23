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

function repopulateRoundCountSelect(playerCountElement, roundCountElement) {
    const maxRounds = Math.floor(playerCountElement.value / 2);
    roundCountElement.innerHTML = '';
  
    for (let i = 2; i <= maxRounds; i++) {
      const option = document.createElement('option');
      option.value = i;
      option.textContent = `${i} runder`;
      roundCountElement.appendChild(option);
    }

    roundCountElement.value = maxRounds;
    roundCount = maxRounds;

  }

export { generateUniqueId, repopulateRoundCountSelect };