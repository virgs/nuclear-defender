<template>
  <div id="carousel-slider-parent">
    <span style="display: flex;">
      <label class="form-label sokoban-label">Select your level</label>
    </span>
    <div id="carousel-slider">
      <div v-for="(_, index) in levels"
           :class="{'selected-slider': index === currentIndex,
                    'custom-level': index === 0 && customLevel,
                    'tns-item': true}">
        <div style="position:absolute;">
          <h4 class="level-number">{{ currentDisplayIndex(index) }}</h4>
        </div>
        <img alt="" class="img-fluid tns-lazy-img" :data-src="thumbnail(index)"
             style="user-select: none">
        <img v-if="customItem(index)" class="img-fluid level-stamp" src="custom-stamp.png">
        <img v-else class="img-fluid level-stamp" src="solved.png">
      </div>
    </div>
    <ul class="carousel-controls" id="customize-controls" tabindex="0">
      <li class="prev" id="prevButton" tabindex="-1" data-controls="prev">
        <i class="fa-solid fa-chevron-left"></i>
      </li>
      <li class="next" id="nextButton" tabindex="-1" data-controls="next">
        <i class="fa-solid fa-chevron-right"></i>
      </li>
    </ul>
    <h3 class="mt-2 level-title">{{ currentTitle }}</h3>
  </div>
</template>

<script lang="ts">

import {Store} from '@/store';
import {tns} from 'tiny-slider';
import {defineComponent} from 'vue';
import type {Level} from '@/game/levels/defaultLevels';
import {defaultLevels} from '@/game/levels/defaultLevels';

export default defineComponent({
  name: 'CarouselSlider',
  props: ['customLevel'],
  emits: ['currentLevelChanged'],
  data() {
    return {
      currentIndex: Store.getCurrentSelectedIndex(),
      enabledLevels: Store.getNumberOfEnabledLevels()
    };
  },
  mounted() {
    //https://github.com/ganlanyuan/tiny-slider
    const visibleItems = this.levels.length === 2 ? 2 : 3; //it seems the carousel doesnt work properly when there is only 2 items
    const slider = tns({
      container: '#carousel-slider',
      items: visibleItems,
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
      startIndex: 0,
      loop: false,
      prevButton: '#prevButton',
      nextButton: '#nextButton',
      nav: false
    });

    slider.goTo(this.currentIndex);
    // bind function to event
    slider.events.on('indexChanged', (info: any) => this.updateIndex(info.index));
    this.updateIndex(this.currentIndex);
  },
  computed: {
    levels(): Level[] {
      const levels = defaultLevels
          .filter((_, index) => index < this.enabledLevels);
      if (this.customLevel) {
        levels.unshift(this.customLevel);
      }
      return levels;
    },
    currentDisplayIndex(): (index: number) => string {
      return (index: number): string => {
        if (this.customLevel) {
          if (index === 0) {
            return '-';
          }
          return index.toString();
        }
        return (index + 1).toString();
      };
    },
    customItem(): (index: number) => boolean {
      return (index: number): boolean => {
        return !!(this.customLevel && index === 0);
      };
    },
    thumbnail() {
      return (index: number): string => {
        if (this.customLevel) {
          if (index === 0) {
            return this.customLevel.snapshot;
          }
          return this.levels[1].thumbnailPath!;
        }
        return this.levels[1].thumbnailPath!;
      };
    },
    currentTitle(): string {
      if (this.currentIndex === 0 && this.customLevel) {
        return this.customLevel.title;
      }
      return this.levels[this.currentIndex].title;
    }
  },
  methods: {
    updateIndex(index: number) {
      Store.setCurrentSelectedIndex(index);
      this.currentIndex = index;
      let level = this.levels[index];
      if (index === 0 && this.customLevel) {
        level = this.customLevel;
      }
      this.$emit('currentLevelChanged', level, this.currentDisplayIndex(index),
          this.customLevel && index === 0);
    }
  }

});
</script>

<style scoped>

.level-number {
  text-align: left;
  text-transform: capitalize;
  font-weight: bolder;
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

.custom-level {
}

.level-stamp {
  rotate: 40deg;
  width: 50%;
  position: absolute;
  top: 10%;
  right: 0;
}
</style>