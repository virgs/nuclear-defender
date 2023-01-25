<template>
  <div id="carousel-slider-parent">
    <span style="display: flex;">
      <label class="form-label sokoban-label">Select your level</label>
    </span>
    <div id="carousel-slider" style="">
      <div v-for="(_, index) in levels"
           :class="{'carousel-container': true,
                    'selected-slider': index === currentIndex,
                    'custom-level': index === 0 && customLevel,
                    'tns-item': true}"
           :style="carouselContainerStyle(index)">
        <div style="position:absolute;">
          <h4 class="level-number">{{ currentDisplayIndex(index) }}</h4>
        </div>
        <img alt="" class="img-fluid tns-lazy-img carousel-thumbnail" :data-src="thumbnail(index)"
             :style="mapStyle(index)">
        <img v-if="customItem(index)" class="img-fluid level-stamp" src="custom-stamp.png">
        <!-- TODO check if this level was complete-->
        <img v-else-if="index !== levels.length - 1" class="img-fluid level-stamp" src="solved.png">
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
        <!-- TODO check if this level was complete. if that'the case.. Display when and the time the solution took. A replay button, perharps?-->
  </div>
</template>

<script lang="ts">

import {LongTermStore} from '@/store/long-term-store';
import {tns} from 'tiny-slider';
import {defineComponent} from 'vue';
import type {Level} from '@/game/levels/levels';
import {levels} from '@/game/levels/levels';

export default defineComponent({
  name: 'CarouselSlider',
  props: ['customLevel'],
  emits: ['currentLevelChanged'],
  data() {
    return {
      currentIndex: LongTermStore.getCurrentSelectedIndex(),
      enabledLevels: LongTermStore.getNumberOfEnabledLevels()
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
      arrowKeys: true,
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
  watch: {
    customLevel() {
      console.log(this.customLevel);
    },
  },
  computed: {
    carouselContainerStyle() {
      return (index: number): any => {
        let style: any = {
          // padding: '20px',
        };
        if (index === this.currentIndex) {
          style = {
            ...style,
          border: `solid ${this.customLevel && index === 0 ? 'var(--oldstuff-color)' : 'var(--radioactive-color)'}`,
          'border-width': '6px 7px 6px 8px',
          'border-radius': '95% 4% 92% 5% / 4% 95% 6% 95%',
          }
        }
        return style;
      };
    },
    mapStyle() {
      const xModifier = 10;
      return (index: number): any => {
        let filterX = xModifier;
        if (index === this.currentIndex) {
          filterX = 0;
        } else if (index < this.currentIndex) {
          filterX = -xModifier;
        }
        let filterColor = 'var(--radioactive-color)';
        if (this.customLevel && index === 0) {
          filterColor = 'var(--oldstuff-color)';
        }
        return {
          'min-width': '30%',
          'user-select': 'none',
          'filter': `drop-shadow(${filterX}px 5px 3px ${filterColor})`
        };
      };

    },
    levels(): Level[] {
      const availableLevels = levels
          .filter((_, index) => index < this.enabledLevels);
      if (this.customLevel) {
        availableLevels.unshift(this.customLevel);
      }
      return availableLevels;
    },
    currentDisplayIndex(): (index: number) => string {
      return (index: number): string => {
        if (this.customLevel) {
          if (index === 0) {
            return 'custom';
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
        return this.levels[0].thumbnailPath!;
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
      LongTermStore.setCurrentSelectedIndex(index);
      this.currentIndex = index;
      let level = this.levels[index];
      if (index === 0 && this.customLevel) {
        level = this.customLevel;
      }
      this.$emit('currentLevelChanged', level, this.currentDisplayIndex(index),
          this.customLevel && index === 0, index);
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
  width: 40%;
  position: absolute;
  top: 15%;
  right: 5%;

  z-index: 100;
}

.selected-slider .level-stamp {
  animation: shake 2.5s infinite;
}

.carousel-container.selected-slider {
  animation: border-animation 1s alternate infinite;
}

@keyframes border-animation {
  100% {
    border-radius: 85% 8% 99% 2% / 5% 98% 1% 91%;
  }
}

@keyframes shake {
  0% {
    transform: rotate(0deg);
  }
  40% {
    transform: rotate(3deg);
  }
  50% {
    transform: scale(1.1);
  }
  70% {
    transform: rotate(-2deg);
  }
  90% {
    transform: scale(.9);
  }
}

</style>