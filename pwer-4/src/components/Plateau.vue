<script setup lang="ts">
const props = defineProps<{
  board: string[][],
  colorUser: string
}>()

const emit = defineEmits<{
  (e: 'cellClicked', col: number): void
}>()

const getCellClass = (cell: string) => {
  if (cell === 'X') return 'cell-red'
  if (cell === 'O') return 'cell-yellow'
  return 'cell-empty'
}

</script>

<template>
  <div class="board">
    <div
        v-for="(row, iRow) in props.board"
        :key="iRow"
        class="row"
    >
      <div
          v-for="(cell, iCol) in row"
          :key="iCol"
          class="cell"
          :class="getCellClass(cell)"
          @click="emit('cellClicked', iRow)"
      >
        <div class="token" v-if="cell !== 'N'">
          <div class="token-inner"></div>
          <div class="token-shine"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.board {
  display: flex;
  border: 1px solid #484848;
  border-radius: 10px;
  flex-wrap: wrap;
  margin: 0 auto;
  padding: 10px;
}
.row {
  display: flex;
  flex-direction: column;
}
.cell {
  width: 60px;
  height: 60px;
  background: radial-gradient(circle at 30% 30%, #4a5568, #2d3748);
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow:
      inset 0 3px 8px rgba(0, 0, 0, 0.6),
      0 2px 6px rgba(0, 0, 0, 0.3);
  position: relative;
  transition: all 0.3s ease;
}

.cell:hover {
  box-shadow:
      inset 0 3px 8px rgba(0, 0, 0, 0.6),
      0 4px 12px rgba(52, 152, 219, 0.4);
}

.token {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  position: relative;
  animation: dropIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.token-inner {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  position: relative;
  z-index: 2;
}

.token-shine {
  position: absolute;
  top: 15%;
  left: 25%;
  width: 30%;
  height: 30%;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 50%;
  filter: blur(2px);
  z-index: 3;
}


.cell-red .token-inner {
  background: radial-gradient(circle at 30% 30%, #ff6b6b, #e63946);
  box-shadow:
      0 6px 12px rgba(231, 76, 60, 0.4),
      inset 0 2px 4px rgba(255, 255, 255, 0.3),
      inset 0 -2px 4px rgba(0, 0, 0, 0.3);
}

.cell-yellow .token-inner {
  background: radial-gradient(circle at 30% 30%, #ffd93d, #f39c12);
  box-shadow:
      0 6px 12px rgba(243, 156, 18, 0.4),
      inset 0 2px 4px rgba(255, 255, 255, 0.3),
      inset 0 -2px 4px rgba(0, 0, 0, 0.3);
}

.cell-empty {
  background: radial-gradient(circle at 30% 30%, #4a5568, #2d3748);
}

/* Animation pour les jetons qui tombent */
.cell-red .token,
.cell-yellow .token {
  animation: dropIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

/* Effet de survol pour les colonnes */
.column:hover .cell-empty {
  background: radial-gradient(circle at 30% 30%, #5a6c7d, #3d4f5f);
  box-shadow:
      inset 0 3px 8px rgba(0, 0, 0, 0.6),
      0 4px 12px rgba(52, 152, 219, 0.2);
}

/* Responsive design */
@media (max-width: 768px) {
  .cell {
    width: 45px;
    height: 45px;
  }

  .token {
    width: 38px;
    height: 38px;
  }

  .board {
    padding: 10px;
    gap: 6px;
  }
}
</style>