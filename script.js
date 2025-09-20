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
        this.generateRandomBoard();
        this.selectRandomTargetColor();
        this.renderBoard();
        this.updateUI();
    }
    
    generateRandomBoard() {
        this.gameBoard = [];
        for (let row = 0; row < this.gridSize.rows; row++) {
            this.gameBoard[row] = [];
            for (let col = 0; col < this.gridSize.cols; col++) {
                // Create 4 quarters with different colors
                const midRow = Math.floor(this.gridSize.rows / 2);
                const midCol = Math.floor(this.gridSize.cols / 2);
                
                if (row < midRow && col < midCol) {
                    // Top-left quarter
                    this.gameBoard[row][col] = this.colors[0]; // red
                } else if (row < midRow && col >= midCol) {
                    // Top-right quarter
                    this.gameBoard[row][col] = this.colors[1]; // green
                } else if (row >= midRow && col < midCol) {
                    // Bottom-left quarter
                    this.gameBoard[row][col] = this.colors[2]; // yellow
                } else {
                    // Bottom-right quarter
                    this.gameBoard[row][col] = this.colors[Math.floor(Math.random() * this.colors.length)]; // random
                }
            }
        }
    }
    
    selectRandomTargetColor() {
        this.targetColor = this.colors[Math.floor(Math.random() * this.colors.length)];
        const targetDisplay = document.getElementById('target-color-display');
        targetDisplay.className = this.targetColor;
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
        
        // New game button
        document.getElementById('new-game-btn').addEventListener('click', () => {
            this.newGame();
        });
        
        // Reset button
        document.getElementById('reset-btn').addEventListener('click', () => {
            this.resetGame();
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
        
        // Decrease clicks and update UI
        this.clicksRemaining--;
        this.updateUI();
        
        // Check win condition
        if (this.checkWinCondition()) {
            this.gameOver = true;
            this.showMessage('Поздравляем! Вы выиграли!', 'win');
        } else if (this.clicksRemaining <= 0) {
            this.gameOver = true;
            this.showMessage('Игра окончена! Попробуйте еще раз.', 'lose');
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
        
        // Clear any existing messages
        this.clearMessage();
    }
    
    showMessage(text, type) {
        const messageElement = document.getElementById('game-message');
        messageElement.textContent = text;
        messageElement.className = `game-message ${type}`;
    }
    
    clearMessage() {
        const messageElement = document.getElementById('game-message');
        messageElement.textContent = '';
        messageElement.className = 'game-message';
    }
    
    newGame() {
        this.clicksRemaining = 3;
        this.selectedColor = null;
        this.gameOver = false;
        
        // Clear color selection
        document.querySelectorAll('.color-option').forEach(opt => opt.classList.remove('selected'));
        
        this.initializeGame();
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
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new ColorFloodGame();
});
