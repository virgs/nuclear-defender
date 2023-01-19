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
const furthestLevel = 10;//store.furthestEnabledLevel;

const data = reactive({
  currentSelectedIndex: 0//furthestLevel
});

const availableLevels = computed(() => defaultLevels
    .filter((level, index) => index <= furthestLevel));

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

function updateSelectedIndex (info: any) {
  data.currentSelectedIndex = info.index;
}

onMounted(() => {

  //https://github.com/ganlanyuan/tiny-slider
  const slider = tns({
    container: '#carousel-slider',
    items: 3,
    controls: true,
    lazyload: true,
    gutter: 0,
    center: true,
    slideBy: 1,
    autoplay: false,
    mouseDrag: true,
    swipeAngle: false,
    edgePadding: 10,
    speed: 400,
    startIndex: data.currentSelectedIndex,
    loop: false,
    // arrowKeys: false,
    prevButton: '#prevButton',
    nextButton: '#nextButton',
    // navContainer: "#carousel-thumbnails-container",
    // navAsThumbnails: true
    // navContainer: false,
    // navAsThumbnails: false,
    nav: false
  });

// bind function to event
  slider.events.on('indexChanged', updateSelectedIndex);

  [...document.querySelectorAll('[data-bs-toggle="tooltip"]')]
      // @ts-ignore
      .map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
  history.replaceState({urlPath: router.currentRoute.value.fullPath}, "", '/');
});

</script>

<template>
  <div class="container splash-view text-center pt-3">
    <div class="row row-cols-1 justify-content-center gy-3">
      <div class="col">
        <h1 class="sokoban-display display-2 fw-normal" style="user-select: none">SOKOBAN</h1>
      </div>
      <div class="col">
        <span style="display: flex;">
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
        <div id="carousel-slider" style=" max-height: 200px">
          <div v-for="(item, index) in availableLevels"
               :class="[index === data.currentSelectedIndex ? 'selected-slider' : '', 'tns-item']">
            <h4 class="level-number">{{ index + 1}}</h4>
            <img alt="" class="img-fluid" :src="defaultLevels[0].thumbnailPath">
          </div>
        </div>
        <h3 class="mt-2" style="text-transform: capitalize">{{availableLevels[data.currentSelectedIndex].title}}</h3>
<!--        <div>-->
<!--          <ul class="carousel-thumbnail" id="carousel-thumbnails-container">-->
<!--            <li v-for="(item, index) in availableLevels"-->
<!--                v-show="index > data.currentSelectedIndex - 2 && index < data.currentSelectedIndex + 2"-->
<!--                :data-nav="index"-->
<!--                class="carousel-thumbnail"-->
<!--                tabindex="-1">-->
<!--              <img alt="" class="img-fluid" :src="defaultLevels[0].thumbnailPath">-->
<!--            </li>-->
<!--          </ul>-->
<!--        </div>-->
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

.level-number {
  text-transform: capitalize;
  font-weight: bolder;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1000;
}
</style>