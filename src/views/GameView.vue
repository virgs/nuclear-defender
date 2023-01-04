<script setup lang="ts">
import {Store} from '@/store';
import {computed, onMounted, onUnmounted, ref} from 'vue';
import PhaserContainer from "@/components/PhaserContainer.vue";
import {levels} from '@/game/levels/levels';
import {useRouter} from 'vue-router';

const router = useRouter();

function resetClick() {
  console.log('restart');
}

function undoClick() {
  console.log('undo');
  Store.getInstance().update(4);
}

function exitClick() {
  console.log('exit');
}

let currentLevelIndex = computed(() => Store.getInstance().currentLevelIndex);
let currentLevel = computed(() => levels[Store.getInstance().currentLevelIndex]);
// const currentStoreLevelIndex = Store.getInstance().currentLevelIndex;
// console.log(currentStoreLevelIndex)
// console.log(currentLevel)
let totalTime = ref(0);
let timer: number;

onMounted(() => {
  history.replaceState({urlPath: router.currentRoute.value.fullPath}, "", '/');
  // console.log(Store.getInstance().currentLevelIndex)
  // console.log(levels[Store.getInstance().currentLevelIndex])
  const interval = 100;
  timer = setInterval(() => {
    totalTime.value += interval;
  }, interval);

  const container = document.getElementById('phaser-container')!;
  console.log(container.clientHeight, container.clientWidth);
    if (container.clientWidth > 992 / 2) { //hal of bootstrap 'lg' breakpoint
      console.log('no directional buttons');
    } else {
      console.log('add directional buttons');
    }
});

onUnmounted(() => {
  clearInterval(timer);
});

</script>

<template>
  <div class="container game-view text-center px-0 mx-auto">
    <div class="row align-items-center mx-0" style="max-width: 100vw">
      <div class="col-12 pt-2 px-4" style="text-align: left">
        <h1 class="sokoban-display display-6 fw-normal" style="user-select: none">
          {{ currentLevelIndex }}: {{ currentLevel.title }}
        </h1>
      </div>
      <div class="col-12 px-4">
        <h3 style="text-align: left; font-family: 'Poppins', serif; font-size: 1.5em">
          {{ Math.trunc(totalTime / 1000) }}s
        </h3>
      </div>
      <div class="row mx-auto px-0">
        <div class="col-12 col-md-8 col-lg-12 px-0" id="phaser-container">
          <Suspense>
            <PhaserContainer/>
            <template #fallback>
              <div class="spinner-border text-info" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
            </template>
          </Suspense>
        </div>


        <div class="col-12 col-md-4 col-lg-12 pt-4 pt-md-0 px-4" v-if="true">
          <div class="row justify-content-end">
            <div class="col-4 col-lg-1 d-grid gap-1">
              <button class="btn btn-primary sokoban-outlined-button"
                      @click="exitClick" type="button">
                <i class="fa-solid fa-right-from-bracket"></i>
              </button>
            </div>
            <div class="col-4 col-lg-1 d-grid gap-2">
              <button class="btn btn-primary sokoban-outlined-button"
                      @click="undoClick" type="button">
                <i class="fa-solid fa-arrow-left"></i>
              </button>
            </div>
            <div class="col-4 col-lg-1 d-grid gap-2">
              <button class="btn btn-primary sokoban-call-for-action-button"
                      @click="resetClick"
                      type="button">
                <i class="fa-solid fa-arrow-rotate-left"></i>
              </button>
            </div>
          </div>
        </div>


      </div>
    </div>
  </div>
</template>

<style scoped>
</style>
