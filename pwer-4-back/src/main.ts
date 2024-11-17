import {Socket} from "socket.io";
import {GameInterface, GameInterfaces, GameState, PlayerSymbol} from "./types/GameInterface";
import {addToken} from "./functions/addToken";
import {check_win} from "./functions/check";

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors')
const app = express();
app.use(cors())

const server = http.createServer(app);
const io = new Server(server, {
    cors: {        
        origin: 'http://localhost:5173',
        methods: ['GET', 'POST'],
    }
});

let games: GameInterfaces = {};

function getGames(list: GameInterfaces) {
    if(list){
        return Object.values(list).filter(l => !l.isPrivate);
    }
    return games;
}

const DEFAULT_BOARD: string[][] = Array.from({ length: 6 }, () => Array(7).fill("N"));

io.on('connection', (socket: Socket) => {
    console.log('Un utilisateur est connecté :', socket.id);

    socket.on('disconnect', () => {
        console.log('Un utilisateur s\'est déconnecté :', socket.id);
        for (const [gameId, game] of Object.entries(games)){
            const playerIndex = game.players.findIndex(p => p.id == socket.id)
            if (playerIndex != -1) {
                game.players.splice(playerIndex);
                game.board = DEFAULT_BOARD;
                game.state = GameState.WAITING;
                io.emit('getGames',getGames(games));
            }
        }
    });

    socket.on('getGames', () => {
        io.emit('getGames',getGames(games));
    })

    socket.on('createGame', ({ gameId, isPrivate, name }: { gameId: string; isPrivate: boolean, name: string }) => {
        games[gameId] = { 
            gameId: gameId,
            creator: {
                id: socket.id,
                name
            },
            isPrivate: isPrivate,
            players: [],
            board: [...DEFAULT_BOARD],
            state: GameState.WAITING,
            currentPlayer: null
        } as GameInterface;
        socket.emit('gameCreated');
        io.emit('getGames', getGames(games))
    });


    socket.on('joinGame', ({gameId, name} : {gameId: string, name: string}) => {
        const game: GameInterface | undefined = games[gameId]
        if(!game){
            socket.emit('error', 'Game not found');
            return;
        }
        if (game.players.length < 2) {
            if(game.players[0] && game.players[0].name === name){
                socket.emit('error', 'L\'adversaires à le même nom que vous !');
                return;
            }
            if (game.players[0]){
                game.players[0].symbol = PlayerSymbol.O;
            }
            game.players.push({id: socket.id, name, symbol: PlayerSymbol.X});
            game.board = [...DEFAULT_BOARD];
            socket.join(gameId);
            if(game.players.length == 2){
                game.state = GameState.STARTED
                game.currentPlayer = game.players[0]
            }
            io.emit('getGames', getGames(games))
            io.to(gameId).emit('gameJoined', game);
        } else {
            socket.emit('error', 'Game full or not found');
        }
    });

    socket.on("quitGame",({gameId}: {gameId: string}) => {
        const game: GameInterface = games[gameId]
        const playerIndex: number = game.players.findIndex(p => p.id == socket.id)
        if(playerIndex != -1){
            game.players.splice(playerIndex, 1);
            game.board = [...DEFAULT_BOARD];
            game.state = GameState.WAITING;
            socket.leave(gameId);
            io.emit('getGames', getGames(games));
            io.to(gameId).emit('exitOpponent', game);
        }
    })

    socket.on('move', ({gameId, col}: {gameId: string, col: number}) => {
        const game = games[gameId];
        if(!game){
            socket.emit('error', 'Game non trouvé !');
            return;
        }
        if(!game.currentPlayer){
            socket.emit('error', 'Il n\'y a pas de tour !');
            return;
        }
        try{
            game.board = addToken(game.board, game.currentPlayer.symbol, col);
        }catch(e){
            socket.emit('error', 'Pas assez de case vide !');
            return;
        }
        if(check_win(game.board)){
            game.state = GameState.FINISHED;
        }else{
            game.currentPlayer = game.players.filter(p => p.id != socket.id)[0];
        }
        io.to(gameId).emit("ActuallyBoard", game)
        io.to(gameId).emit("finishGame", {game: game, winner: game.currentPlayer})
    })
});

server.listen(4000, () => console.log('Serveur WebSocket sur le port 4000'));
