import { updateMatchScores } from "./score-logics.js";

export function openScorePopup(match, player1, player2) {
    let player1Score = 0;
    let player2Score = 0;

    // Create popup container
    const popup = document.createElement('div');
    popup.classList.add('popup');

    // Add close button
    const closeBtn = document.createElement('button');
    closeBtn.textContent = 'X';
    closeBtn.classList.add('popup-close-btn');
    closeBtn.addEventListener('click', function() {
        document.body.removeChild(popup);
    });
    popup.appendChild(closeBtn);

    // Create confirm button
    const saveBtn = document.createElement('button');
    saveBtn.textContent = 'Lagre';
    saveBtn.classList.add('popup-save-btn');
    saveBtn.addEventListener('click', function() {
        console.log('Player 1 score: ', player1Score, 'Player 2 score: ', player2Score);
        if (player1Score < 21 && player2Score < 21) {
            alert('Minimum en spiller må ha minst 21 poeng');
            
            player1Score = 0;
            player2Score = 0;
            updateScoreLabel(() => player1Score, 0, (score) => player1Score = score, player1ScoreLabel, player1);
            updateScoreLabel(() => player2Score, 0, (score) => player2Score = score, player2ScoreLabel, player2);
            return;
        }
        if (player1Score > 32 || player2Score > 32) {
            alert('Ingen spillere kan ha mer enn 32 poeng');
            player1Score = 0;
            player2Score = 0;
            updateScoreLabel(() => player1Score, 0, (score) => player1Score = score, player1ScoreLabel, player1);
            updateScoreLabel(() => player2Score, 0, (score) => player2Score = score, player2ScoreLabel, player2);
            return;
        }
        updateMatchScores(match, player1Score, player2Score);
        document.body.removeChild(popup);
    });
    popup.appendChild(saveBtn);
    // create number pad container
    const numberPadsContainer = document.createElement('div');
    numberPadsContainer.classList.add('number-pads-container');
    popup.appendChild(numberPadsContainer);

      // Create number pads for both players
      const player1ScoreLabel = createNumberPad(numberPadsContainer, player1, () => player1Score, (score) => player1Score = score);
      const player2ScoreLabel = createNumberPad(numberPadsContainer, player2, () => player2Score, (score) => player2Score = score);
    
    document.body.appendChild(popup);
}

    // Function to create number pad for a player
    function createNumberPad(numberPadsContainer, player, getPlayerScore, setPlayerScore) {
        const numberPadContainer = document.createElement('div');
        numberPadContainer.classList.add('number-pad-container');

        const playerInfo = document.createElement('div');
        playerInfo.classList.add('player-info');

        const playerLabel = document.createElement('h2');
        playerLabel.textContent = player.name;
        numberPadContainer.appendChild(playerInfo);
        playerInfo.appendChild(playerLabel);

        const playerScoreLabel = document.createElement('h1');
        playerScoreLabel.textContent = getPlayerScore();
        playerInfo.appendChild(playerScoreLabel);

        const resetScoreButton = document.createElement('button');
        resetScoreButton.textContent = 'Reset';
        resetScoreButton.classList.add('reset-score-btn');
        resetScoreButton.addEventListener('click', function() {
            setPlayerScore(0);
            playerScoreLabel.textContent = 0;
        });
        
        playerInfo.appendChild(resetScoreButton);



        const numberPad = document.createElement('div');
        numberPad.classList.add('number-pad');
        numberPadContainer.appendChild(numberPad);

        for (let i = 1; i <= 9; i++) {
            const button = document.createElement('button');
            button.textContent = i;
            button.addEventListener('click', function() {
                updateScoreLabel(getPlayerScore, i, setPlayerScore, playerScoreLabel, player);
            });
            numberPad.appendChild(button);
        }

        const zeroButton = document.createElement('button');
        zeroButton.textContent = 0;
        zeroButton.classList.add('zero');
        zeroButton.addEventListener('click', function() {
            updateScoreLabel(getPlayerScore, zeroButton.textContent, setPlayerScore, playerScoreLabel, player);
        });
        numberPad.appendChild(zeroButton);

        numberPadsContainer.appendChild(numberPadContainer);

        return playerScoreLabel;
    }

function updateScoreLabel(getPlayerScore, value, setPlayerScore, playerScoreLabel, player) {
    const newScore = parseInt(getPlayerScore().toString() + value.toString());
    setPlayerScore(newScore);
    playerScoreLabel.textContent = newScore;
}
