<template>
  <div :id="containerId"/>
</template>

<script lang="ts">
import type {SceneConfig} from '../game-launcher';
import * as game from '../game-launcher';
import {defineComponent} from 'vue';
import {Tiles} from '../levels/tiles';
import {Actions, mapStringToAction} from '../constants/actions';
import {SokobanMapStripper} from '../levels/sokoban-map-stripper';
import {StandardSokobanAnnotationTokennizer} from '../levels/standard-sokoban-annotation-tokennizer';

export default defineComponent({
  name: 'PhaserContainer',
  props: ['key', 'playable', 'render', 'scene', 'displayNumber', 'playerInitialActions', 'customLevel', 'levelIndex'],
  emits: ['processedMap'],
  data() {
    return {
      gameInstance: undefined as Phaser.Game | undefined,
      containerId: 'game-container'
    };
  },
  mounted() {
    if (this.render) {
      try {
        const map = new StandardSokobanAnnotationTokennizer()
            .translate(this.scene.map);
        const processedMap = new SokobanMapStripper(map)
            .strip([Tiles.hero, Tiles.box]);
        const sceneConfig: SceneConfig = {
          isCustomLevel: !!this.customLevel,
          levelIndex: this.levelIndex,
          playable: this.playable,
          playerInitialActions: (this.playerInitialActions || '')
              .split('')
              .map((char: string) => mapStringToAction(char) as Actions),
          displayNumber: this.displayNumber || '',
          level: this.scene,
          dynamicFeatures: processedMap.removedFeatures,
          strippedLayeredTileMatrix: processedMap.raw
        };

        this.gameInstance?.destroy(false);
        this.gameInstance = undefined;
        this.gameInstance = game.launch(this.containerId, sceneConfig, this.$router);

        this.$emit('processedMap', {processedMap, map: this.scene.map});
      } catch (e) {
        this.$emit('processedMap', {error: e, map: this.scene.map});
      }
    }
  },
  unmounted() {
    this.gameInstance?.destroy(true);
  }
});

</script>