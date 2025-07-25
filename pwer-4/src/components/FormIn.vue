<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="text-center mb-6">
      <h2 class="text-2xl font-light text-slate-800">Nouvelle partie</h2>
    </div>

    <!-- Form -->
    <div class="space-y-5">
      <!-- Username Field -->
      <div class="space-y-2">
        <label class="block text-sm font-medium text-slate-700">
          Nom d'utilisateur
          <span class="text-red-400 ml-1">*</span>
        </label>
        <input
            type="text"
            v-model="userName"
            placeholder="Entrez votre nom"
            class="w-full px-4 py-3 rounded-xl border border-slate-200
                 focus:border-blue-400 focus:ring-4 focus:ring-blue-50
                 transition-all duration-200 outline-none
                 placeholder:text-slate-400"
        />
        <p v-if="userName && userName.length < 2"
           class="text-xs text-amber-600 flex items-center gap-1">
          <span>⚠️</span>
          Le nom doit contenir au moins 2 caractères
        </p>
      </div>

      <!-- Game Name Field -->
      <div class="space-y-2">
        <label class="block text-sm font-medium text-slate-700">
          Nom de la partie
          <span class="text-red-400 ml-1">*</span>
        </label>
        <input
            type="text"
            v-model="tmpGameId"
            placeholder="ex: Partie du vendredi"
            class="w-full px-4 py-3 rounded-xl border border-slate-200
                 focus:border-blue-400 focus:ring-4 focus:ring-blue-50
                 transition-all duration-200 outline-none
                 placeholder:text-slate-400"
        />
      </div>

      <!-- Private Game Toggle -->
      <div class="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
        <div class="flex-1">
          <h3 class="text-sm font-medium text-slate-700">Partie privée</h3>
          <p class="text-xs text-slate-500 mt-1">
            Seuls les joueurs avec le lien pourront rejoindre
          </p>
        </div>
        <label class="relative inline-flex items-center cursor-pointer">
          <input
              type="checkbox"
              v-model="privateGame"
              class="sr-only peer"
          />
          <div class="relative w-11 h-6 bg-slate-300 rounded-full peer
                      peer-focus:ring-4 peer-focus:ring-blue-100
                      peer-checked:after:translate-x-full peer-checked:after:border-white
                      after:content-[''] after:absolute after:top-0.5 after:left-[2px]
                      after:bg-white after:rounded-full after:h-5 after:w-5
                      after:transition-all peer-checked:bg-blue-500">
          </div>
        </label>
      </div>
    </div>

    <!-- Action Button -->
    <div class="pt-4">
      <button
          @click="createGame"
          :disabled="!canCreateGame"
          class="w-full py-3.5 px-6 rounded-xl font-medium text-white
               transition-all duration-200 transform
               disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
               enabled:bg-gradient-to-r enabled:from-blue-500 enabled:to-blue-600
               enabled:hover:from-blue-600 enabled:hover:to-blue-700
               enabled:hover:scale-[1.02] enabled:hover:shadow-lg
               enabled:active:scale-[0.98]"
      >
        <span v-if="canCreateGame" class="flex items-center justify-center gap-2">
          <span>🎮</span>
          Créer la partie
        </span>
        <span v-else class="flex items-center justify-center gap-2">
          <span>📝</span>
          Remplissez tous les champs
        </span>
      </button>
    </div>

    <!-- Help Text -->
    <div class="text-center">
      <p class="text-xs text-slate-400">
        Une fois créée, votre partie apparaîtra dans la liste des parties disponibles
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const userName = defineModel<string>('userName')
const tmpGameId = defineModel<string>('tmpGameId')
const privateGame = defineModel<boolean>('privateGame')

const emit = defineEmits<{
  (e: 'createGame'): void
}>()

const canCreateGame = computed(() => {
  return userName.value &&
      userName.value.length >= 2 &&
      tmpGameId.value &&
      tmpGameId.value.trim().length > 0
})

function createGame() {
  if (canCreateGame.value) {
    emit('createGame')
  }
}
</script>