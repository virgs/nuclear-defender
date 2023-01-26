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
        <img v-if="customItem(index)" class="img-fluid custom-made-stamp" src="custom-stamp.png">
        <img v-else-if="levelWasComplete(index)" class="img-fluid level-stamp" src="solved.png">
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
    <h3 class="mt-2 level-solution-data">{{ currentSolutionData }}</h3>
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
          };
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
            return '';
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
    },
    levelWasComplete(): (index: number) => boolean {
      return (index: number): boolean => {
        let realIndex = index;
        if (!this.customLevel) {
          realIndex += 1;
        }
        if (!this.customLevel || index !== 0) {
          return !!LongTermStore.getLevelCompleteData()
              .find(item => item.index === realIndex);
        }
        return false;
      };
    },
    currentSolutionData(): string | undefined {
      if (!this.customLevel || this.currentIndex !== 0) {
        let realIndex = this.currentIndex;
        if (!this.customLevel) {
          realIndex += 1;
        }

        const solution = LongTermStore.getLevelCompleteData()
            .find(item => item.index === realIndex);
        if (solution) {
          const date = new Date(solution.timestamp);
          const stringDate = `${date.getDate()}/${date
              .toLocaleString('en-US', {month: 'long'}).substring(0, 3)}/${date
              .getFullYear()}`;
          return `solved on ${stringDate} in ${Math.trunc(solution.totalTime / 100) / 10}s`;
        }
      }
      return '';
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

      let title = index.toString();
      if (!this.customLevel) {
        title = (index + 1).toString();
      } else if (index === 0) {
        title = 'custom';
      }

      this.$emit('currentLevelChanged', level, title,
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
  font-family: 'Poppins', serif;
  font-size: xx-large;
  font-weight: bolder;
  text-transform: capitalize;
  color: var(--background-color);
  text-shadow: 2px 2px 1px var(--radioactive-color);
}

.level-solution-data {
  min-height: 20px;
  margin-right: 10px !important;
  font-weight: bolder;
  font-size: .75rem;
  text-align: right;
  color: var(--background-color);
}

.custom-made-stamp {
  rotate: -20deg;
  width: 50%;
  position: absolute;
  top: 5%;
  left: 5%;
}

.level-stamp {
  rotate: 40deg;
  width: 70%;
  position: absolute;
  top: 25%;
  right: 5%;

  z-index: 100;
}

.selected-slider .level-stamp,
.selected-slider .custom-made-stamp {
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
    transform: scale(1.25);
  }
  70% {
    transform: rotate(-2deg);
  }
  90% {
    transform: scale(.9);
  }
}

</style>