<template>
  <div id="directional-buttons-container">
    <div class="row justify-content-center">
      <div class="col-4">
        <button class="btn btn-primary sokoban-call-for-action-button w-100"
                @click="upClick"
                type="button">
          <i class="fa-solid fa-arrow-up"></i>
        </button>
      </div>
      <div class="w-100 mt-2"></div>
      <div class="col-4">
        <button class="btn btn-primary sokoban-call-for-action-button w-100"
                @click="leftClick"
                type="button">
          <i class="fa-solid fa-arrow-left"></i>
        </button>
      </div>
      <div class="col-4">
        <button class="btn btn-primary sokoban-call-for-action-button w-100"
                @click="downClick"
                type="button">
          <i class="fa-solid fa-arrow-down"></i>
        </button>
      </div>
      <div class="col-4">
        <button class="btn btn-primary sokoban-call-for-action-button w-100"
                @click="rightClick"
                type="button">
          <i class="fa-solid fa-arrow-right"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">

import {defineComponent} from 'vue';
import {EventEmitter, EventName} from '@/event-emitter';
import {Directions} from '@/game/constants/directions';

export default defineComponent({
  name: 'DirectionalButtons',
  methods: {
    leftClick() {
      this.directionClick(Directions.LEFT);
    },
    upClick() {
      this.directionClick(Directions.UP);
    },
    rightClick() {
      this.directionClick(Directions.RIGHT);
    },
    downClick() {
      this.directionClick(Directions.DOWN);
    },
    directionClick(direction: Directions) {
      EventEmitter.emit(EventName.HERO_DIRECTION_INPUT, direction);
    }
  }
});
</script>

<style scoped>

</style>