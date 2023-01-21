<script setup lang="ts">
import {Store} from '@/store';
import * as game from "@/game/game";
import type {StoredLevel} from '@/store';
import {onMounted, onUnmounted} from "vue";

const props = defineProps({
  key: Number,
  playable: Boolean,
  render: Boolean
});

let gameInstance: Phaser.Game | null | void = null;
const containerId = 'game-container';

onMounted(() => {
  if (props.render) {
    const store = Store.getInstance();
    const level: StoredLevel = props.playable ? store.getCurrentStoredLevel()! : store.getCustomLevel()!;
    gameInstance?.destroy(false);
    gameInstance = game.launch(containerId, level, store.router, props.playable);
  }

});
onUnmounted(() => {
  gameInstance?.destroy(false);
});
</script>

<template>
  <div :id="containerId"/>
</template>
