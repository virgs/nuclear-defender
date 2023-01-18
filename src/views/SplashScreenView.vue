<script setup lang="ts">
// script setup syntax or Composition API

import type {StoredLevel} from '@/store';
import {Store} from '@/store';
import {useRouter} from 'vue-router';
import type {Level} from '@/game/levels/defaultLevels';
import {defaultLevels} from '@/game/levels/defaultLevels';
import {computed, onMounted, reactive} from "vue";
import SplashScreenAdvancedOptionsComponent from '@/components/SplashScreenAdvancedOptions.vue';
import {SokobanSolver} from '@/game/solver/sokoban-solver';
import {ManhattanDistanceCalculator} from '@/game/math/manhattan-distance-calculator';
import {SokobanMapProcessor} from '@/game/tiles/sokoban-map-processor';
import {Tiles} from '@/game/tiles/tiles';
import {StandardSokobanAnnotationTranslator} from '@/game/tiles/standard-sokoban-annotation-translator';
import {Actions, mapActionToChar} from '@/game/constants/actions';
import {tns} from 'tiny-slider';

const router = useRouter();
//TODO get it from OptionsComponent
const furthestLevel = defaultLevels.length;//store.furthestEnabledLevel;

const data = reactive({
  currentSelectedIndex: 0//furthestLevel
});

const currentLevelName = computed(() => defaultLevels[data.currentSelectedIndex].title);
const availableLevels = computed(() => defaultLevels
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
              ?.map((action: Actions) => mapActionToChar(action))
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

  // const testMap = defaultLevels[0];

  const map = new StandardSokobanAnnotationTranslator()
      .translate(defaultLevels[data.currentSelectedIndex].map);
  const output = new SokobanMapProcessor(map)
      .strip([Tiles.hero, Tiles.box]);

  const newStoredLevel: StoredLevel = {
    bestTime: -1,
    dynamicFeatures: output.removedFeatures,
    index: data.currentSelectedIndex,
    level: defaultLevels[data.currentSelectedIndex],
    strippedLayeredTileMatrix: output.strippedLayeredTileMatrix
  };
  store.setCurrentStoredLevel(newStoredLevel);
  store.router = router;
  // store.solution = await runSolutionsAlgorithm([defaultLevels[data.currentSelectedIndex]]);
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

  //https://github.com/ganlanyuan/tiny-slider
  const slider = tns({
    container: '#carousel-slider',
    responsive: {
      '350': {
        edgePadding: 30,
        items: 1.5
      },
      '500': {
        items: 3.5
      }
    },
    controls: true,
    lazyload: true,
    gutter: 5,
    fixedWidth: 400,
    center: true,
    slideBy: 'page',
    autoplay: false,
    mouseDrag: true,
    swipeAngle: false,
    edgePadding: 10,
    speed: 400,
    startIndex: data.currentSelectedIndex,
    loop: false,
    arrowKeys: true,
    prevButton: '#prevButton',
    nextButton: '#nextButton',
    navContainer: "#carousel-thumbnails-container",
  });

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
        <ul class="carousel-controls" id="customize-controls" tabindex="0">
          <li class="prev" id="prevButton" tabindex="-1" data-controls="prev">
            <i class="fa-solid fa-chevron-left"></i>
          </li>
          <li class="next" id="nextButton" tabindex="-1" data-controls="next">
            <i class="fa-solid fa-chevron-right"></i>
          </li>
        </ul>

        <div id="carousel-slider">
<!--          TODO scale down when the index doesnt match the selected one and move down a bit (transitionX...)-->
          <div>
            <h3>{{defaultLevels[0].title}}</h3>
            <img class="img-fluid" :src="defaultLevels[0].thumbnailPath">
          </div>
          <div><img class="img-fluid" :src="defaultLevels[0].thumbnailPath">
          </div>
          <div><img class="img-fluid" :src="defaultLevels[0].thumbnailPath">
          </div>
          <div><img class="img-fluid" :src="defaultLevels[0].thumbnailPath">
          </div>
          <div><img class="img-fluid" :src="defaultLevels[0].thumbnailPath">
          </div>
        </div>
        <div>
          <ul class="carousel-thumbnail" id="carousel-thumbnails-container">
            <li data-nav="0" class="carousel-thumbnail" tabindex="-1">
              <img :src="defaultLevels[0].thumbnailPath">
            </li>
            <li data-nav="1" class="carousel-thumbnail" tabindex="-1">
              <img :src="defaultLevels[0].thumbnailPath">
            </li>
            <li data-nav="2" class="carousel-thumbnail" tabindex="-1">
              <img :src="defaultLevels[0].thumbnailPath">
            </li>
            <li data-nav="3" class="carousel-thumbnail" tabindex="-1">
              <img :src="defaultLevels[0].thumbnailPath">
            </li>
            <li data-nav="4" class="carousel-thumbnail" tabindex="-1">
              <img :src="defaultLevels[0].thumbnailPath">
            </li>
          </ul>
        </div>
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