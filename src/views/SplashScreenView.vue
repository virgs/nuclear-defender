<template>
  <div class="container splash-view text-center pt-3">
    <div class="row row-cols-1 gy-3">
      <div class="col mb-lg-5">
        <h1 class="sokoban-display display-3 fw-normal" style="user-select: none">CHERNOBYL DEFENDER</h1>
      </div>
      <div class="col-12" style="min-height: 100px; max-height: 50vh">
        <CarouselSlider :key="carouselSliderRefreshKey"
                        :custom-level="customLevel"
                        @currentLevelChanged="currentLevelChanged">
        </CarouselSlider>
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
            @mapEditorSaved="mapEditorSaved"
            @passwordUnblockedNewLevels="passwordUnblockedNewLevels"/>
      </div>
      <div class="w-100"></div>
      <div class="col-12">
        <div class="d-grid">
          <button class="btn btn-primary"
                  style="background-color: var(--radioactive-color); color: var(--foreground-color); border-color: transparent"
                  @click="playButtonClick"
                  :disabled="invalidPlayerActionsError.length > 0 || !currentLevel"
                  type="button">Play
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
// script setup syntax or Composition API
// options API

import {Store} from '@/store';
import {defineComponent} from 'vue';
import CarouselSlider from '@/components/CarouselSlider.vue';
import {mapStringToAction} from '@/game/constants/actions';
import DirectionalButtonsComponent from '@/components/DirectionalButtons.vue';
import SplashScreenAdvancedOptions from '@/components/SplashScreenAdvancedOptions.vue';
import type {Level} from '@/game/levels/defaultLevels';

export default defineComponent({
  name: 'SplashScreenView',
  components: {CarouselSlider, DirectionalButtonsComponent, SplashScreenAdvancedOptions},
  data() {
    return {
      carouselSliderRefreshKey: 0,
      playerActions: '',
      customLevel: Store.getCustomLevel(),
      currentLevel: undefined as Level | undefined,
      displayNumber: '',
      isCustomLevel: false,
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
    //@ts-ignore
    history.replaceState({urlPath: this.$router.currentRoute.fullPath}, '', '/');
  },
  computed: {
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
    currentLevelChanged(currentLevel: Level, displayNumber: string, isCustomLevel: boolean) {
      this.currentLevel = currentLevel;
      this.displayNumber = displayNumber;
      this.isCustomLevel = isCustomLevel;
    },
    passwordUnblockedNewLevels() {
      ++this.carouselSliderRefreshKey;
    },
    playButtonClick() {
      // const tileMap = this.make.tilemap({key: configuration.tiles.tilemapKey});
      // const extracted = new FileLevelExtractor().extractToTileCodeMap(tileMap); // from file
      //https://medium.com/@michaelwesthadley/modular-game-worlds-in-phaser-3-tilemaps-1-958fc7e6bbd6

      Store.setCurrentSceneConfig(this.currentLevel!);
      this.$router.push(`/game/${this.displayNumber}/${this.isCustomLevel}/${this.playerActions}`);
    },
    mapEditorSaved(level: Level) {
      this.customLevel = level;
      ++this.carouselSliderRefreshKey;
    }

  }
});

</script>
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

</style>