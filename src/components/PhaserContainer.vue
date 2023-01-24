<template>
  <div :id="containerId"/>
</template>

<script lang="ts">
import type {SceneConfig} from '@/game/game';
import * as game from '@/game/game';
import {defineComponent} from 'vue';
import {Tiles} from '@/game/tiles/tiles';
import {Actions, mapStringToAction} from '@/game/constants/actions';
import {SokobanMapProcessor} from '@/game/tiles/sokoban-map-processor';
import {StandardSokobanAnnotationTranslator} from '@/game/tiles/standard-sokoban-annotation-translator';

export default defineComponent({
  name: 'PhaserContainer',
  props: ['key', 'playable', 'render', 'scene', 'displayNumber', 'playerInitialActions', 'customLevel', 'levelIndex'],
  emits: ['processedMap'],
  data() {
    return {
      gameInstance: undefined as unknown as Phaser.Game,
      containerId: 'game-container'
    };
  },
  mounted() {
    if (this.render) {
      const map = new StandardSokobanAnnotationTranslator()
          .translate(this.scene.map);
      const processedMap = new SokobanMapProcessor(map)
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
        strippedLayeredTileMatrix: processedMap.strippedLayeredTileMatrix
      };

      this.gameInstance?.destroy(false);
      this.gameInstance = game.launch(this.containerId, sceneConfig, this.$router);
      this.$emit('processedMap', processedMap);
    }
  },
  unmounted() {
    this.gameInstance?.destroy(false);
  }
});

</script>