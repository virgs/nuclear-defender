<script setup lang="ts">
import PhaserContainer from "@/components/PhaserContainer.vue";

function restartClick() {
  console.log('restart');
}

function undoClick() {
  console.log('undo');
}

</script>

<template>
  <div class="container game-view text-center mt-4">
    <div class="row align-items-center">
      <div class="col-12">
        <div class="row my-4 justify-content-center">
          <div class="col-6 gap-2 d-grid gap-2">
            <button class="btn btn-primary sokoban-outlined-button"
                    @click="undoClick" type="button">
              <i class="fa-solid fa-arrow-left"></i>
              Undo
            </button>
          </div>
          <div class="col-6 gap-2 d-grid gap-2">
            <button class="btn btn-primary sokoban-call-for-action-button"
                    @click="restartClick"
                    type="button">
              <i class="fa-solid fa-arrow-rotate-left"></i>
              Restart
            </button>
          </div>
        </div>
      </div>
      <div class="col-auto">
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
