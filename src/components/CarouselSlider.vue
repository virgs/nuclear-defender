<template>
  <div id="carousel-slider-parent">
    <span style="display: flex;">
      <label class="form-label sokoban-label">Select your level</label>
    </span>
    <div id="carousel-slider" style="">
      <div v-for="(_, index) in enabledLevels"
           :class="{'carousel-container': true,
                    'selected-slider': index === currentIndex,
                    'custom-level': index === 0,
                    'tns-item': true}"
           :style="carouselContainerStyle(index)">
        <div style="position:absolute;">
          <h4 class="level
          -number">{{ currentDisplayIndex(index) }}</h4>
        </div>
        <img alt="" class="img-fluid tns-lazy-img carousel-thumbnail" :data-src="thumbnail(index)"
             height="60"
             :style="mapStyle(index)">
        <img v-if="customItem(index)" alt="" class="img-fluid custom-made-stamp" src="/assets/images/custom-stamp.png">
        <img v-else-if="levelWasComplete(index)" alt="" class="img-fluid level-stamp" src="/assets/images/solved.png">
      </div>
    </div>
    <ul class="carousel-controls" id="customize-controls" tabindex="0">
      <li class="prev" id="carouselPrevButton" tabindex="-1" data-controls="prev">
        <i class="fa-solid fa-chevron-left"></i>
      </li>
      <li class="next" id="carouselNextButton" tabindex="-1" data-controls="next">
        <i class="fa-solid fa-chevron-right"></i>
      </li>
    </ul>
    <h3 class="mt-2 level-title">{{ currentTitle }}</h3>
    <h3 class="mt-2 level-solution-data">{{ currentSolutionData }}</h3>
  </div>
</template>

<script lang="ts">

import {tns} from 'tiny-slider';
import {defineComponent} from 'vue';
import {getEnabledLevels} from '@/levels/levels';
import {LongTermStore} from '@/store/long-term-store';
import type {LevelCompleteData} from '@/store/long-term-store';

export default defineComponent({
  name: 'CarouselSlider',
  emits: ['currentLevelChanged'],
  props: ['visible'],
  data() {
    return {
      enabledLevels: getEnabledLevels(),
      currentIndex: LongTermStore.getCurrentSelectedIndex(),
      slider: undefined as any
    };
  },
  mounted() {
    //Note: rebuilding the slider doenst work, so I rebuild the whole component
    //https://github.com/ganlanyuan/tiny-slider
    const visibleItems = this.enabledLevels.length === 2 ? 2 : 3; //it seems the carousel doesn't work properly when there is only 2 items
    this.slider = tns({
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
      arrowKeys: this.visible,
      speed: 400,
      startIndex: this.currentIndex,
      loop: false,
      prevButton: '#carouselPrevButton',
      nextButton: '#carouselNextButton',
      nav: false
    });

    this.slider.goTo(this.currentIndex);
    // bind function to event
    this.slider.events.on('indexChanged', (info: any) => this.updateIndex(info.index));
    this.updateIndex(this.currentIndex);

    const heightAdjuster = () => {
      const carouselSlider = document.getElementById('carousel-slider')!;
      const fractionHeight = carouselSlider.clientHeight;
      const intHeight = Math.ceil(fractionHeight / 10) * 10;
      if (intHeight > 75) {
        carouselSlider.style.height = intHeight + 'px';
      } else {
        setTimeout(heightAdjuster, 50);
      }
    };
    setTimeout(heightAdjuster, 50);
    window.addEventListener('keyup', this.keyPressed);
  },
  unmounted() {
    this.slider.destroy();
    window.removeEventListener('keyup', this.keyPressed);
  },
  computed: {
    carouselContainerStyle() {
      return (index: number): any => {
        if (index === this.currentIndex) {
          return {
            border: `solid ${index === 0 ? 'var(--oldstuff-color)' : 'var(--radioactive-color)'}`,
            'border-width': '6px 7px 6px 8px',
            'border-radius': '95% 4% 92% 5% / 4% 95% 6% 95%',
          };
        }
        return {};
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
        if (index === 0) {
          filterColor = 'var(--oldstuff-color)';
        }
        return {
          'min-width': '30%',
          'user-select': 'none',
          'filter': `drop-shadow(${filterX}px 5px 3px ${filterColor})`
        };
      };

    },
    currentDisplayIndex(): (index: number) => string {
      return (index: number): string => {
        if (index === 0) {
          return '';
        }
        return index.toString();
      };
    },
    customItem(): (index: number) => boolean {
      return (index: number): boolean => {
        return index === 0;
      };
    },
    thumbnail() {
      return (index: number): string => {
        if (this.enabledLevels[index]) {
          if (this.enabledLevels[index].snapshot) {
            return this.enabledLevels[index]!.snapshot!;
          } else if (this.enabledLevels[index]!.thumbnailPath) {
            return this.enabledLevels[index]!.thumbnailPath!;
          }
        }
        return this.enabledLevels[1].thumbnailPath!;
      };
    },
    currentTitle(): string {
      return this.enabledLevels[this.currentIndex].title;
    },
    levelWasComplete(): (index: number) => boolean {
      return (index: number): boolean => {
        let realIndex = index;
        if (index !== 0) {
          return !!LongTermStore.getLevelCompleteData()
              .find((item: LevelCompleteData) => item.index === realIndex);
        }
        return false;
      };
    },
    currentSolutionData(): string | undefined {
      if (this.currentIndex !== 0) {
        let realIndex = this.currentIndex;
        const solution = LongTermStore.getLevelCompleteData()
            .find((item: LevelCompleteData) => item.index === realIndex);
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
    keyPressed(key: any) {
      //@ts-ignore
      const focusedElementId = document.activeElement.id;
      const allowedFocuselementIds = ['body', 'carouselPrevButton', 'carouselNextButton'];
      if (this.visible && allowedFocuselementIds.includes(focusedElementId)) {
        const max = this.enabledLevels.length - 1;
        const min = 0;
        const pageSize = 5;
        if (key.code === 'Home') {
          this.slider.goTo(min);
        } else if (key.code === 'End') {
          this.slider.goTo(max);
        } else if (key.code === 'PageUp') {
          this.slider.goTo(Phaser.Math.Clamp(this.currentIndex - pageSize, min, max));
        } else if (key.code === 'PageDown') {
          this.slider.goTo(Phaser.Math.Clamp(this.currentIndex + pageSize, min, max));
        }
      }
    },
    updateIndex(index: number) {
      LongTermStore.setCurrentSelectedIndex(index);
      this.currentIndex = index;
      let level = this.enabledLevels[index];
      let title = index.toString();
      if (index === 0) {
        title = '(custom)';
      }

      this.$emit('currentLevelChanged', level, title, index === 0, index);
    }
  }

});
</script>

<style scoped>

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