<script setup lang="ts">
import PhaserContainer from "@/components/PhaserContainer.vue";
console.log('game')
</script>

<template>
  <Suspense>
    <div class="container text-center mt-4">
      <div class="row align-items-center">
        <div class="col">
          <PhaserContainer />
        </div>
      </div>
    </div>
    <template #fallback>
      <div class="placeholder">Downloading ...</div>
    </template>
  </Suspense>
</template>

<style scoped>
.placeholder {
  font-size: 2rem;
  font-family: "Courier New", Courier, monospace;
}
</style>
