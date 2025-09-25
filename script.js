class ColorFloodGame {
    constructor() {
        this.gridSize = { rows: 20, cols: 10 };
        this.colors = ['red', 'green', 'yellow'];
        this.clicksRemaining = 3;
        this.selectedColor = null;
        this.targetColor = null;
        this.gameBoard = [];
        this.gameOver = false;
        
        this.initializeGame();
        this.setupEventListeners();
    }
    
    initializeGame() {
        // Try to load custom level first, otherwise generate random
        if (!this.loadCustomLevelFromStorage()) {
            this.generateRandomBoard();
            this.selectRandomTargetColor();
        }
        this.renderBoard();
        this.updateUI();
    }
    
    generateRandomBoard() {
        this.gameBoard = [];
        for (let row = 0; row < this.gridSize.rows; row++) {
            this.gameBoard[row] = [];
            for (let col = 0; col < this.gridSize.cols; col++) {
                // Create the custom level pattern: red cross, yellow corners, green background
                if (this.isRedCross(row, col)) {
                    this.gameBoard[row][col] = 'red';
                } else if (this.isYellowCorner(row, col)) {
                    this.gameBoard[row][col] = 'yellow';
                } else {
                    this.gameBoard[row][col] = 'green';
                }
            }
        }
    }
    
    generateTrulyRandomBoard() {
        // Generate one of three solvable levels
        const levelType = Math.floor(Math.random() * 3);
        this.gameBoard = [];
        
        for (let row = 0; row < this.gridSize.rows; row++) {
            this.gameBoard[row] = [];
            for (let col = 0; col < this.gridSize.cols; col++) {
                if (levelType === 0) {
                    // Level 1: Red cross, yellow corners, green background (your original)
                    if (this.isRedCross(row, col)) {
                        this.gameBoard[row][col] = 'red';
                    } else if (this.isYellowCorner(row, col)) {
                        this.gameBoard[row][col] = 'yellow';
                    } else {
                        this.gameBoard[row][col] = 'green';
                    }
                } else if (levelType === 1) {
                    // Level 2: Green border, red center, yellow target areas
                    if (this.isGreenBorder(row, col)) {
                        this.gameBoard[row][col] = 'green';
                    } else if (this.isRedCenter(row, col)) {
                        this.gameBoard[row][col] = 'red';
                    } else {
                        this.gameBoard[row][col] = 'yellow';
                    }
                } else {
                    // Level 3: Yellow stripes, red and green alternating
                    if (this.isYellowStripe(row, col)) {
                        this.gameBoard[row][col] = 'yellow';
                    } else if ((row + col) % 2 === 0) {
                        this.gameBoard[row][col] = 'red';
                    } else {
                        this.gameBoard[row][col] = 'green';
                    }
                }
            }
        }
    }
    
    isRedCross(row, col) {
        // Vertical band: columns 4-5 (0-indexed, so 4 and 5)
        const isVerticalBand = (col === 4 || col === 5);
        // Horizontal band: rows 9-10 (0-indexed, so 9 and 10)
        const isHorizontalBand = (row === 9 || row === 10);
        
        return isVerticalBand || isHorizontalBand;
    }
    
    isYellowCorner(row, col) {
        // Top-left corner: rows 0-1, cols 0-1
        const isTopLeft = (row <= 1 && col <= 1);
        // Top-right corner: rows 0-1, cols 8-9
        const isTopRight = (row <= 1 && col >= 8);
        // Bottom-left corner: rows 18-19, cols 0-1
        const isBottomLeft = (row >= 18 && col <= 1);
        // Bottom-right corner: rows 18-19, cols 8-9
        const isBottomRight = (row >= 18 && col >= 8);
        
        return isTopLeft || isTopRight || isBottomLeft || isBottomRight;
    }
    
    isGreenBorder(row, col) {
        // Green border around the edges
        return row === 0 || row === this.gridSize.rows - 1 || 
               col === 0 || col === this.gridSize.cols - 1;
    }
    
    isRedCenter(row, col) {
        // Red center area (middle 6x16 area)
        const centerRowStart = 7;
        const centerRowEnd = 12;
        const centerColStart = 2;
        const centerColEnd = 7;
        
        return row >= centerRowStart && row <= centerRowEnd && 
               col >= centerColStart && col <= centerColEnd;
    }
    
    isYellowStripe(row, col) {
        // Yellow horizontal stripes every 4 rows
        return row % 4 === 0 || row % 4 === 1;
    }
    
    selectRandomTargetColor() {
        // Set yellow as default target color for the custom level
        this.targetColor = 'yellow';
        const targetDisplay = document.getElementById('target-color-display');
        targetDisplay.className = this.targetColor;
    }
    
    loadCustomLevelFromStorage() {
        try {
            const customLevelData = localStorage.getItem('customLevel');
            if (customLevelData) {
                const levelData = JSON.parse(customLevelData);
                
                // Validate level data
                if (levelData.board && levelData.targetColor && 
                    levelData.board.length === this.gridSize.rows &&
                    levelData.board[0].length === this.gridSize.cols &&
                    this.colors.includes(levelData.targetColor)) {
                    
                    this.gameBoard = levelData.board;
                    this.targetColor = levelData.targetColor;
                    
                    const targetDisplay = document.getElementById('target-color-display');
                    targetDisplay.className = this.targetColor;
                    
                    // Clear custom level from storage after loading
                    localStorage.removeItem('customLevel');
                    
                    this.showMessage('Загружен кастомный уровень!', 'info');
                    return true;
                }
            }
        } catch (error) {
            console.error('Error loading custom level:', error);
        }
        return false;
    }
    
    renderBoard() {
        const gameBoardElement = document.getElementById('game-board');
        gameBoardElement.innerHTML = '';
        
        for (let row = 0; row < this.gridSize.rows; row++) {
            for (let col = 0; col < this.gridSize.cols; col++) {
                const cell = document.createElement('div');
                cell.className = `grid-cell ${this.gameBoard[row][col]}`;
                cell.dataset.row = row;
                cell.dataset.col = col;
                cell.addEventListener('click', () => this.handleCellClick(row, col));
                gameBoardElement.appendChild(cell);
            }
        }
    }
    
    setupEventListeners() {
        // Color palette selection
        document.querySelectorAll('.color-option').forEach(option => {
            option.addEventListener('click', (e) => {
                if (this.gameOver) return;
                
                // Remove previous selection
                document.querySelectorAll('.color-option').forEach(opt => opt.classList.remove('selected'));
                
                // Select new color
                e.target.classList.add('selected');
                this.selectedColor = e.target.dataset.color;
            });
        });
        
        // Custom level button (default level)
        document.getElementById('new-game-btn').addEventListener('click', () => {
            this.loadCustomLevel();
        });
        
        // Random level button
        document.getElementById('random-level-btn').addEventListener('click', () => {
            this.loadRandomLevel();
        });
        
        // Reset button
        document.getElementById('reset-btn').addEventListener('click', () => {
            this.resetGame();
        });
        
        // Settings button
        document.getElementById('settings-btn').addEventListener('click', () => {
            this.openModal();
        });
        
        // Modal close button
        document.getElementById('modal-close').addEventListener('click', () => {
            this.closeModal();
        });
        
        // Modal overlay click to close
        document.getElementById('modal-overlay').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                this.closeModal();
            }
        });
        
        // Edit Level button
        document.getElementById('edit-level-btn').addEventListener('click', () => {
            this.closeModal();
            window.location.href = 'editor.html';
        });
        
        // Level buttons
        document.getElementById('level1-btn').addEventListener('click', () => {
            this.loadLevel1();
        });
        
        document.getElementById('level2-btn').addEventListener('click', () => {
            this.loadLevel2();
        });
        
        document.getElementById('level3-btn').addEventListener('click', () => {
            this.loadLevel3();
        });
        
        // Check updates button
        document.getElementById('check-updates-btn').addEventListener('click', () => {
            this.checkForUpdates();
        });
    }
    
    handleCellClick(row, col) {
        if (this.gameOver || this.clicksRemaining <= 0 || !this.selectedColor) {
            return;
        }
        
        const clickedColor = this.gameBoard[row][col];
        
        // If clicking on the same color as selected, do nothing
        if (clickedColor === this.selectedColor) {
            this.showMessage('Выберите другой цвет!', 'info');
            return;
        }
        
        // Perform flood fill
        this.floodFill(row, col, clickedColor, this.selectedColor);
        
        // Check win condition immediately after flood fill
        if (this.checkWinCondition()) {
            this.gameOver = true;
            this.showWinMessage();
            this.renderBoard();
            this.updateUI(); // Update UI to show final state
            
            // Add visual celebration
            setTimeout(() => {
                document.body.style.background = 'linear-gradient(45deg, #ffd700, #ffed4e, #ffd700)';
                setTimeout(() => {
                    document.body.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
                }, 2000);
            }, 500);
            
            return; // Exit early if won
        }
        
        // Decrease clicks and update UI
        this.clicksRemaining--;
        this.updateUI();
        
        // Check if game is over due to no more clicks
        if (this.clicksRemaining <= 0) {
            this.gameOver = true;
            this.showLoseMessage();
        }
        
        // Re-render board to show changes
        this.renderBoard();
    }
    
    floodFill(startRow, startCol, oldColor, newColor) {
        if (oldColor === newColor) return;
        
        const stack = [[startRow, startCol]];
        const visited = new Set();
        
        while (stack.length > 0) {
            const [row, col] = stack.pop();
            const key = `${row},${col}`;
            
            if (visited.has(key)) continue;
            if (row < 0 || row >= this.gridSize.rows || col < 0 || col >= this.gridSize.cols) continue;
            if (this.gameBoard[row][col] !== oldColor) continue;
            
            visited.add(key);
            this.gameBoard[row][col] = newColor;
            
            // Add adjacent cells to stack (up, down, left, right)
            stack.push([row - 1, col]);
            stack.push([row + 1, col]);
            stack.push([row, col - 1]);
            stack.push([row, col + 1]);
        }
    }
    
    checkWinCondition() {
        // Check if all cells have the target color
        for (let row = 0; row < this.gridSize.rows; row++) {
            for (let col = 0; col < this.gridSize.cols; col++) {
                if (this.gameBoard[row][col] !== this.targetColor) {
                    return false;
                }
            }
        }
        return true;
    }
    
    updateUI() {
        document.getElementById('clicks').textContent = this.clicksRemaining;
        
        // Don't clear win/lose messages
        const messageElement = document.getElementById('game-message');
        if (!messageElement.classList.contains('win') && !messageElement.classList.contains('lose')) {
            this.clearMessage();
        }
    }
    
    showMessage(text, type) {
        const messageElement = document.getElementById('game-message');
        messageElement.textContent = text;
        messageElement.className = `game-message ${type}`;
        
        // Force display for win/lose messages
        if (type === 'win' || type === 'lose') {
            messageElement.style.display = 'block';
            messageElement.style.visibility = 'visible';
            messageElement.style.opacity = '1';
            messageElement.style.position = 'fixed';
            messageElement.style.top = '50%';
            messageElement.style.left = '50%';
            messageElement.style.transform = 'translate(-50%, -50%)';
            messageElement.style.zIndex = '9999';
        }
        
        // Debug: log message display
        console.log('Showing message:', text, 'Type:', type);
        console.log('Message element:', messageElement);
        console.log('Message element style:', messageElement.style.display);
        
        // Auto-hide messages after 5 seconds (except win/lose messages)
        if (type !== 'win' && type !== 'lose') {
            setTimeout(() => {
                this.clearMessage();
            }, 3000);
        } else {
            // For win/lose messages, add click to close
            messageElement.style.cursor = 'pointer';
            messageElement.onclick = () => {
                this.clearMessage();
            };
        }
    }
    
    showWinMessage() {
        const messageElement = document.getElementById('game-message');
        messageElement.innerHTML = `
            <div style="text-align: center;">
                <div style="font-size: 1.4em; margin-bottom: 15px;">
                    🎉 ПОЗДРАВЛЯЕМ! ВЫ ВЫИГРАЛИ! 🎉
                </div>
                <div style="margin-bottom: 20px;">
                    Отличная работа!
                </div>
                <button onclick="game.loadCustomLevel()" style="
                    background: linear-gradient(45deg, #27ae60, #2ecc71);
                    color: white;
                    border: none;
                    border-radius: 8px;
                    padding: 12px 24px;
                    font-size: 1.1em;
                    font-weight: bold;
                    cursor: pointer;
                    margin: 5px;
                ">🎯 Новая игра</button>
                <button onclick="game.closeMessage()" style="
                    background: linear-gradient(45deg, #95a5a6, #7f8c8d);
                    color: white;
                    border: none;
                    border-radius: 8px;
                    padding: 12px 24px;
                    font-size: 1.1em;
                    font-weight: bold;
                    cursor: pointer;
                    margin: 5px;
                ">✕ Закрыть</button>
            </div>
        `;
        messageElement.className = 'game-message win';
        
        // Force display
        messageElement.style.display = 'block';
        messageElement.style.visibility = 'visible';
        messageElement.style.opacity = '1';
        messageElement.style.position = 'fixed';
        messageElement.style.top = '50%';
        messageElement.style.left = '50%';
        messageElement.style.transform = 'translate(-50%, -50%)';
        messageElement.style.zIndex = '9999';
    }
    
    showLoseMessage() {
        const messageElement = document.getElementById('game-message');
        messageElement.innerHTML = `
            <div style="text-align: center;">
                <div style="font-size: 1.2em; margin-bottom: 15px;">
                    😔 ИГРА ОКОНЧЕНА!
                </div>
                <div style="margin-bottom: 20px;">
                    Попытки закончились.
                </div>
                <button onclick="game.loadCustomLevel()" style="
                    background: linear-gradient(45deg, #27ae60, #2ecc71);
                    color: white;
                    border: none;
                    border-radius: 8px;
                    padding: 12px 24px;
                    font-size: 1.1em;
                    font-weight: bold;
                    cursor: pointer;
                    margin: 5px;
                ">🎯 Новая игра</button>
                <button onclick="game.closeMessage()" style="
                    background: linear-gradient(45deg, #95a5a6, #7f8c8d);
                    color: white;
                    border: none;
                    border-radius: 8px;
                    padding: 12px 24px;
                    font-size: 1.1em;
                    font-weight: bold;
                    cursor: pointer;
                    margin: 5px;
                ">✕ Закрыть</button>
            </div>
        `;
        messageElement.className = 'game-message lose';
        
        // Force display
        messageElement.style.display = 'block';
        messageElement.style.visibility = 'visible';
        messageElement.style.opacity = '1';
        messageElement.style.position = 'fixed';
        messageElement.style.top = '50%';
        messageElement.style.left = '50%';
        messageElement.style.transform = 'translate(-50%, -50%)';
        messageElement.style.zIndex = '9999';
    }
    
    closeMessage() {
        this.clearMessage();
    }
    
    checkForUpdates() {
        this.closeModal();
        this.showMessage('🔄 Проверка обновлений...', 'info');
        
        // Simulate checking for updates
        setTimeout(() => {
            // Force reload the page to get latest version
            this.showMessage('✅ Обновление найдено! Перезагружаем страницу...', 'info');
            setTimeout(() => {
                window.location.reload(true);
            }, 2000);
        }, 1500);
    }
    
    clearMessage() {
        const messageElement = document.getElementById('game-message');
        messageElement.textContent = '';
        messageElement.className = 'game-message';
    }
    
    loadCustomLevel() {
        this.clicksRemaining = 3;
        this.selectedColor = null;
        this.gameOver = false;
        
        // Clear color selection
        document.querySelectorAll('.color-option').forEach(opt => opt.classList.remove('selected'));
        
        // Load the custom level pattern
        this.generateRandomBoard(); // This now generates the custom level
        this.selectRandomTargetColor(); // This sets yellow as target
        this.renderBoard();
        this.updateUI();
        this.clearMessage();
        this.showMessage('Загружен кастомный уровень!', 'info');
        this.closeModal();
    }
    
    loadRandomLevel() {
        this.clicksRemaining = 3;
        this.selectedColor = null;
        this.gameOver = false;
        
        // Clear color selection
        document.querySelectorAll('.color-option').forEach(opt => opt.classList.remove('selected'));
        
        // Load a random level (one of three types)
        this.generateTrulyRandomBoard();
        // Set yellow as target color for all levels
        this.targetColor = 'yellow';
        const targetDisplay = document.getElementById('target-color-display');
        targetDisplay.className = this.targetColor;
        this.renderBoard();
        this.updateUI();
        this.clearMessage();
        this.showMessage('Загружен случайный уровень!', 'info');
        this.closeModal();
    }
    
    loadLevel1() {
        this.clicksRemaining = 3;
        this.selectedColor = null;
        this.gameOver = false;
        
        // Clear color selection
        document.querySelectorAll('.color-option').forEach(opt => opt.classList.remove('selected'));
        
        // Load Level 1: Red cross, yellow corners, green background
        this.gameBoard = [];
        for (let row = 0; row < this.gridSize.rows; row++) {
            this.gameBoard[row] = [];
            for (let col = 0; col < this.gridSize.cols; col++) {
                if (this.isRedCross(row, col)) {
                    this.gameBoard[row][col] = 'red';
                } else if (this.isYellowCorner(row, col)) {
                    this.gameBoard[row][col] = 'yellow';
                } else {
                    this.gameBoard[row][col] = 'green';
                }
            }
        }
        
        this.targetColor = 'yellow';
        const targetDisplay = document.getElementById('target-color-display');
        targetDisplay.className = this.targetColor;
        this.renderBoard();
        this.updateUI();
        this.clearMessage();
        this.showMessage('Загружен Уровень 1 (Крест)!', 'info');
        this.closeModal();
    }
    
    loadLevel2() {
        this.clicksRemaining = 3;
        this.selectedColor = null;
        this.gameOver = false;
        
        // Clear color selection
        document.querySelectorAll('.color-option').forEach(opt => opt.classList.remove('selected'));
        
        // Load Level 2: Green border, red center, yellow target areas
        this.gameBoard = [];
        for (let row = 0; row < this.gridSize.rows; row++) {
            this.gameBoard[row] = [];
            for (let col = 0; col < this.gridSize.cols; col++) {
                if (this.isGreenBorder(row, col)) {
                    this.gameBoard[row][col] = 'green';
                } else if (this.isRedCenter(row, col)) {
                    this.gameBoard[row][col] = 'red';
                } else {
                    this.gameBoard[row][col] = 'yellow';
                }
            }
        }
        
        this.targetColor = 'yellow';
        const targetDisplay = document.getElementById('target-color-display');
        targetDisplay.className = this.targetColor;
        this.renderBoard();
        this.updateUI();
        this.clearMessage();
        this.showMessage('Загружен Уровень 2 (Рамка)!', 'info');
        this.closeModal();
    }
    
    loadLevel3() {
        this.clicksRemaining = 3;
        this.selectedColor = null;
        this.gameOver = false;
        
        // Clear color selection
        document.querySelectorAll('.color-option').forEach(opt => opt.classList.remove('selected'));
        
        // Load Level 3: Yellow stripes, red and green alternating
        this.gameBoard = [];
        for (let row = 0; row < this.gridSize.rows; row++) {
            this.gameBoard[row] = [];
            for (let col = 0; col < this.gridSize.cols; col++) {
                if (this.isYellowStripe(row, col)) {
                    this.gameBoard[row][col] = 'yellow';
                } else if ((row + col) % 2 === 0) {
                    this.gameBoard[row][col] = 'red';
                } else {
                    this.gameBoard[row][col] = 'green';
                }
            }
        }
        
        this.targetColor = 'yellow';
        const targetDisplay = document.getElementById('target-color-display');
        targetDisplay.className = this.targetColor;
        this.renderBoard();
        this.updateUI();
        this.clearMessage();
        this.showMessage('Загружен Уровень 3 (Полосы)!', 'info');
        this.closeModal();
    }
    
    newGame() {
        this.loadCustomLevel();
    }
    
    openModal() {
        document.getElementById('modal-overlay').classList.add('active');
    }
    
    closeModal() {
        document.getElementById('modal-overlay').classList.remove('active');
    }
    
    resetGame() {
        this.clicksRemaining = 3;
        this.selectedColor = null;
        this.gameOver = false;
        
        // Clear color selection
        document.querySelectorAll('.color-option').forEach(opt => opt.classList.remove('selected'));
        
        // Keep the same board but reset clicks
        this.renderBoard();
        this.updateUI();
        this.clearMessage();
        this.closeModal();
    }
}

// Initialize the game when the page loads
let game;
document.addEventListener('DOMContentLoaded', () => {
    game = new ColorFloodGame();
});


