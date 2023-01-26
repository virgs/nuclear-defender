<template>
  <div id="map-difficulty-gauge" :style="{filter: estimative !== undefined ? 'opacity(1)' : 'opacity(0.25)'}">
  </div>
  <div v-if="estimative === undefined" style="position: absolute; top: 40%; left: 35%; color: var(--radioactive-color)"
       class="spinner-border" role="status">
  </div>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import {RadialGauge} from 'canvas-gauges';

export default defineComponent({
  name: 'MapDifficultyGauge',
  components: {},
  props: ['estimative', 'toggle'],
  data() {
    return {
      gauge: undefined as any,
      dimensionsUpdated: false,
      animation: undefined as any
    };
  },
  watch: {
    toggle() {
      const refresher = () => {
        const parent = document.getElementById('map-difficulty-gauge')!;
        if (parent?.offsetHeight) {
          this.refreshGauge();
        } else {
          setTimeout(refresher, 50);
        }
      };
      setTimeout(refresher, 50);
    },
    estimative() {
      this.refreshGauge();
    },
  },
  mounted() {
    this.gauge = this.createGauge();
    setTimeout(() => {
      // this.refreshGauge()

    }, 100);
  },
  unmounted() {
    clearTimeout(this.animation);
  },
  methods: {
    createGauge() {
      const parent = document.getElementById('map-difficulty-gauge')!;
      //https://canvas-gauges.com/documentation/user-guide/configuration
      const gauge = new RadialGauge({
        renderTo: document.createElement('canvas'),
        width: '10',
        height: '10',
        valueBox: false,

        value: this.estimative || Math.random() * 100,
        minValue: 0,
        maxValue: 100,
        startAngle: 0,
        ticksAngle: 180,

        minorTicks: 20,
        majorTicks: false,
        colorNumbers: 'transparent',
        strokeTicks: true,
        highlights: [
          {
            from: 25,
            to: 75,
            color: "rgba(14,255,255,0.7)"
          },
          {
            from: 75,
            to: 95,
            color: "rgba(200, 50, 50, .75)"
          },
          {
            from: 95,
            to: 100,
            color: "#D4FA00FF"
          }
        ],
        highlightsWidth: 30,

        colorPlate: 'transparent',
        animateOnInit: true,
        needleType: 'arrow',
        needleShadow: true,
        needleWidth: 2,
        needleCircleSize: 5,
        colorNeedle: 'black',
        colorNeedleEnd: 'red',
        colorNeedleCircleInner: '#D4FA00FF',
        needleCircleOuter: true,
        needleCircleInner: true,
        animationDuration: 150,
        animationRule: 'quad',
        borders: false,
      });
      parent!.appendChild(gauge.options.renderTo);
      return gauge;
    },
    refreshGauge() {
      const valuesToUpdate: any = {
        value: this.estimative || 0
      };

      if (!this.dimensionsUpdated) {
        this.dimensionsUpdated = true;
        const parent = document.getElementById('map-difficulty-gauge')!;
        valuesToUpdate.height = parent.clientHeight * .75 + '';
        valuesToUpdate.width = parent.clientWidth * 1.75 + '';
      }
      const updateAnimationHandler = () => {
        const variation = 3;
        const value = this.estimative !== undefined ? this.estimative : Math.random() * 50 + 25;
        this.gauge!.update({value: value + (Math.random() * variation) - (variation * .5)});
        this.animation = setTimeout(updateAnimationHandler, 150);
      };
      this.animation = setTimeout(updateAnimationHandler, 0);
      this.gauge!.update(valuesToUpdate);
    }
  }
});
</script>

<style scoped>
#map-difficulty-gauge {
  width: 100%;
  height: 100%;
  max-height: 100%;
}

</style>