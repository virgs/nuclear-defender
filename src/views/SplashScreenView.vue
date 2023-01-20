<script setup lang="ts">
// script setup syntax or Composition API

import type {StoredLevel} from '@/store';
import {Store} from '@/store';
import {tns} from 'tiny-slider';
import {useRouter} from 'vue-router';
import {Tiles} from '@/game/tiles/tiles';
import {computed, onMounted, reactive} from "vue";
import {defaultLevels} from '@/game/levels/defaultLevels';
import {SokobanMapProcessor} from '@/game/tiles/sokoban-map-processor';
import SplashScreenAdvancedOptionsComponent from '@/components/SplashScreenAdvancedOptions.vue';
import {StandardSokobanAnnotationTranslator} from '@/game/tiles/standard-sokoban-annotation-translator';
import {Actions, mapStringToAction} from '@/game/constants/actions';

const router = useRouter();
//TODO get it from OptionsComponent
const furthestLevel = 20;//store.furthestEnabledLevel;

const data = reactive({
  currentSelectedIndex: 0, //furthestLevel
  playerActions: '',
  actionsLegentText: `
      <h5>Instructions</h5>
<ul>
<li>Each letter represents a player action</li>
</ul>

<h5>Actions list</h5>
<ul>
<li><b>l</b> go left</li>
<li><b>r</b> go right</li>
<li><b>u</b> go up</li>
<li><b>d</b> go down</li>
<li><b>s</b> do nothing</li>
</ul>`

});

const availableLevels = computed(() => defaultLevels
    .filter((level, index) => index <= furthestLevel));

const invalidPlayerActionsError = computed(() => {
  if (data.playerActions.length > 0) {
    const split = data.playerActions
        .split('');
    const invalidIndex = split
        .findIndex(char => mapStringToAction(char) === undefined);
    if (invalidIndex !== -1) {
      return `Invalide action found (${split[invalidIndex]}) at index ${invalidIndex}`
    }
  }
  return '';
});

function optionsChanged(valid: boolean) {
  console.log();
}

async function playButtonClick() {
  // const tileMap = this.make.tilemap({key: configuration.tiles.tilemapKey});
  // const extracted = new FileLevelExtractor().extractToTileCodeMap(tileMap); // from file
  //https://medium.com/@michaelwesthadley/modular-game-worlds-in-phaser-3-tilemaps-1-958fc7e6bbd6

  const store = Store.getInstance();
  const map = new StandardSokobanAnnotationTranslator()
      .translate(defaultLevels[data.currentSelectedIndex].map);
  const output = new SokobanMapProcessor(map)
      .strip([Tiles.hero, Tiles.box]);

  const newStoredLevel: StoredLevel = {
    bestTime: -1,
    playerActions: data.playerActions.split('').map(char => mapStringToAction(char) as Actions),
    dynamicFeatures: output.removedFeatures,
    index: data.currentSelectedIndex, //TODO add 1 here?
    level: defaultLevels[data.currentSelectedIndex],
    strippedLayeredTileMatrix: output.strippedLayeredTileMatrix
  };
  store.setCurrentStoredLevel(newStoredLevel);
  store.router = router;
  await router.push('/game');
}

function updateSelectedIndex(info: any) {
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
    prevButton: '#prevButton',
    nextButton: '#nextButton',
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
        <h1 class="sokoban-display display-3 fw-normal" style="user-select: none">CHERNOBYL DEFENDER</h1>
      </div>
      <div class="col-12">
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
            <h4 class="level-number">{{ index + 1 }}</h4>
            <img height="160" alt="" class="img-fluid" :src="defaultLevels[0].thumbnailPath">
          </div>
        </div>
        <h3 class="mt-2 level-title">{{ availableLevels[data.currentSelectedIndex].title }}</h3>
      </div>
      <div class="col-12">
        <label class="form-label sokoban-label">Player actions
          <a tabindex="0" class="btn btn-lg btn-danger px-1"
             role="button" data-bs-toggle="popover"
             style="background-color: transparent; border: none"
             title="Player actions"
             data-bs-trigger="focus"
             :data-bs-html="true"
             :data-bs-content="data.actionsLegentText">
            <i class="fa-regular fa-circle-question" style="color: var(--radioactive-color)"></i>
          </a>
        </label>
        <input type="text" class="form-control" placeholder="Player actions" aria-label="Insert player actions"
               :class="[invalidPlayerActionsError.length <= 0 ? 'is-valid' : 'is-invalid']"
               v-model="data.playerActions">
        <div class="form-label feedback-label invalid-feedback" style="position:absolute;">
          {{ invalidPlayerActionsError }}
        </div>
      </div>
      <div class="col-12">
        <SplashScreenAdvancedOptionsComponent @valid="optionsChanged"></SplashScreenAdvancedOptionsComponent>
      </div>
      <div class="col-12">
        <div class="d-grid">
          <button class="btn btn-primary"
                  style="background-color: var(--radioactive-color); color: var(--foreground-color); border-color: transparent"
                  @click="playButtonClick"
                  :disabled="invalidPlayerActionsError.length > 0"
                  type="button">Play
          </button>
        </div>
      </div>
    </div>
  </div>
</template>


<style>

.splash-view {
  min-height: 99vh;
  max-width: 720px;
  font-family: Martian Mono, monospace;
  background-image: url("radioactive-symbol3.jpg");
  background-repeat: no-repeat;
  background-position-x: center;
  background-position-y: top;
  background-attachment: fixed;
}


.level-number {
  text-transform: capitalize;
  font-weight: bolder;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1000;
  color: var(--background-color);
  text-shadow: 2px 2px 1px var(--radioactive-color);
}

.level-title {
  font-size: xx-large;
  font-weight: bolder;
  text-transform: capitalize;
  color: var(--background-color);
  text-shadow: 2px 2px 1px var(--radioactive-color);
}
</style>