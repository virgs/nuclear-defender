<script setup lang="ts">
import {Store} from '@/store';
import {onMounted, onUnmounted, ref} from 'vue';
import PhaserContainer from "@/components/PhaserContainer.vue";

function restartClick() {
  console.log('restart');
}

function undoClick() {
  console.log('undo');
  Store.getInstance().update(4);
}

let totalTime = ref(0);
let timer: number;
onMounted(() => {
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
  <div class="container game-view text-center mt-4">
    <div class="row align-items-center">
      <div class="col-12">
        <h3 style="text-align: left; font-family: 'Poppins', serif">
          Time: {{ totalTime / 1000 }}s
        </h3>
      </div>
      <div class="col">
        <Suspense>
          <PhaserContainer/>
          <template #fallback>
            <div class="spinner-border text-info" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
          </template>
        </Suspense>
      </div>
      <div class="col-12 my-4">
        <div class="row my-4 justify-content-evenly">
          <div class="col-3 d-grid gap-2">
            <button class="btn btn-primary sokoban-outlined-button"
                    @click="undoClick" type="button">
              <i class="fa-solid fa-arrow-left"></i>
            </button>
          </div>
          <div class="col-3 d-grid gap-2">
            <button class="btn btn-primary sokoban-call-for-action-button"
                    @click="restartClick"
                    type="button">
              <i class="fa-solid fa-arrow-rotate-left"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>
