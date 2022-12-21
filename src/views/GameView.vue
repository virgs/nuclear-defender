<script setup lang="ts">
import PhaserContainer from "@/components/PhaserContainer.vue";
</script>

<template>
  <div class="container game-view text-center mt-4">
    <div class="row row-cols-1 align-items-center">
      <div class="col-auto">
        <Suspense>
          <PhaserContainer/>
          <template #fallback>
            <div class="placeholder">Downloading ...</div>
          </template>
        </Suspense>
      </div>
    </div>
  </div>
</template>

<style scoped>
.placeholder {
  font-size: 2rem;
  font-family: "Courier New", Courier, monospace;
}
</style>
