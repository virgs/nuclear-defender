<script setup lang="ts">
import {Store} from '@/store';
import * as game from "@/game/game";
import {onMounted, onUnmounted} from "vue";

const props = defineProps({
  key: Number,
  playable: Boolean,
  render: Boolean
});

let gameInstance: Phaser.Game | null | void = null;
const containerId = "game-container";

onMounted(() => {
  if (props.render) {
    gameInstance?.destroy(false);
    gameInstance = game.launch(containerId, Store.getInstance(), props.playable);
  }

});
onUnmounted(() => {
  gameInstance?.destroy(false);
});
</script>

<template>
  <div :id="containerId"/>
</template>
