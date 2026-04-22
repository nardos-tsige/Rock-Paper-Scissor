// ---------- GLOBAL STATE (encapsulated) ----------
let gameState = {
    roundMode: 5,           // 5 or 7 rounds - the maximum level of round
    currentRound: 1,
    playerScore: 0,
    computerScore: 0,
    gameActive: false,      // becomes true after mode selection
    gameFinished: false,
    roundInProgress: false,  // prevent double clicks during animation
    choices: ['rock', 'paper', 'scissors']
};

// DOM Elements
const modePanel = document.getElementById('modePanel');
const gameArena = document.getElementById('gameArena');
const playerScoreEl = document.getElementById('playerScore');
const compScoreEl = document.getElementById('compScore');
const currentRoundEl = document.getElementById('currentRound');
const maxRoundsEl = document.getElementById('maxRounds');
const resultMessageDiv = document.getElementById('resultMessage');
const playerChoiceIcon = document.getElementById('playerChoiceIcon');
const compChoiceIcon = document.getElementById('compChoiceIcon');
const winnerOverlay = document.getElementById('winnerOverlay');
const winnerText = document.getElementById('winnerText');
const closeWinnerBtn = document.getElementById('closeWinnerBtn');
const restartGameBtn = document.getElementById('restartGameBtn');

//buttons for moves
const rockBtn = document.querySelector('[data-move="rock"]');
const paperBtn = document.querySelector('[data-move="paper"]');
const scissorsBtn = document.querySelector('[data-move="scissors"]');
const modeBtns = document.querySelectorAll('.mode-btn');

// ---------- HELPER FUNCTIONS (Single Responsibility) ----------
// S: each function does one job/task

function getComputerChoice() {
    const randomIndex = Math.floor(Math.random() * gameState.choices.length);
    return gameState.choices[randomIndex];
}

//determine winner: returns 'player', 'computer', or 'draw'
function determineWinner(playerMove, computerMove) {
    if (playerMove === computerMove) return 'draw';
    
    const winConditions = {
        rock: 'scissors',
        paper: 'rock',
        scissors: 'paper'
    };
    
    if (winConditions[playerMove] === computerMove) {
        return 'player';
    } else {
        return 'computer';
    }
}

//update score based on winner
function updateScores(winner) {
    if (winner === 'player') {
        gameState.playerScore++;
        playerScoreEl.textContent = gameState.playerScore;
    } else if (winner === 'computer') {
        gameState.computerScore++;
        compScoreEl.textContent = gameState.computerScore;
    }
    //the 3rd probability - 'draw' - no score change
}

//check if game reached max rounds
function isGameComplete() {
    return gameState.currentRound > gameState.roundMode;
}

//get final winner message
function getFinalWinner() {
    if (gameState.playerScore > gameState.computerScore) return 'YOU WIN THE GAME! 🎉🏆';
    if (gameState.computerScore > gameState.playerScore) return 'COMPUTER WINS... 😭💀';
    return "IT'S A TIE GAME! ⚖️";
}

//display final winner overlay with confetti-like effect (no extra library, just style)
function showFinalWinnerOverlay() {
    const winnerMsg = getFinalWinner();
    winnerText.innerHTML = `<i class="fas fa-crown"></i> ${winnerMsg}`;
    winnerOverlay.style.display = 'flex';
    gameState.gameFinished = true;
    gameState.gameActive = false;
}

//reset game fully (preserve mode selection)
function fullGameReset(keepMode = true) {
    //reset scores & round counter
    gameState.currentRound = 1;
    gameState.playerScore = 0;
    gameState.computerScore = 0;
    gameState.gameFinished = false;
    gameState.roundInProgress = false;
    
    if (!keepMode) {
        //if we restart from overlay or restart btn, we might keep same round mode but re-activate
        gameState.gameActive = true;
    } else {
        gameState.gameActive = true;
    }
    
    //update UI
    playerScoreEl.textContent = '0';
    compScoreEl.textContent = '0';
    currentRoundEl.textContent = '1';
    resultMessageDiv.textContent = '✨ new game! pick a move ✨';
    resultMessageDiv.className = 'result-message';
    
    //reset choice icons to default
    playerChoiceIcon.innerHTML = '<i class="fas fa-question-circle"></i>';
    compChoiceIcon.innerHTML = '<i class="fas fa-microchip"></i>';
    
    //remove any lingering animation classes
    playerChoiceIcon.classList.remove('glow-win', 'shake-lose', 'blink-draw');
    compChoiceIcon.classList.remove('glow-win', 'shake-lose', 'blink-draw');
    
    //if game finished overlay closed, hide overlay
    winnerOverlay.style.display = 'none';
}

//restart from same round mode (keeps current mode)
function restartSameMode() {
    if (!gameState.gameActive && gameState.gameFinished) {
        fullGameReset(true);
        gameState.gameActive = true;
        gameState.gameFinished = false;
    } else {
        fullGameReset(true);
    }
    gameState.roundInProgress = false;
    // ensure round counter display matches
    maxRoundsEl.textContent = gameState.roundMode;
}

//increment round and check game completion
function advanceRound() {
    gameState.currentRound++;
    currentRoundEl.textContent = gameState.currentRound;
    
    if (isGameComplete()) {
        gameState.gameActive = false;
        gameState.gameFinished = true;
        showFinalWinnerOverlay();
    }
}

//apply win/loss/draw animations 
function applyResultAnimation(result, playerMoveIconElem, computerMoveIconElem) {
    //remove previous classes
    resultMessageDiv.classList.remove('result-win', 'result-lose', 'result-draw');
    playerMoveIconElem.classList.remove('glow-win', 'shake-lose', 'blink-draw');
    computerMoveIconElem.classList.remove('glow-win', 'shake-lose', 'blink-draw');
    
    if (result === 'player') {
        resultMessageDiv.classList.add('result-win');
        playerMoveIconElem.classList.add('glow-win');
        computerMoveIconElem.classList.add('shake-lose');
        resultMessageDiv.textContent = '🎉 YOU WIN! +1 🎉';
    } else if (result === 'computer') {
        resultMessageDiv.classList.add('result-lose');
        playerMoveIconElem.classList.add('shake-lose');
        computerMoveIconElem.classList.add('glow-win');
        resultMessageDiv.textContent = '💀 YOU LOSE! 💀';
    } else {
        resultMessageDiv.classList.add('result-draw');
        playerMoveIconElem.classList.add('blink-draw');
        computerMoveIconElem.classList.add('blink-draw');
        resultMessageDiv.textContent = '🤝 DRAW! 🤝';
    }
}

//update the visual icons (Font Awesome) based on move
function updateChoiceIcons(playerMove, computerMove) {
    // map moves to FontAwesome icons
    const moveIconMap = {
        rock: '<i class="fas fa-hand-back-fist"></i>',
        paper: '<i class="fas fa-hand-peace"></i>',
        scissors: '<i class="fas fa-hand-scissors"></i>'
    };
    
    playerChoiceIcon.innerHTML = moveIconMap[playerMove] || '<i class="fas fa-question-circle"></i>';
    compChoiceIcon.innerHTML = moveIconMap[computerMove] || '<i class="fas fa-microchip"></i>';
}

//core round logic: handles one round (Single Responsibility)
function playRound(playerMove) {
    //guard conditions: game inactive, round in progress, game finished
    if (!gameState.gameActive || gameState.roundInProgress || gameState.gameFinished) return;
    
    gameState.roundInProgress = true;
    
    //get computer move
    const computerMove = getComputerChoice();
    
    //determine winner
    const winner = determineWinner(playerMove, computerMove);
    
    //update UI icons
    updateChoiceIcons(playerMove, computerMove);
    
    //update scores
    updateScores(winner);
    
    //apply animation & result message
    applyResultAnimation(winner, playerChoiceIcon, compChoiceIcon);
    
    //after animation delay, handle round advancement & re-enable buttons
    setTimeout(() => {
        //check if game reached max rounds BEFORE increment?
        const beforeComplete = isGameComplete();
        
        if (!beforeComplete) {
            advanceRound();
        } else {
            //if already at last round and game just completed, show winner
            if (gameState.currentRound === gameState.roundMode && !gameState.gameFinished) {
                //check if we just finished final round
                if (gameState.currentRound === gameState.roundMode) {
                    gameState.gameActive = false;
                    gameState.gameFinished = true;
                    showFinalWinnerOverlay();
                }
            } else if (gameState.currentRound > gameState.roundMode) {
                //safety
                if (!gameState.gameFinished) {
                    gameState.gameActive = false;
                    gameState.gameFinished = true;
                    showFinalWinnerOverlay();
                }
            }
        }
        
        //after last round maybe extra check
        if (isGameComplete() && !gameState.gameFinished) {
            gameState.gameActive = false;
            gameState.gameFinished = true;
            showFinalWinnerOverlay();
        }
        
        //allow next round
        gameState.roundInProgress = false;
        
        //if game finished due to round completion, disable moves effect is already handled via gameActive
        if (gameState.gameFinished) {
            //make sure no further moves
        }
    }, 550); //match animation length
}

// ---------- EVENT HANDLERS & MODE SELECTION (Open-Closed: easy extend) ----------
function initModeSelection() {
    modeBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const rounds = parseInt(btn.getAttribute('data-rounds'), 10);
            gameState.roundMode = rounds;
            gameState.roundMode = rounds;
            // reset full game state
            gameState.currentRound = 1;
            gameState.playerScore = 0;
            gameState.computerScore = 0;
            gameState.gameActive = true;
            gameState.gameFinished = false;
            gameState.roundInProgress = false;
            
            //update UI
            playerScoreEl.textContent = '0';
            compScoreEl.textContent = '0';
            currentRoundEl.textContent = '1';
            maxRoundsEl.textContent = gameState.roundMode;
            resultMessageDiv.textContent = '⚔️ game started! pick move ⚔️';
            resultMessageDiv.className = 'result-message';
            playerChoiceIcon.innerHTML = '<i class="fas fa-question-circle"></i>';
            compChoiceIcon.innerHTML = '<i class="fas fa-microchip"></i>';
            
            //hide mode panel, show arena
            modePanel.style.display = 'none';
            gameArena.style.display = 'block';
            
            //remove any overlays
            winnerOverlay.style.display = 'none';
        });
    });
}

//attach move listeners
function attachMoveListeners() {
    const moveButtons = [rockBtn, paperBtn, scissorsBtn];
    moveButtons.forEach(btn => {
        if (!btn) return;
        btn.addEventListener('click', (e) => {
            const move = btn.getAttribute('data-move');
            if (move && gameState.gameActive && !gameState.roundInProgress && !gameState.gameFinished) {
                playRound(move);
            }
        });
    });
}

//restart button logic (Dependency inversion: restart uses core reset functions)
function attachRestartListener() {
    if (restartGameBtn) {
        restartGameBtn.addEventListener('click', () => {
            if (!gameState.gameActive || gameState.gameFinished || true) {
                //restart same mode without changing round mode
                restartSameMode();
                //ensure arena visible & mode panel hidden
                modePanel.style.display = 'none';
                gameArena.style.display = 'block';
                winnerOverlay.style.display = 'none';
                gameState.gameActive = true;
                gameState.gameFinished = false;
                gameState.roundInProgress = false;
                maxRoundsEl.textContent = gameState.roundMode;
                currentRoundEl.textContent = gameState.currentRound;
                resultMessageDiv.textContent = '🔄 game restarted! choose move 🔄';
                resultMessageDiv.className = 'result-message';
            }
        });
    }
}

//winner overlay close + restart (reuse)
function attachWinnerOverlayRestart() {
    if (closeWinnerBtn) {
        closeWinnerBtn.addEventListener('click', () => {
            //reset game fully, keep same round mode
            fullGameReset(true);
            gameState.gameActive = true;
            gameState.gameFinished = false;
            gameState.roundInProgress = false;
            gameState.currentRound = 1;
            gameState.playerScore = 0;
            gameState.computerScore = 0;
            playerScoreEl.textContent = '0';
            compScoreEl.textContent = '0';
            currentRoundEl.textContent = '1';
            maxRoundsEl.textContent = gameState.roundMode;
            resultMessageDiv.textContent = '✨ new match! good luck ✨';
            resultMessageDiv.className = 'result-message';
            playerChoiceIcon.innerHTML = '<i class="fas fa-question-circle"></i>';
            compChoiceIcon.innerHTML = '<i class="fas fa-microchip"></i>';
            winnerOverlay.style.display = 'none';
            gameState.gameActive = true;
            gameState.gameFinished = false;
        });
    }
}

//initialize all (IIFE pattern but called on load)
function initGame() {
    initModeSelection();
    attachMoveListeners();
    attachRestartListener();
    attachWinnerOverlayRestart();
    //default hide winner overlay
    winnerOverlay.style.display = 'none';
    //initial state: mode panel visible, arena hidden, gameActive false until mode pick
    gameState.gameActive = false;
    gameState.gameFinished = false;
    gameState.roundInProgress = false;
}

//start everything when DOM loaded
document.addEventListener('DOMContentLoaded', initGame);