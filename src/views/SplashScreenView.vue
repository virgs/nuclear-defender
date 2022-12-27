<script setup lang="ts">
// script setup syntax or Composition API

import {Store} from '@/store';
import {useRouter} from 'vue-router';
import {levels} from '@/game/levels/levels';
import {computed, onMounted, reactive} from "vue";
import SplashScreenAdvancedOptionsComponent from '@/components/SplashScreenAdvancedOptions.vue';

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
  console.log()
}

function playButtonClick() {
  // const tileMap = this.make.tilemap({key: configuration.tiles.tilemapKey});
  // const extracted = new FileLevelExtractor().extractToTileCodeMap(tileMap); // from file
  //https://medium.com/@michaelwesthadley/modular-game-worlds-in-phaser-3-tilemaps-1-958fc7e6bbd6

  const store = Store.getInstance();
  store.currentLevelIndex = data.currentSelectedIndex;
  store.map = levels[data.currentSelectedIndex].map;
  router.push('/game');
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