<script setup lang="ts">
import {onMounted, onUnmounted} from "vue";
import {useRouter} from 'vue-router';

const router = useRouter();

let gameInstance: Phaser.Game | null | void = null;
const containerId = "game-container";
const game = await import(/* webpackChunkName: "game" */ "@/game/game");
onMounted(() => {
  console.log(router);
  gameInstance = game.launch(containerId);
});
onUnmounted(() => {
  gameInstance?.destroy(false);
});
</script>

<template>
  <div :id="containerId"/>
</template>
