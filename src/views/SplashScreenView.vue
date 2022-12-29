<script setup lang="ts">
// script setup syntax or Composition API

import {Store} from '@/store';
import {useRouter} from 'vue-router';
import {levels} from '@/game/levels/levels';
import {computed, onMounted, reactive} from "vue";
import SplashScreenAdvancedOptionsComponent from '@/components/SplashScreenAdvancedOptions.vue';
import {SokobanSolver} from '@/game/solver/sokoban-solver';
import {QuadracticEuclidianDistanceCalculator} from '@/game/math/quadractic-euclidian-distance-calculator';
import {StandardSokobanAnnotationMapper} from '@/game/tiles/standard-sokoban-annotation-mapper';
import {ManhattanDistanceCalculator} from '@/game/math/manhattan-distance-calculator';

const router = useRouter();

const data = reactive({
  currentSelectedIndex: 0
});

//TODO get it from OptionsComponent
const furthestLevel = 30;

const currentLevelName = computed(() => levels[data.currentSelectedIndex].title);
const availableLevels = computed(() => levels
    .filter((level, index) => index <= furthestLevel)
    .map(level => level.title));

function optionsChanged(valid: boolean) {
  console.log();
}

async function runSolutionsAlgorithm() {
  let solutionOutput: any = undefined;

  // for (let index = 1; index < levels.length - 1; ++index) {
let index = 4
    const codedMap: string = levels[index].map;
    const map = new StandardSokobanAnnotationMapper().map(codedMap);
    const solvers = new Map<string, SokobanSolver>();
    console.log('running algorithm for: ' + levels[index].title);
    solvers.set('QuadracticEuclidianDistanceCalculator 2500/50', new SokobanSolver({
      staticMap: map.staticMap, cpu: {sleepingCycle: 2500, sleepForInMs: 50},
      distanceCalculator: new QuadracticEuclidianDistanceCalculator()
    }));
    solvers.set('QuadracticEuclidianDistanceCalculator 3000/50', new SokobanSolver({
      staticMap: map.staticMap, cpu: {sleepingCycle: 3000, sleepForInMs: 40},
      distanceCalculator: new QuadracticEuclidianDistanceCalculator()
    }));
    solvers.set('ManhattanDistanceCalculator 2500/50', new SokobanSolver({
      staticMap: map.staticMap, cpu: {sleepingCycle: 2500, sleepForInMs: 50},
      distanceCalculator: new ManhattanDistanceCalculator()
    }));
    solvers.set('ManhattanDistanceCalculator 3000/40', new SokobanSolver({
      staticMap: map.staticMap, cpu: {sleepingCycle: 3000, sleepForInMs: 40},
      distanceCalculator: new ManhattanDistanceCalculator()
    }));
    solvers.forEach(async (solver, name) => {
      solutionOutput = await solver.solve(map.hero!, map.boxes);
      console.log(levels[index].title, name, solutionOutput);
    })
  // }
  return solutionOutput;
}

async function playButtonClick() {
  // const tileMap = this.make.tilemap({key: configuration.tiles.tilemapKey});
  // const extracted = new FileLevelExtractor().extractToTileCodeMap(tileMap); // from file
  //https://medium.com/@michaelwesthadley/modular-game-worlds-in-phaser-3-tilemaps-1-958fc7e6bbd6
  // const solutionOutput = await runSolutionsAlgorithm();

  const store = Store.getInstance();
  store.currentLevelIndex = data.currentSelectedIndex;
  store.map = levels[data.currentSelectedIndex].map;
  // store.solution = solutionOutput;

  await router.push('/game');
}

onMounted(() => {
  [...document.querySelectorAll('[data-bs-toggle="tooltip"]')]
      // @ts-ignore
      .map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
});

</script>

<template>
  <div class="container splash-view text-center pt-3 pt-lg-5">
    <div class="row row-cols-1 justify-content-center gy-3">
      <div class="col">
        <h1 class="sokoban-display display-2 fw-normal" style="user-select: none">Sokoban</h1>
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
                  style="background-color: var(--highlight-color); color: var(--foreground-color); border-color: transparent"
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
  background-color: var(--highlight-color);
  color: var(--foreground-color);
}
</style>