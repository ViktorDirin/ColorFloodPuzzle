class LevelEditor {
    constructor() {
        this.gridSize = { rows: 20, cols: 10 };
        this.colors = ['red', 'green', 'yellow', 'blue'];
        this.selectedColor = null;
        this.targetColor = 'red'; // Default target color
        this.editorBoard = [];
        this.isTargetColorMode = false;
        
        this.initializeEditor();
        this.setupEventListeners();
    }
    
    initializeEditor() {
        this.createEmptyBoard();
        this.renderBoard();
        this.updateUI();
    }
    
    createEmptyBoard() {
        this.editorBoard = [];
        for (let row = 0; row < this.gridSize.rows; row++) {
            this.editorBoard[row] = [];
            for (let col = 0; col < this.gridSize.cols; col++) {
                this.editorBoard[row][col] = null; // Empty cell
            }
        }
    }
    
    renderBoard() {
        const editorBoardElement = document.getElementById('editor-board');
        editorBoardElement.innerHTML = '';
        
        for (let row = 0; row < this.gridSize.rows; row++) {
            for (let col = 0; col < this.gridSize.cols; col++) {
                const cell = document.createElement('div');
                cell.className = 'editor-cell';
                if (this.editorBoard[row][col]) {
                    cell.classList.add(this.editorBoard[row][col]);
                }
                cell.dataset.row = row;
                cell.dataset.col = col;
                cell.addEventListener('click', () => this.handleCellClick(row, col));
                editorBoardElement.appendChild(cell);
            }
        }
    }
    
    setupEventListeners() {
        // Main color palette selection
        document.querySelectorAll('.color-palette .color-option').forEach(option => {
            option.addEventListener('click', (e) => {
                this.selectColor(e.target.dataset.color, false);
            });
        });
        
        // Target color selection
        document.querySelectorAll('.target-color-picker .color-option').forEach(option => {
            option.addEventListener('click', (e) => {
                this.selectTargetColor(e.target.dataset.color);
            });
        });
        
        // Control buttons
        document.getElementById('clear-field-btn').addEventListener('click', () => {
            this.clearField();
        });
        
        document.getElementById('save-level-btn').addEventListener('click', () => {
            this.saveLevel();
        });
        
        document.getElementById('back-to-game-btn').addEventListener('click', () => {
            this.backToGame();
        });
    }
    
    selectColor(color, isTargetMode = false) {
        this.isTargetColorMode = isTargetMode;
        this.selectedColor = color;
        
        // Update visual selection
        document.querySelectorAll('.color-palette .color-option').forEach(opt => {
            opt.classList.remove('selected');
        });
        
        if (!isTargetMode) {
            document.querySelector(`.color-palette .color-option[data-color="${color}"]`).classList.add('selected');
        }
        
        this.updateUI();
    }
    
    selectTargetColor(color) {
        // Validate that the color is in the available colors
        if (!this.colors.includes(color)) {
            this.showMessage('Ошибка: Цвет должен быть одним из доступных в палитре!', 'error');
            return;
        }
        
        this.targetColor = color;
        
        // Update visual selection
        document.querySelectorAll('.target-color-picker .color-option').forEach(opt => {
            opt.classList.remove('target-selected');
        });
        
        document.querySelector(`.target-color-picker .color-option[data-color="${color}"]`).classList.add('target-selected');
        
        this.updateUI();
    }
    
    handleCellClick(row, col) {
        if (!this.selectedColor) {
            this.showMessage('Сначала выберите цвет!', 'error');
            return;
        }
        
        this.editorBoard[row][col] = this.selectedColor;
        this.renderBoard();
        this.showMessage(`Ячейка окрашена в ${this.selectedColor}`, 'info');
    }
    
    clearField() {
        if (confirm('Очистить все поле? Это действие нельзя отменить.')) {
            this.createEmptyBoard();
            this.renderBoard();
            this.showMessage('Поле очищено', 'info');
        }
    }
    
    saveLevel() {
        // Validate that target color exists on the board
        if (!this.validateTargetColor()) {
            this.showMessage('Ошибка: Целевой цвет должен присутствовать на поле!', 'error');
            return;
        }
        
        // Validate that board is not empty
        if (this.isBoardEmpty()) {
            this.showMessage('Ошибка: Поле не может быть пустым!', 'error');
            return;
        }
        
        if (confirm('Сохранить этот уровень? Он заменит текущий уровень в игре.')) {
            this.saveLevelToStorage();
            this.showMessage('Уровень сохранен! Переходим к игре...', 'success');
            
            // Redirect to main game after a short delay
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        }
    }
    
    validateTargetColor() {
        for (let row = 0; row < this.gridSize.rows; row++) {
            for (let col = 0; col < this.gridSize.cols; col++) {
                if (this.editorBoard[row][col] === this.targetColor) {
                    return true;
                }
            }
        }
        return false;
    }
    
    isBoardEmpty() {
        for (let row = 0; row < this.gridSize.rows; row++) {
            for (let col = 0; col < this.gridSize.cols; col++) {
                if (this.editorBoard[row][col] !== null) {
                    return false;
                }
            }
        }
        return true;
    }
    
    saveLevelToStorage() {
        const levelData = {
            board: this.editorBoard,
            targetColor: this.targetColor,
            timestamp: new Date().toISOString()
        };
        
        localStorage.setItem('customLevel', JSON.stringify(levelData));
    }
    
    backToGame() {
        if (confirm('Выйти из редактора? Несохраненные изменения будут потеряны.')) {
            window.location.href = 'index.html';
        }
    }
    
    updateUI() {
        const selectedDisplay = document.getElementById('selected-color-display');
        const targetDisplay = document.getElementById('target-color-display');
        
        if (this.selectedColor) {
            selectedDisplay.className = this.selectedColor;
            selectedDisplay.style.display = 'inline-block';
        } else {
            selectedDisplay.style.display = 'none';
        }
        
        targetDisplay.className = this.targetColor;
    }
    
    showMessage(text, type) {
        const messageElement = document.getElementById('editor-message');
        messageElement.textContent = text;
        messageElement.className = `editor-message ${type}`;
        
        // Clear message after 3 seconds
        setTimeout(() => {
            messageElement.textContent = '';
            messageElement.className = 'editor-message';
        }, 3000);
    }
}

// Initialize the editor when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new LevelEditor();
});
