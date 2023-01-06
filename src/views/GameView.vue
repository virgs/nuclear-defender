<script setup lang="ts">
import {Store} from '@/store';
import {computed, onMounted, onUnmounted, ref} from 'vue';
import PhaserContainer from "@/components/PhaserContainer.vue";
import {levels} from '@/game/levels/levels';
import {useRouter} from 'vue-router';
import {EventEmitter, EventName} from '@/event-emitter';

const router = useRouter();

function resetClick() {
  forceRerender();
  totalTime.value = 0;
}

function undoClick() {
  EventEmitter.emit(EventName.UNDO_BUTTON_CLICKED);
}

function exitClick() {
  router.push('/');
}

const componentKey = ref(0);
const forceRerender = () => {
  componentKey.value += 1;
};

let currentLevelIndex = computed(() => Store.getInstance().currentLevelIndex);
let currentLevel = computed(() => levels[Store.getInstance().currentLevelIndex]);
let directionalButtonsEnabled = ref(true);
let totalTime = ref(0);

let timer: number;

onMounted(() => {
  history.replaceState({urlPath: router.currentRoute.value.fullPath}, "", '/');
  const interval = 100;
  timer = setInterval(() => {
    totalTime.value += interval;
  }, interval);

  const container = document.getElementById('phaser-container')!;
  directionalButtonsEnabled.value = container.clientWidth <= 992 / 2; //half of bootstrap 'lg' breakpoint
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
            <PhaserContainer :key="componentKey"/>
            <template #fallback>
              <div class="spinner-border text-info" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
            </template>
          </Suspense>
        </div>


        <div class="col-12 col-md-4 col-lg-12 pt-4 pt-md-0 px-4">
          <div class="row justify-content-end">
            <div class="col-1" v-if="directionalButtonsEnabled">
              Directional buttons
            </div>
            <div class="w-100"></div>
            <div class="col-auto col-lg-1 d-grid gap-1">
              <button class="btn btn-primary sokoban-outlined-button"
                      @click="exitClick" type="button">
                <i class="fa-solid fa-right-from-bracket"></i>
              </button>
            </div>
            <div class="col-auto col-lg-1 d-grid gap-2">
              <button class="btn btn-primary sokoban-outlined-button"
                      @click="resetClick" type="button">
                <i class="fa-solid fa-arrow-left"></i>
              </button>
            </div>
            <div class="col-auto col-lg-1 d-grid gap-2">
              <button class="btn btn-primary sokoban-call-for-action-button"
                      @click="undoClick"
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
