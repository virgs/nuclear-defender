<script setup lang="ts">
import {Store} from '@/store';
import {computed, onMounted, onUnmounted, ref} from 'vue';
import PhaserContainer from "@/components/PhaserContainer.vue";
import {levels} from '@/game/levels/levels';

function resetClick() {
  console.log('restart');
}

function undoClick() {
  console.log('undo');
  Store.getInstance().update(4);
}

let currentLevelIndex = computed(() => Store.getInstance().currentLevelIndex);
let currentLevel = computed(() => levels[Store.getInstance().currentLevelIndex]);
// const currentStoreLevelIndex = Store.getInstance().currentLevelIndex;
// console.log(currentStoreLevelIndex)
// console.log(currentLevel)
let totalTime = ref(0);
let timer: number;
onMounted(() => {
  // console.log(Store.getInstance().currentLevelIndex)
  // console.log(levels[Store.getInstance().currentLevelIndex])
  const interval = 100;
  timer = setInterval(() => {
    totalTime.value += interval;
  }, interval);
});

onUnmounted(() => {
  clearInterval(timer);
});

</script>

<template>
  <div class="container game-view text-center mt-4 px-0">
    <div class="row align-items-center">
      <div class="col-12 my-1">
        <div class="row align-items-end">
          <div class="col-9" style="text-align: left">
            <h1 class="sokoban-display display-6 fw-normal" style="user-select: none">
              Level {{ currentLevelIndex }}: {{ currentLevel.title }}
            </h1>
          </div>
          <div class="col-3">
            <h3 style="text-align: right; font-family: 'Poppins', serif">
              {{ totalTime / 1000 }}s
            </h3>
          </div>
        </div>
      </div>
      <div class="col-12 my-4">
        <div class="row my-4 justify-content-end">
          <div class="col-2 d-grid gap-2">
            <button class="btn btn-primary sokoban-outlined-button"
                    @click="undoClick" type="button">
              <i class="fa-solid fa-arrow-left"></i>
            </button>
          </div>
          <div class="col-2 d-grid gap-2">
            <button class="btn btn-primary sokoban-call-for-action-button"
                    @click="resetClick"
                    type="button">
              <i class="fa-solid fa-arrow-rotate-left"></i>
            </button>
          </div>
        </div>
      </div>
      <div class="col-12">
        <Suspense>
          <PhaserContainer/>
          <template #fallback>
            <div class="spinner-border text-info" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
          </template>
        </Suspense>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>
