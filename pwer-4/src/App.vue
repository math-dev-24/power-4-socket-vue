<template>
  <div>
    <h1 class="text-2xl font-bold text-center">Puissance 4</h1>
    <FormIn
        v-if="!inGame"
        v-model:userName="userName"
        v-model:tmpGameId="tmpGameId"
        v-model:privateGame="privateGame"
        @createGame="createGame"
    />

    <ul
        v-if="!inGame"
        class="container mx-auto border drop-shadow bg-white py-2 rounded-lg min-h-[300px] flex flex-col gap-2"
    >
      <li
          v-for="game in games"
          class="border rounded-lg p-4 mx-2 flex gap-4 text-sm md:text-base"
          :class="{'bg-slate-100': game.players.length === 2}"
      >
        <span class="flex-1">{{ game.gameId }} - {{ game.players.length }} / 2  - Créé par {{ game.creator.name }}</span>
        <button @click="joinGame(game.gameId)" :disabled="game.players.length === 2 || canJoin">Rejoindre</button>
      </li>
    </ul>

    <div v-if="inGame && actualGame" class="border container mx-auto rounded py-6 px-4 drop-shadow bg-slate-50 mt-10">
      <button @click="quitGame">Quitter la partie</button>
      <div class="flex items-center gap-1 mt-2 text-yellow-600">
        <span>Joueur 1 : </span>
        <span class="font-bold uppercase">{{ actualGame.players[0].name == userName ? "Moi" : actualGame.players[1].name }}</span>
      </div>
      <div v-if="actualGame.players.length === 2" class="flex items-center gap-1 text-red-700">
        <span>Joueur 2 : </span>
        <span class="font-bold uppercase">{{ actualGame.players[1].name == userName ? "Moi" : actualGame.players[0].name }}</span>
      </div>
      <div v-if="actualGame.state === GameState.STARTED && actualGame.currentPlayer" class="text-xl font-bold my-2">
        {{ actualGame.currentPlayer.name == userName ? "A ton tour !" : "attente de l'adversaire !" }}
      </div>
      <div v-if="actualGame.state === GameState.FINISHED">
        <span v-if="socket.id === actualGame.currentPlayer?.id" class="text-xl font-bold my-2">
          Vous avez gagné !
        </span>
        <span v-else class="text-xl font-bold my-2">
          Vous avez perdu !
        </span>
      </div>
      <Plateau
          :board="actualGame.board"
          :colorUser="colorUser"
          @cellClicked="cellClicked"
          v-if="actualGame.state === GameState.STARTED || actualGame.state === GameState.FINISHED"
      />
      <div v-else class="text-xl text-red-500 text-center my-14">
        Attente de l'adversaire !
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import {computed, onMounted, ref, watch} from "vue";
import socket from "./plugins/socket.ts"
import {GameInterface, GameState} from "./ts/types.ts";
import FormIn from "./components/FormIn.vue";
import Plateau from "./components/Plateau.vue";
import {useCookie} from "../hooks/cookie.ts";


const userName = ref<string>("")
const privateGame = ref<boolean>(false)

const games = ref<GameInterface[]>([])

const tmpGameId = ref<string>()
const inGame = ref<boolean>(false)
const actualGame = ref<GameInterface | null>(null)

const { getCookie, setCookie } = useCookie()


onMounted(() => {
  if (getCookie('playerName') !== ''){
    userName.value = getCookie('playerName')
  }
  socket.emit('getGames')
})

watch(userName, () => {
  setCookie('playerName', userName.value)
})

const colorUser = computed<string>(() => {
  if (actualGame.value){
    return userName.value === actualGame.value.players[0].name ? 'hover:bg-yellow-500 hover:text-yellow-500' : 'hover:bg-red-500 hover:text-red-500'
  }
  return ""
})


const canJoin = computed<boolean>(() => {
  return userName.value.length < 2
})

function createGame(){
  const id = Math.random().toString(36).substring(2, 5)
  const name: string = tmpGameId.value + id
  socket.emit('createGame', {gameId: name, isPrivate: privateGame.value, name: userName.value})
}

function joinGame(id: string){
  socket.emit('joinGame', {gameId: id, name: userName.value})
}

socket.on('gameCreated', () => {
  console.log("game created")
})

socket.on('gameJoined', (game) => {
  actualGame.value = game
  inGame.value = true
})

socket.on('getGames', (listGames) => {
  games.value = listGames
})
socket.on('error', (error) => {
  alert(error)
})
socket.on('startGame', (game) => {
  console.log(game)
  games.value.push(game)
})

function quitGame(){
  if(actualGame.value){
    socket.emit('quitGame', {gameId: actualGame.value.gameId})
    actualGame.value = null
    inGame.value = false
  }
}

socket.on('exitOpponent', (game: GameInterface) => {
  actualGame.value = game
  console.log(game)
  alert("Votre adversaire a quitté la partie")
})

socket.on('ActuallyBoard', (game: GameInterface) => {
  if(actualGame.value){
    console.log(game)
    actualGame.value = game
  }
})

function cellClicked(col: number){
  if(actualGame.value){
    const isOk: boolean = actualGame.value.currentPlayer?.id === socket.id
    if(isOk && actualGame.value.state !== GameState.FINISHED){
      socket.emit('move', {gameId: actualGame.value.gameId, col: col})
    }else{
      if(actualGame.value.state === GameState.FINISHED){
        alert("La partie est terminée !")
      }else {
        alert("Ce n'est pas ton tour !")
      }
    }
  }
}

</script>
