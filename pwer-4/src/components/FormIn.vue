<template>
  <section class="container border rounded-lg p-4 m-4 space-y-4 mx-auto">
    <h1 class="text-xl font-bold">Créer une partie</h1>
    <div class="grid grid-cols-1 gap-1">
      <span>Nom d'utilisateur :<span class="text-red-500">*</span></span>
      <input type="text" v-model="userName" />
    </div>
    <div class="grid grid-cols-1 gap-1">
      <span>Nom de la partie :<span class="text-red-500">*</span></span>
      <input type="text" v-model="tmpGameId" />
      <input type="checkbox" v-model="privateGame" />
      <button v-if="userName" @click="createGame" :disabled="!tmpGameId || userName.length < 2">Créer</button>
    </div>
  </section>


</template>
<script setup lang="ts">

const userName = defineModel<string>('userName')
const tmpGameId = defineModel<string>('tmpGameId')
const privateGame = defineModel<boolean>('privateGame')

function createGame() {
  emit('createGame')
}

const emit = defineEmits<{
  (e: 'createGame'): void
}>()
</script>