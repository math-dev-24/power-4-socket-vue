<script setup lang="ts">
const props = defineProps<{
  board: string[][],
  colorUser: string
}>()

const emit = defineEmits<{
  (e: 'cellClicked', col: number): void
}>()

</script>

<template>
  <div class="board">
    <div v-for="(row, iRow) in props.board" :key="iRow" class="row">
      <div
          v-for="(cell, iCol) in row"
          :key="iCol"
          class="cell"
          :class="{
            'bg-red-500 text-red-500': cell == 'X',
            'bg-yellow-500 text-yellow-500': cell == 'O',
            'bg-gray-200 text-gray-200': cell == 'N',
            [props.colorUser]: cell != 'X' && cell != 'O'
          }"
          @click="emit('cellClicked', iRow)">
        {{ cell }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.board {
  display: flex;
  flex-wrap: wrap;
  margin: 0 auto;
}
.row {
  display: flex;
  flex-direction: column;
}
.cell {
  width: 50px;
  height: 50px;
  border: 1px solid #484848;
  cursor: pointer;
}
</style>