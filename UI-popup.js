function openScorePopup(match, player1, player2) {
    let player1Score = 0;
    let player2Score = 0;

    // Create popup container
    const popup = document.createElement('div');
    popup.classList.add('popup');

    // Create match id header
    const matchIdHeader = document.createElement('h2');
    matchIdHeader.textContent = `Kamp ${match.matchId}`;
    console.log("Adding score for match ", match.matchId, " between ", player1.name, " and ", player2.name, " on court ", match.court);
    popup.appendChild(matchIdHeader);
    // create number pad container
    const numberPadContainer = document.createElement('div');
    numberPadContainer.classList.add('number-pads-container');
    popup.appendChild(numberPadContainer);

    // Create number pad for player 1
    const numberPadContainer1 = document.createElement('div');
    numberPadContainer1.classList.add('number-pad-container');

    const player1Info = document.createElement('div');
    player1Info.classList.add('player-info');

    const player1Label = document.createElement('h2');
    player1Label.textContent = player1.name;
    numberPadContainer1.appendChild(player1Info);
    player1Info.appendChild(player1Label);

    const player1ScoreLabel = document.createElement('h1');
    player1ScoreLabel.textContent = player1Score;
    player1Info.appendChild(player1ScoreLabel);

    const numberPad1 = document.createElement('div');
    numberPad1.classList.add('number-pad');
    numberPadContainer1.appendChild(numberPad1);


        for (let i = 0; i <= 9; i++) {
            const button = document.createElement('button');
            button.textContent = i;
            button.addEventListener('click', function() {
                const newScore = parseInt(player1Score.toString() + i.toString());
                if (newScore <= 30) {
                    player1Score = newScore;
                    player1ScoreLabel.textContent = player1Score;
                } else {
                    alert('Score cannot exceed 30');
                    player1Score = 0;
                    player1ScoreLabel.textContent = player1Score;
                }
            });
            numberPad1.appendChild(button);
        }

    // Create number pad for player 1
    const numberPadContainer2 = document.createElement('div');
    numberPadContainer2.classList.add('number-pad-container');

    const player2Info = document.createElement('div');
    player2Info.classList.add('player-info');

    const player2Label = document.createElement('h2');
    player2Label.textContent = player2.name;
    numberPadContainer2.appendChild(player2Info);
    player2Info.appendChild(player2Label);

    const player2ScoreLabel = document.createElement('h1');
    player2ScoreLabel.textContent = player2Score;
    player2Info.appendChild(player2ScoreLabel);

    const numberPad2 = document.createElement('div');
    numberPad2.classList.add('number-pad');
    numberPadContainer2.appendChild(numberPad2);

        for (let i = 0; i <= 9; i++) {
            const button = document.createElement('button');
            button.textContent = i;
            button.addEventListener('click', function() {
                const newScore = parseInt(player2Score.toString() + i.toString());
                if (newScore <= 30) {
                    player2Score = newScore;
                    player2ScoreLabel.textContent = player2Score;
                } else {
                    alert('Score cannot exceed 30');
                    player2Score = 0;
                    player2ScoreLabel.textContent = player2Score;
                }
            });
            numberPad2.appendChild(button);
        }

    // Create confirm button
    const confirmButton = document.createElement('button');
    confirmButton.textContent = 'Lagre';
    confirmButton.addEventListener('click', function() {
        updateScoreDisplay(match, player1Score, player2Score);
        document.body.removeChild(popup);
    });

    numberPadContainer.appendChild(numberPadContainer1);
    numberPadContainer.appendChild(numberPadContainer2);
    popup.appendChild(confirmButton);
    document.body.appendChild(popup);
}