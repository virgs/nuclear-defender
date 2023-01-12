<script setup lang="ts">
// script setup syntax or Composition API

import {Store} from '@/store';
import {useRouter} from 'vue-router';
import type {Level} from '@/game/levels/levels';
import {levels} from '@/game/levels/levels';
import {computed, onMounted, reactive} from "vue";
import SplashScreenAdvancedOptionsComponent from '@/components/SplashScreenAdvancedOptions.vue';
import {SokobanSolver} from '@/game/solver/sokoban-solver';
import {ManhattanDistanceCalculator} from '@/game/math/manhattan-distance-calculator';
import {SokobanMapProcessor} from '@/game/tiles/sokoban-map-processor';
import {Tiles} from '@/game/tiles/tiles';
import {StandardSokobanAnnotationTranslator} from '@/game/tiles/standard-sokoban-annotation-translator';
import {Actions, mapActionToString} from '@/game/constants/actions';

const router = useRouter();
//TODO get it from OptionsComponent
const store = Store.getInstance();
const furthestLevel = levels.length;//store.furthestEnabledLevel;
store.movesCode = '';

const data = reactive({
  currentSelectedIndex: 0//furthestLevel
});

const currentLevelName = computed(() => levels[data.currentSelectedIndex].title);
const availableLevels = computed(() => levels
    .filter((level, index) => index <= furthestLevel)
    .map(level => level.title));

function optionsChanged(valid: boolean) {
  console.log();
}

async function runSolutionsAlgorithm(levelsToSolve: Level[]) {
  let solutionOutput: any = undefined;

  console.log('running algorithms');
  let solutions: any[] = [];
  await Promise.all(levelsToSolve
      .map(async level => {
        console.log(level.title);
        const map = new StandardSokobanAnnotationTranslator()
            .translate(level.map);
        const output = new SokobanMapProcessor(map)
            .strip([Tiles.hero, Tiles.box]);

        const solver = new SokobanSolver({
          strippedMap: output.strippedLayeredTileMatrix,
          staticFeatures: output.pointMap,
          cpu: {
            sleepingCycle: 5000,
            sleepForInMs: 25
          },
          distanceCalculator: new ManhattanDistanceCalculator()
        });

        solutionOutput = await solver.solve(output.removedFeatures);
        const data = {
          title: level.title,
          map: level.map.replace(/\n/g, '\n'),
          ...solutionOutput,
          actions: solutionOutput.actions
              ?.map((action: Actions) => mapActionToString(action))
              .join('')
        };
        solutions.push(data);
        console.log(data);

      }));
  console.log('saving file');
  const file = new Blob([JSON.stringify(solutions)], {type: 'text/plain'});

  const a = document.createElement("a"),
      url = URL.createObjectURL(file);
  a.href = url;
  a.download = 'sokoban-levels-solutions.json';
  document.body.appendChild(a);
  console.log(solutions);
  // a.click();
  setTimeout(function () {
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }, 0);

  return solutionOutput;
}

async function playButtonClick() {
  // const tileMap = this.make.tilemap({key: configuration.tiles.tilemapKey});
  // const extracted = new FileLevelExtractor().extractToTileCodeMap(tileMap); // from file
  //https://medium.com/@michaelwesthadley/modular-game-worlds-in-phaser-3-tilemaps-1-958fc7e6bbd6

  const store = Store.getInstance();

  const map = new StandardSokobanAnnotationTranslator()
      .translate(levels[data.currentSelectedIndex].map);
  const output = new SokobanMapProcessor(map)
      .strip([Tiles.hero, Tiles.box]);

  store.currentLevelIndex = data.currentSelectedIndex;
  store.strippedLayeredTileMatrix = output.strippedLayeredTileMatrix;
  store.features = output.removedFeatures;
  store.router = router;
  // store.solution = await runSolutionsAlgorithm([levels[data.currentSelectedIndex]]);
  //     .filter((_, index) => index > 0) //skip test level
  // .filter((_, index) => index > 4) //skip first 4 levels
  // .filter((_, index) => index < 5) //only first n levels

  // store.solution = {
  //   boxesLine: 0, featureUsed: 0,
  //   actions: [Actions.STAND, Actions.STAND,
  //     Actions.STAND, Actions.STAND,
  //     Actions.STAND, Actions.STAND,
  //     Actions.STAND, Actions.STAND,
  //     Actions.STAND, Actions.STAND,
  //     Actions.STAND, Actions.STAND,
  //     Actions.STAND, Actions.STAND,
  //     Actions.STAND, Actions.STAND,
  //     Actions.STAND, Actions.STAND,
  //     Actions.STAND, Actions.STAND,
  //     Actions.STAND, Actions.UP, Actions.LEFT], iterations: 0, totalTime: 0
  //
  // };

  await router.push('/game');
}

onMounted(() => {
  [...document.querySelectorAll('[data-bs-toggle="tooltip"]')]
      // @ts-ignore
      .map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
  history.replaceState({urlPath: router.currentRoute.value.fullPath}, "", '/');
});

</script>

<template>
  <div class="container splash-view text-center pt-3 pt-lg-5">
    <div class="row row-cols-1 justify-content-center gy-3">
      <div class="col">
        <h1 class="sokoban-display display-2 fw-normal" style="user-select: none">SOKOBAN</h1>
      </div>
      <div class="col">
        <span style="display: flex">
          <label class="form-label sokoban-label">Select your level</label>
        </span>
        <div class="dropdown" style="float: left">
          <button class="btn btn-secondary dropdown-toggle advanved-options-button" type="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false">
            {{ data.currentSelectedIndex + 1 }}: {{ currentLevelName }}
          </button>
          <ul class="dropdown-menu" style="max-height: 300px; overflow: scroll">
            <li v-for="(level, index) in availableLevels">
              <button class="dropdown-item" type="button" @click="data.currentSelectedIndex = index">
                {{ index + 1 }}: {{ level }}
              </button>
            </li>
          </ul>
        </div>
      </div>
      <div class="col">
        <SplashScreenAdvancedOptionsComponent @valid="optionsChanged"></SplashScreenAdvancedOptionsComponent>
      </div>
      <div class="col">
        <div class="d-grid">
          <button class="btn btn-primary"
                  style="background-color: var(--radioactive-color); color: var(--foreground-color); border-color: transparent"
                  @click="playButtonClick"
                  type="button">Play
          </button>
        </div>
      </div>
    </div>
  </div>
</template>


<style scoped>
.advanved-options-button {
  background-color: var(--radioactive-color);
  color: var(--foreground-color);
}
</style>