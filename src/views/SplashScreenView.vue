<template>
  <div class="container splash-view text-center pt-3">
    <div class="row row-cols-1 gy-3">
      <div class="col mb-lg-5">
        <h1 class="sokoban-display display-3 fw-normal" style="user-select: none">NUCLEAR DEFENDER</h1>
      </div>
      <div class="col-12" style="min-height: fit-content;">
        <CarouselSlider :key="carouselSliderRefreshKey"
                        :visible="carouselIsVisible" :enabled-levels="enabledLevels"
                        @currentLevelChanged="currentLevelChanged">
        </CarouselSlider>
      </div>
      <div class="col-12 mt-2" style="text-align: left">
        <SplashScreenAdvancedOptions
            @playerActionsChanged="playerActionsChanged"
            @advancedOptionsVisibilityChanged="visible => this.carouselIsVisible = !visible"
            @mapEditorSaved="mapEditorSaved"
            @passwordUnblockedNewLevels="passwordUnblockedNewLevels"/>
      </div>
      <div class="w-100"></div>
      <div class="col-12">
        <div class="d-grid">
          <button class="btn btn-primary"
                  style="background-color: var(--radioactive-color); color: var(--foreground-color); border-color: transparent"
                  @click="playButtonClick"
                  :disabled="playerActions === undefined || !currentLevel"
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

import {defineComponent} from 'vue';
import {SessionStore} from '@/store/session-store';
import type {Level} from '@/levels/availableLevels';
import {LongTermStore} from "@/store/long-term-store";
import {getAvailableLevels} from "@/levels/availableLevels";
import CarouselSlider from '@/components/CarouselSlider.vue';
import DirectionalButtonsComponent from '@/components/DirectionalButtons.vue';
import SplashScreenAdvancedOptions from '@/components/SplashScreenAdvancedOptions.vue';

export default defineComponent({
  name: 'SplashScreenView',
  components: {CarouselSlider, DirectionalButtonsComponent, SplashScreenAdvancedOptions},
  data() {
    return {
      carouselSliderRefreshKey: 0,
      levels: getAvailableLevels(),
      currentLevel: undefined as Level | undefined,
      carouselIsVisible: true,
      playerActions: '' as string | undefined,
    };
  },
  mounted() {
    //@ts-ignore
    history.replaceState({urlPath: this.$router.currentRoute.fullPath}, '', '/nuclear-defender');
    window.addEventListener('keyup', this.keyPressed);
  },
  unmounted() {
    window.removeEventListener('keyup', this.keyPressed);
  },
  watch: {
    carouselIsVisible() {
      this.carouselSliderRefreshKey++;
    },
  },
  computed: {
    enabledLevels(): Level[] {
      const numberOfEnabledLevels = LongTermStore.getNumberOfEnabledLevels();
      return this.levels
          .filter((_: Level, index: number) => index < numberOfEnabledLevels);
    },
  },
  methods: {
    keyPressed(key: any) {
      if (this.carouselIsVisible && key.code === 'Enter') {
        if (this.playerActions !== undefined && this.currentLevel) {
          this.playButtonClick();
        }
      }
    },
    playerActionsChanged(actions: string | undefined) {
      this.playerActions = actions;
    },
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
      gameViewConfig.playerInitialActions = this.playerActions;
      this.$router.push(`/game`);
    },
    mapEditorSaved() {
      this.levels = getAvailableLevels();
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
  background-image: url("/assets/images/radioactive-symbol4.jpg");
  background-repeat: no-repeat;
  background-position-x: center;
  background-position-y: bottom;
  background-attachment: fixed;
}

</style>