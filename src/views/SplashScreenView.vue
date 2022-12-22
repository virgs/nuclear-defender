<script setup lang="ts">
import {Store} from '@/store';
import {useRouter} from 'vue-router';
import * as lzString from 'lz-string';
import {levels} from '@/game/levels/levels';
import {computed, onMounted, reactive, ref} from "vue";
import {Actions, mapStringToAction} from '@/game/constants/actions';

const router = useRouter();

const mapTooltipText = ref(
    `'-': empty<br>
' ': floor<br>
'#': wall<br>
'.': target<br>
'$': box<br>
'*': boxOnTarget<br>
'@': hero<br>
'+': heroOnTarget`);

const data = reactive({
  currentSelectedIndex: 10,
  levelPassword: '',
  validLevelPassword: false,
  codedMapText: '',
  moves: '',
  bestMoves: 0 //create from chrome.storage
});

const furthestLevel = 30;

const currentLevelName = computed(() => levels[data.currentSelectedIndex].title);
const availableLevels = computed(() => levels
    .filter((level, index) => index <= furthestLevel)
    .map(level => level.title));

const toastBodyTextName = computed(() => data.validLevelPassword ? 'Good job!' : 'Wrong level password. Try again.');
const toastStyle = computed(() => {
  return data.validLevelPassword ? {
    'background-color': 'var(--highlight-color)',
    'color': 'var(--foreground-color)'
  } : {
    'background-color': 'var(--danger-color)',
    'color': 'var(--background-color)'
  };
});

function parseMoves(compressedMoves: string): Actions[] | undefined {
  if (compressedMoves) {
    const movesText: string | null = lzString.decompressFromEncodedURIComponent(compressedMoves);
    if (movesText === null || movesText.length === 0) {
      return undefined;
    }
    return movesText.split('')
        .map(char => mapStringToAction(char));
  }
  return [];
}

function validateMap(map: string): boolean {
  //TODO create a specific class for that
  //TODO check if map is valid. number of heroes = 1, number of box = targets, if it's solvable?...

  return map.length > 0;

}

function playButtonClick() {
  let moves = parseMoves(data.moves);
  // if (moves === undefined) {
  // const alert = createAlert(`Invalid moves code`, true);
  // this.add.dom(configuration.gameWidth * 0.5, configuration.gameHeight * 0.15, alert)
  //     .setOrigin(0.5, 0.5);
  // } else {

  Store.setGameSceneConfiguration({
    bestMoves: data.bestMoves,
    currentLevel: data.currentSelectedIndex,
    map: levels[data.currentSelectedIndex].map,
    moves: moves,
    router: router
  });
  router.push('/game');
}

onMounted(() => {
  [...document.querySelectorAll('[data-bs-toggle="tooltip"]')]
      // @ts-ignore
      .map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));

  const toastTrigger = document.getElementById('toastBtn');
  const toastLiveExample = document.getElementById('toast');
  if (toastTrigger) {
    toastTrigger.addEventListener('click', () => {
      // @ts-ignore
      const toast = new bootstrap.Toast(toastLiveExample);

      toast.show();
    });
  }
});


</script>

<template>
  <div class="toast-container position-fixed top-0 end-0 p-3">
    <div id="toast" class="toast" role="alert"
         aria-live="assertive" aria-atomic="true" data-bs-delay="2500">
      <div class="d-flex" :style="toastStyle">
        <div class="toast-body">
          {{ toastBodyTextName }}
        </div>
        <button type="button" class="btn-close me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
    </div>
  </div>
  <div class="container splash-view text-center">
    <div class="row row-cols-1 justify-content-center gy-3">
      <div class="col">
        <h1 class="sokoban-display display-2 fw-normal" style="user-select: none">Sokoban</h1>
      </div>
      <div class="col">
        <label class="form-label sokoban-label">Check level password</label>
        <div class="input-group">
          <input type="text" class="form-control" placeholder="Level password" aria-label="Level password"
                 v-model="data.levelPassword">
          <button class="btn btn-outline-secondary" type="button" id="toastBtn"
                  style="background-color: var(--highlight-color)"
                  :disabled="data.levelPassword.length === 0">Check
          </button>
        </div>
      </div>
      <div class="col">
        <label class="form-label sokoban-label">Moves code</label>
        <input type="text" class="form-control" placeholder="Level password" aria-label="Moves code"
               v-model="data.moves">
      </div>
      <div class="col">
        <label class="form-label sokoban-label">
          Design your own map
          <i class="fa-regular fa-circle-question" data-bs-toggle="tooltip"
             data-bs-placement="right"
             data-bs-html="true"
             data-bs-custom-class="sokoban-tooltip"
             :data-bs-title="mapTooltipText"
          ></i>
        </label>
        <textarea class="form-control map-text-area" rows="10" v-model="data.codedMapText"></textarea>
      </div>
      <div class="w-100"></div>
      <div class="col">
        <span style="display: flex">
          <label class="form-label sokoban-label">Select your level</label>
        </span>
        <div class="dropdown" style="float: left">
          <button class="btn btn-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown"
                  style="background-color: var(--highlight-color); color: var(--foreground-color)"
                  aria-expanded="false">
            {{ currentLevelName }}
          </button>
          <ul class="dropdown-menu" style="max-height: 300px; overflow: scroll">
            <li v-for="(level, index) in availableLevels">
              <button class="dropdown-item" type="button" @click="data.currentSelectedIndex = index">
                {{ index }}: {{ level }}
              </button>
            </li>
          </ul>
        </div>
      </div>


      <div class="w-100"></div>
      <div class="col">
        <div class="d-grid">
          <button class="btn btn-primary"
                  style="background-color: var(--highlight-color); color: var(--foreground-color)"
                  @click="playButtonClick"
                  type="button">Play
          </button>
        </div>
      </div>
    </div>
  </div>
</template>


