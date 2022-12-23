<script setup lang="ts">
import {computed, onMounted} from 'vue';
import {Store} from '@/store';
import {levels} from '@/game/levels/levels';
import {Actions, mapActionToString} from '@/game/constants/actions';
import * as lzString from 'lz-string';

const currentLevel = computed(() => {
  return {
    index: Store.getInstance().currentLevelIndex,
    title: levels[Store.getInstance().currentLevelIndex]
  };
});

const codedMoves = computed(() => {
  const mapText = [Actions.RIGHT, Actions.LEFT, Actions.RIGHT, Actions.LEFT].map(action => mapActionToString(action)).join('');
  return lzString.compressToEncodedURIComponent(mapText);
});

async function copyMovesCode() {
  await navigator.clipboard.writeText(codedMoves.value);
}

async function retry() {
  console.log('retry');
}

async function nextLevel() {
  console.log('nextLevel');
}

onMounted(() => {
  const toastTrigger = document.getElementById('toastBtn');
  const toastLiveExample = document.getElementById('copy-toast');
  if (toastTrigger) {
    // @ts-ignore
    toastTrigger.addEventListener('click', () => new bootstrap.Toast(toastLiveExample).show());
  }
});

</script>

<template>
  <main>
    <div class="toast-container position-fixed top-0 end-0 pt-3">
      <div id="copy-toast" class="toast" role="alert" style="background-color: transparent"
           aria-live="assertive" aria-atomic="true" data-bs-delay="2500">
        <div class="d-flex sokoban-toast">
          <div class="toast-body">
            Moves code copied to clipboard
          </div>
          <button type="button" class="btn-close me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
      </div>
    </div>

    <div class="container my-5 splash-view text-center">
      <div class="row row-cols-1 justify-content-center gy-3">
        <div class="col">
          <h1 class="sokoban-display display-2 fw-normal" style="user-select: none">Level
            '{{ currentLevel.index }}: {{ currentLevel.title }}'
            complete!</h1>
        </div>
        <div class="col">
          <h4 class="sokoban-display fw-normal"
              style="user-select: none; color: var(--background-color); text-align: right">Total time:
            {{ '10' }}s
          </h4>
        </div>
        <div class="col">
          <label class="form-label sokoban-label">Moves code</label>
          <div class="input-group">
            <input type="text" class="form-control" aria-label="Level password" readonly
                   :value="codedMoves">
            <button class="btn btn-outline-secondary" type="button" id="toastBtn"
                    style="background-color: var(--highlight-color)" @click="copyMovesCode">
              Copy
            </button>
          </div>
        </div>
        <div class="col my-5">
          <div class="row my-2 justify-content-center">
            <div class="col-9 col-lg-3 d-grid gap-2 my-2">
              <button class="btn btn-primary sokoban-outlined-button"
                      @change="retry"
                      type="button">
                <i class="fa-solid fa-arrow-rotate-left"></i>
                Retry
              </button>
            </div>
            <div class="col-12 col-lg-9 d-grid gap-2 my-2">
              <button class="btn btn-primary sokoban-call-for-action-button"
                      @change="nextLevel"
                      type="button">
                <i class="fa-solid fa-forward"></i>
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>

</style>