export interface GameInterface {
    gameId: string,
    creator: Partial<Player>,
    isPrivate: boolean,
    players: Player[],
    board: string[][],
    state: GameState,
    currentPlayer: Player | null
}

export interface Player {
    id: string,
    name: string,
    symbol: PlayerSymbol
}

export type GameInterfaces = Record<string, GameInterface>

export enum PlayerSymbol {
    X = "X",
    O = "O"
}

export enum GameState {
    WAITING = "WAITING",
    STARTED = "STARTED",
    FINISHED = "FINISHED"
}