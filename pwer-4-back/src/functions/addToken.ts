export function addToken(board: string[][], token: string, col: number): string[][] {
    const col_tmp: string[] = [...board[col]];

    if (!col_tmp.includes("N")) {
        throw new Error(`Not enough col: ${col}`);
    }

    for (let i: number = 0; i < col_tmp.length; i++) {
        if (i == col_tmp.length - 1) {
            col_tmp[i] = token;
            break;
        }
        if (col_tmp[i + 1] != "N") {
            col_tmp[i] = token;
            break;
        }
    }
    board[col] = col_tmp;
    return board;
}