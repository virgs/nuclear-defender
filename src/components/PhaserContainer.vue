<script setup lang="ts">
import {onMounted, onUnmounted} from "vue";
import {Store} from '@/store';
const props = defineProps({
  playable: Boolean
})

let gameInstance: Phaser.Game | null | void = null;
const containerId = "game-container";
const game = await import(/* webpackChunkName: "game" */ "@/game/game");
onMounted(() => {
  gameInstance = game.launch(containerId, Store.getInstance(), props.playable);
});
onUnmounted(() => {
  gameInstance?.destroy(false);
});
</script>

<template>
  <div :id="containerId"/>
</template>
