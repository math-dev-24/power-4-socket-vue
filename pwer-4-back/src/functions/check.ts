export function check_win(board: string[][]): boolean {
    const ROWS = 6;
    const COLS = 7;

    const isWinningLine = (cells: string[]): boolean =>
        cells.every((cell) => cell !== "N" && cell === cells[0]);

    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col <= COLS - 4; col++) {
            if (isWinningLine([
                board[row][col],
                board[row][col + 1],
                board[row][col + 2],
                board[row][col + 3]
            ])) {
                return true;
            }
        }
    }

    for (let col = 0; col < COLS; col++) {
        for (let row = 0; row <= ROWS - 4; row++) {
            if (isWinningLine([
                board[row][col],
                board[row + 1][col],
                board[row + 2][col],
                board[row + 3][col]
            ])) {
                return true;
            }
        }
    }
    for (let row = 0; row <= ROWS - 4; row++) {
        for (let col = 0; col <= COLS - 4; col++) {
            if (isWinningLine([
                board[row][col],
                board[row + 1][col + 1],
                board[row + 2][col + 2],
                board[row + 3][col + 3]
            ])) {
                return true;
            }
        }
    }
    for (let row = 3; row < ROWS; row++) {
        for (let col = 0; col <= COLS - 4; col++) {
            if (isWinningLine([
                board[row][col],
                board[row - 1][col + 1],
                board[row - 2][col + 2],
                board[row - 3][col + 3]
            ])) {
                return true;
            }
        }
    }
    return false;
}
