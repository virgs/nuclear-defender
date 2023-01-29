<template>
  <div :id="containerId"/>
</template>

<script lang="ts">
import type {SceneConfig} from '@/game/game-launcher';
import * as game from '@/game/game-launcher';
import {defineComponent} from 'vue';
import {Tiles} from '@/game/levels/tiles';
import {Actions, mapStringToAction} from '@/game/constants/actions';
import {SokobanMapStripper} from '@/game/levels/sokoban-map-stripper';
import {StandardSokobanAnnotationTokennizer} from '@/game/levels/standard-sokoban-annotation-tokennizer';

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

        console.log('rendering');
        this.gameInstance?.destroy(false);
        this.gameInstance = undefined;
        this.gameInstance = game.launch(this.containerId, sceneConfig, this.$router);
        console.log('rendered');

        this.$emit('processedMap', processedMap);
      } catch (e) {
        console.log('error creating map', e);
      }
    }
  },
  unmounted() {
    console.log('destroying');
    this.gameInstance?.destroy(false);
    this.gameInstance = undefined;
    console.log('destroyed');
  }
});

</script>