<template>
  <div class="container splash-view text-center pt-3">
    <div class="row row-cols-1 gy-3">
      <div class="col mb-lg-5">
        <h1 class="sokoban-display display-3 fw-normal" style="user-select: none">CHERNOBYL DEFENDER</h1>
      </div>
      <div class="col-12" style="min-height: fit-content;">
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

import {LongTermStore} from '@/store/long-term-store';
import {defineComponent} from 'vue';
import CarouselSlider from '@/components/CarouselSlider.vue';
import {mapStringToAction} from '@/game/constants/actions';
import DirectionalButtonsComponent from '@/components/DirectionalButtons.vue';
import SplashScreenAdvancedOptions from '@/components/SplashScreenAdvancedOptions.vue';
import type {Level} from '@/game/levels/levels';
import {SessionStore} from '@/store/session-store';

export default defineComponent({
  name: 'SplashScreenView',
  components: {CarouselSlider, DirectionalButtonsComponent, SplashScreenAdvancedOptions},
  data() {
    return {
      carouselSliderRefreshKey: 0,
      playerActions: '',
      customLevel: LongTermStore.getCustomLevel(),
      currentLevel: undefined as Level | undefined,
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
    currentLevelChanged(currentLevel: Level, displayNumber: string, isCustomLevel: boolean, index: number) {
      this.currentLevel = currentLevel;
      SessionStore.setGameViewConfig({
        display: displayNumber,
        isCustom: isCustomLevel,
        levelIndex: index,
        playerInitialActions: this.playerActions,
        level: this.currentLevel!
      });
    },
    passwordUnblockedNewLevels() {
      ++this.carouselSliderRefreshKey;
    },
    playButtonClick() {
      const gameViewConfig = SessionStore.getGameViewConfig()!;
      gameViewConfig.playerInitialActions = this.playerActions
      this.$router.push(`/game`);
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
  background-image: url("radioactive-symbol4.jpg");
  background-repeat: no-repeat;
  background-position-x: center;
  background-position-y: bottom;
  background-attachment: fixed;
}

</style>