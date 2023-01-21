<template>
  <div id="carousel-slider-parent">
    <span style="display: flex;">
      <label class="form-label sokoban-label">Select your level</label>
    </span>
    <div id="carousel-slider">
      <div v-for="(item, index) in levels"
           :class="[index === currentIndex ? 'selected-slider' : '', 'tns-item']">
        <h4 class="level-number">{{ index + 1 }}</h4>
        <img alt="" class="img-fluid tns-lazy-img" :data-src="levels[0].thumbnailPath" style="user-select: none">
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
    <h3 class="mt-2 level-title">{{ levels[currentIndex].title }}</h3>
  </div>
</template>

<script lang="ts">

import {tns} from 'tiny-slider';
import {defineComponent} from 'vue';

export default defineComponent({
  name: "CarouselSlider",
  props: ['levels', 'index'],
  emits: ['indexChanged'],
  data() {
    return {
      currentIndex: this.index
    };
  },
  mounted() {
    //https://github.com/ganlanyuan/tiny-slider
    const slider = tns({
      container: '#carousel-slider',
      items: 3,
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
      startIndex: this.currentIndex,
      loop: false,
      prevButton: '#prevButton',
      nextButton: '#nextButton',
      nav: false
    });

    // bind function to event
    slider.events.on('indexChanged', (info: any) => {
      this.currentIndex = info.index;
      this.$emit('indexChanged', info.index);
    });
  }

});
</script>

<style scoped>

</style>