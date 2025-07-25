<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
    <div class="max-w-4xl mx-auto">
      <!-- Header -->
      <header class="text-center mb-8">
        <h1 class="text-4xl font-light text-slate-800 mb-2">Puissance 4</h1>
        <div class="w-20 h-1 bg-blue-500 mx-auto rounded-full"></div>
      </header>

      <!-- Game Creation Form -->
      <div v-if="!inGame" class="mb-8">
        <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <FormIn
              v-model:userName="userName"
              v-model:tmpGameId="tmpGameId"
              v-model:privateGame="privateGame"
              @createGame="createGame"
          />
        </div>
      </div>

      <!-- Games List -->
      <div v-if="!inGame" class="mb-8">
        <h2 class="text-xl font-medium text-slate-700 mb-4">Parties disponibles</h2>
        <div class="space-y-3">
          <div
              v-for="game in games"
              :key="game.gameId"
              class="bg-white rounded-xl shadow-sm border border-slate-200 p-4 hover:shadow-md transition-shadow"
              :class="{'opacity-60': game.players.length === 2}"
          >
            <div class="flex items-center justify-between">
              <div class="flex-1">
                <div class="font-medium text-slate-800">{{ game.gameId }}</div>
                <div class="text-sm text-slate-500">
                  Créé par {{ game.creator.name }} • {{ game.players.length }}/2 joueurs
                </div>
              </div>
              <button
                  @click="joinGame(game.gameId)"
                  :disabled="game.players.length === 2 || canJoin"
                  class="px-4 py-2 rounded-lg font-medium transition-all
                       disabled:opacity-50 disabled:cursor-not-allowed
                       enabled:bg-blue-500 enabled:text-white enabled:hover:bg-blue-600"
              >
                {{ game.players.length === 2 ? 'Complet' : 'Rejoindre' }}
              </button>
            </div>
          </div>

          <div v-if="games.length === 0" class="text-center py-12 text-slate-500">
            <div class="text-6xl mb-4">🎮</div>
            <p>Aucune partie disponible</p>
            <p class="text-sm">Créez-en une nouvelle !</p>
          </div>
        </div>
      </div>

      <!-- Game Interface -->
      <div v-if="inGame && actualGame" class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <!-- Game Header -->
        <div class="bg-slate-50 px-6 py-4 border-b border-slate-200">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-6">
              <!-- Player 1 -->
              <div class="flex items-center space-x-2">
                <div class="w-4 h-4 bg-yellow-400 rounded-full"></div>
                <span class="font-medium text-slate-700">
                  {{ actualGame.players[0].name === userName ? 'Vous' : actualGame.players[0].name }}
                </span>
              </div>

              <!-- VS -->
              <span class="text-slate-400 font-light">vs</span>

              <!-- Player 2 -->
              <div v-if="actualGame.players.length === 2" class="flex items-center space-x-2">
                <div class="w-4 h-4 bg-red-500 rounded-full"></div>
                <span class="font-medium text-slate-700">
                  {{ actualGame.players[1].name === userName ? 'Vous' : actualGame.players[1].name }}
                </span>
              </div>
              <div v-else class="flex items-center space-x-2 opacity-50">
                <div class="w-4 h-4 bg-gray-300 rounded-full"></div>
                <span class="text-slate-400">En attente...</span>
              </div>
            </div>

            <button
                @click="quitGame"
                class="px-3 py-1.5 text-sm hover:text-red-600 hover:bg-red-50 rounded-lg transition-all text-white"
            >
              Quitter
            </button>
          </div>
        </div>

        <!-- Game Status -->
        <div class="px-6 py-4">
          <div v-if="actualGame.state === GameState.STARTED && actualGame.currentPlayer"
               class="text-center">
            <div class="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium"
                 :class="actualGame.currentPlayer.name === userName
                   ? 'bg-green-100 text-green-800'
                   : 'bg-orange-100 text-orange-800'">
              {{ actualGame.currentPlayer.name === userName ? '🎯 À votre tour' : '⏳ Tour de l\'adversaire' }}
            </div>
          </div>

          <div v-if="actualGame.state === GameState.FINISHED" class="text-center">
            <div class="inline-flex items-center px-6 py-3 rounded-full text-lg font-medium"
                 :class="socket.id === actualGame.currentPlayer?.id
                   ? 'bg-green-100 text-green-800'
                   : 'bg-red-100 text-red-800'">
              {{ socket.id === actualGame.currentPlayer?.id ? '🎉 Victoire !' : '😔 Défaite' }}
            </div>
          </div>
        </div>

        <!-- Game Board -->
        <div class="px-6 pb-6">
          <div v-if="actualGame.state === GameState.STARTED || actualGame.state === GameState.FINISHED">
            <Plateau
                :board="actualGame.board"
                :colorUser="colorUser"
                @cellClicked="cellClicked"
            />
          </div>

          <div v-else class="text-center py-16">
            <div class="text-4xl mb-4">⏳</div>
            <p class="text-slate-600 text-lg">En attente de l'adversaire</p>
            <p class="text-slate-400 text-sm mt-2">La partie commencera dès qu'un joueur rejoindra</p>
          </div>
        </div>
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
    return userName.value === actualGame.value.players[0].name
        ? 'hover:bg-yellow-500 hover:text-yellow-500'
        : 'hover:bg-red-500 hover:text-red-500'
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

function quitGame(){
  if(actualGame.value){
    socket.emit('quitGame', {gameId: actualGame.value.gameId})
    actualGame.value = null
    inGame.value = false
  }
}

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

// Socket listeners
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
</script>