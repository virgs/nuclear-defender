<script lang="ts">
import {Store} from '@/store';
import {defineComponent} from 'vue';
import {mapActionToChar} from '@/game/constants/actions';

export default defineComponent({
  name: "NextLevelView",
  data() {
    const store = Store.getInstance();

    return {
      currentSelectedLevel: store.getCurrentStoredLevel()!,
      levelCompletedData: store.getLevelCompleteData()!,
      router: store.router,
    };
  },
  mounted() {
    history.replaceState({urlPath: this.router.currentRoute.fullPath}, "", '/');

    const toastTriggers = document.getElementsByClassName('toastBtn');
    const toastLiveExample = document.getElementById('copy-toast');
    if (toastTriggers) {
      Array.from(toastTriggers)
          .forEach(trigger => {
            // @ts-ignore
            trigger.addEventListener('click', () => new bootstrap.Toast(toastLiveExample).show());
          });
    }
  },
  computed: {
    movesCode() {
      return this.levelCompletedData.movesCode
          .map(move => mapActionToChar(move))
          .join('');
    }
  },
  methods: {
    async copy(text: string) {
      await navigator.clipboard.writeText(text);
    },
    async continueButton() {
      const store = Store.getInstance();
      if (this.currentSelectedLevel.index === store.furthestEnabledLevel) {
        ++store.furthestEnabledLevel;
      }

      await this.router.push('/');
    }
  }
});


</script>

<template>
  <main>
    <div class="toast-container position-fixed top-0 end-0 pt-3">
      <div id="copy-toast" class="toast" role="alert" style="background-color: transparent"
           aria-live="assertive" aria-atomic="true" data-bs-delay="2500">
        <div class="d-flex sokoban-toast">
          <div class="toast-body">
            Text copied to clipboard
          </div>
          <button type="button" class="btn-close me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
      </div>
    </div>

    <div class="container my-5 splash-view text-center">
      <div class="row row-cols-1 justify-content-end gy-3">
        <div class="col">
          <h1 class="sokoban-display display-3 fw-normal" style="user-select: none; text-align: left">Level
            <em>{{ currentSelectedLevel.index + 1 }}: '{{ currentSelectedLevel.level.title }}'</em>
            complete!</h1>
        </div>
        <div class="col my-1">
          <h4 class="sokoban-display fw-normal"
              style="user-select: none; color: var(--background-color); text-align: right">Total time:
            {{ Math.trunc(levelCompletedData.totalTime / 100) / 10 }}s
          </h4>
        </div>
        <div class="col-12">
          <label class="form-label sokoban-label">Moves code</label>
          <div class="input-group">
            <input type="text" class="form-control" readonly
                   :value="movesCode">
            <button class="btn btn-outline-secondary toastBtn" type="button"
                    style="background-color: var(--radioactive-color)" @click="copy(movesCode)">
              Copy
            </button>
          </div>
        </div>
        <div class="col-12">
          <label class="form-label sokoban-label">Coded map</label>
          <div class="input-group">
            <input type="text" class="form-control" readonly
                   :value="currentSelectedLevel.level.map">
            <button class="btn btn-outline-secondary toastBtn" type="button"
                    style="background-color: var(--radioactive-color)" @click="copy(currentSelectedLevel.level.map)">
              Copy
            </button>
          </div>
        </div>
        <div class="col-4 col-lg-3 d-grid gap-2 my-5">
          <button class="btn btn-primary sokoban-call-for-action-button"
                  @click="continueButton"
                  type="button">
            <i class="fa-solid fa-forward"></i>
            Continue
          </button>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>

</style>