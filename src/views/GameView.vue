<script setup lang="ts">
import PhaserContainer from "@/components/PhaserContainer.vue";</script>

<template>
  <div class="container game-view text-center mt-4">
    <div class="row row-cols-1 align-items-center">
      <div class="col">
        <Suspense>
          <PhaserContainer/>
          <template #fallback>
            <div class="spinner-border text-info" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
          </template>
        </Suspense>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>
