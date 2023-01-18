<script setup lang="ts">
import {Store} from '@/store';
import {useRouter} from 'vue-router';
import {EventEmitter, EventName} from '@/event-emitter';
import {defaultLevels} from '@/game/levels/defaultLevels';
import {computed, onMounted, onUnmounted, ref} from 'vue';
import PhaserContainer from "@/components/PhaserContainer.vue";
import DirectionalButtonsComponent from '@/components/DirectionalButtons.vue';

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

const currentStoredLevel = Store.getInstance().getCurrentStoredLevel()!;
let currentLevelIndex = computed(() => currentStoredLevel.index + 1);
let currentLevel = computed(() => defaultLevels[currentStoredLevel.index]);
let smallScreenDisplay = ref(true);
let totalTime = ref(0);

let timer: number;

onMounted(() => {
  history.replaceState({urlPath: router.currentRoute.value.fullPath}, "", '/');
  const interval = 100;
  timer = setInterval(() => {
    totalTime.value += interval;
  }, interval);

  const container = document.getElementById('phaser-container')!;
  smallScreenDisplay.value = container.clientWidth <= 992 / 2; //half of bootstrap 'lg' breakpoint
});

onUnmounted(() => {
  clearInterval(timer);
});

</script>

<template>
  <div class="container game-view text-center px-0 mx-auto">
    <div class="row align-items-center mx-0" style="max-width: 100vw">
      <div class="col-12 pt-2 px-4" id="game-view-title-id" style="text-align: left">
        <h1 class="sokoban-display display-6 fw-normal" style="user-select: none">
          {{ currentLevelIndex }}: {{ currentLevel.title }}
        </h1>
      </div>
      <div class="col-12 px-4" id="game-view-time-id">
        <h3 style="text-align: left; font-family: 'Poppins', serif; font-size: 1.5em">
          {{ Math.trunc(totalTime / 1000) }}s
        </h3>
      </div>
      <div class="row mx-auto px-0">
        <div class="col-12 col-md-8 col-lg-12 px-0" id="phaser-container">
          <Suspense>
            <PhaserContainer :key="componentKey" :playable="true"/>
            <template #fallback>
              <div class="spinner-border text-info" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
            </template>
          </Suspense>
        </div>


        <div class="col-12 col-md-4 col-lg-12 pt-4 pt-md-0 px-1" id="game-view-buttons">
          <div class="row h-100 mx-2">
            <div class="col-12">
              <div class="row justify-content-center mt-2">
                <div class="col-auto col-lg-3 d-grid gap-1">
                  <button class="btn btn-primary sokoban-outlined-button"
                          @click="exitClick" type="button">
                    <span>
                      <i class="fa-solid fa-door-open"></i>
                    </span>
                    <span v-if="!smallScreenDisplay" class="mx-2">QUIT</span>
                  </button>
                </div>
                <div class="col-auto col-lg-3 d-grid gap-2">
                  <button class="btn btn-primary sokoban-outlined-button"
                          @click="resetClick" type="button">
                    <span>
                      <i class="fa-solid fa-circle-xmark"></i>
                    </span>
                    <span v-if="!smallScreenDisplay" class="mx-2">RESTART</span>
                  </button>
                </div>
                <div class="col-auto col-lg-3 d-grid gap-2">
                  <button class="btn btn-primary sokoban-call-for-action-button"
                          @click="undoClick"
                          type="button">
                    <span>
                      <i class="fa-solid fa-delete-left"></i>
                    </span>
                    <span v-if="!smallScreenDisplay" class="mx-2">UNDO</span>
                  </button>
                </div>
              </div>
            </div>
            <DirectionalButtonsComponent class="col-12 align-self-end mb-4" v-if="smallScreenDisplay"/>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>
