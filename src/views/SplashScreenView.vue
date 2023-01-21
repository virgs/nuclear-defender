<script lang="ts">
// script setup syntax or Composition API
// options API

import type {StoredLevel} from '@/store';
import {Store} from '@/store';
import {defineComponent} from 'vue';
import {useRouter} from 'vue-router';
import {Tiles} from '@/game/tiles/tiles';
import type {Level} from '@/game/levels/defaultLevels';
import {defaultLevels} from '@/game/levels/defaultLevels';
import CarouselSlider from '@/components/CarouselSlider.vue';
import {Actions, mapStringToAction} from '@/game/constants/actions';
import {SokobanMapProcessor} from '@/game/tiles/sokoban-map-processor';
import SplashScreenAdvancedOptions from '@/components/SplashScreenAdvancedOptions.vue';
import {StandardSokobanAnnotationTranslator} from '@/game/tiles/standard-sokoban-annotation-translator';
import DirectionalButtonsComponent from '@/components/DirectionalButtons.vue';

export default defineComponent({
  name: "NextLevelView",
  components: {CarouselSlider, DirectionalButtonsComponent, SplashScreenAdvancedOptions},
  data() {
    const store = Store.getInstance();
    const furthestAvailableLevel = store.getFurthestAvailableLevel();
    const currentSelectedIndex = Math.min(store.getCurrentSelectedIndex(), furthestAvailableLevel);
    store.setCurrentSelectedIndex(currentSelectedIndex);

    return {
      router: useRouter(),
      furthestLevel: furthestAvailableLevel,
      currentSelectedIndex: currentSelectedIndex,
      playerActions: '',
      carouselSliderRefreshKey: 0,
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
    };
  },
  mounted() {
    history.replaceState({urlPath: this.router.currentRoute.fullPath}, "", '/');
  },
  computed: {
    availableLevels(): Level[] {
      return defaultLevels
          .filter((level, index) => index <= this.furthestLevel)
          .map((level, index) => ({...level, displayIndex: index + 1}));
    },
    invalidPlayerActionsError(): string {
      if (this.playerActions.length > 0) {
        const split = this.playerActions
            .split('');
        const invalidIndex = split
            .findIndex(char => mapStringToAction(char) === undefined);
        if (invalidIndex !== -1) {
          return `Invalide action found (${split[invalidIndex]}) at index ${invalidIndex}`;
        }
      }
      return '';
    }
  },
  methods: {
    indexChanged(currentIndex: number) {
      this.currentSelectedIndex = currentIndex;
      Store.getInstance().setCurrentSelectedIndex(currentIndex);
    },
    passwordUnblockedNewLevels(newLevelIndex: number) {
      console.log('password checked');
      this.furthestLevel = newLevelIndex;
      this.currentSelectedIndex = newLevelIndex - 2;
      Store.getInstance().setCurrentSelectedIndex(this.currentSelectedIndex);
      Store.getInstance().setFurthestEnabledLevel(newLevelIndex);
      ++this.carouselSliderRefreshKey;
    },
    playButtonClick() {
      // const tileMap = this.make.tilemap({key: configuration.tiles.tilemapKey});
      // const extracted = new FileLevelExtractor().extractToTileCodeMap(tileMap); // from file
      //https://medium.com/@michaelwesthadley/modular-game-worlds-in-phaser-3-tilemaps-1-958fc7e6bbd6

      const store = Store.getInstance();
      const currentLevel: any = this.availableLevels[this.currentSelectedIndex];
      const map = new StandardSokobanAnnotationTranslator()
          .translate(currentLevel.map);
      const output = new SokobanMapProcessor(map)
          .strip([Tiles.hero, Tiles.box]);

      const newStoredLevel: StoredLevel = {
        bestTime: -1,
        playerActions: this.playerActions.split('')
            .map(char => mapStringToAction(char) as Actions),
        dynamicFeatures: output.removedFeatures,
        displayIndex: currentLevel.displayIndex,
        index: this.currentSelectedIndex,
        level: currentLevel,
        strippedLayeredTileMatrix: output.strippedLayeredTileMatrix
      };
      console.log(newStoredLevel);
      store.setCurrentStoredLevel(newStoredLevel);
      store.router = this.router;
      this.router.push('/game');
    },
    mapEditorSaved(map: any) {
      console.log('mapEditorSaved. change selected index to -1 and move slider to first iten. it will have something different (background, border...)', map);
    }

  }
});

</script>
<template>
  <div class="container splash-view text-center pt-3">
    <div class="row row-cols-1 gy-3">
      <div class="col">
        <h1 class="sokoban-display display-3 fw-normal" style="user-select: none">CHERNOBYL DEFENDER</h1>
      </div>
      <div class="col-12" style="min-height: 100px; max-height: 50vh">
        <CarouselSlider :key="carouselSliderRefreshKey" :levels="availableLevels" :index="currentSelectedIndex"
                        @indexChanged="indexChanged"></CarouselSlider>
      </div>
      <div class="col-12">
        <label class="form-label sokoban-label">Player actions
          <a tabindex="0" class="btn btn-lg btn-danger px-1"
             role="button" data-bs-toggle="popover"
             style="background-color: transparent; border: none"
             title="Player actions"
             data-bs-trigger="focus"
             :data-bs-html="true"
             :data-bs-content="actionsLegentText">
            <i class="fa-regular fa-circle-question" style="color: var(--radioactive-color)"></i>
          </a>
        </label>
        <input type="text" class="form-control" placeholder="Player actions" aria-label="Insert player actions"
               :class="[invalidPlayerActionsError.length <= 0 ? 'is-valid' : 'is-invalid']"
               v-model="playerActions">
        <div class="form-label feedback-label invalid-feedback" style="position:absolute;">
          {{ invalidPlayerActionsError }}
        </div>
      </div>
      <div class="col-12" style="text-align: left">
        <SplashScreenAdvancedOptions
            :greatestAvailableIndex="availableLevels.length - 1"
            @mapEditorSaved="mapEditorSaved" @passwordUnblockedNewLevels="passwordUnblockedNewLevels"/>
      </div>
      <div class="w-100"></div>
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
  background-image: url("radioactive-symbol2.jpg");
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