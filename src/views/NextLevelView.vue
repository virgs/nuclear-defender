<template>
  <main>
    <div class="toast-container position-fixed top-0 end-0 pt-3 disable-dbl-tap-zoom">
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
    <!--TODO add level thumbnail here?-->
    <div class="container my-5 next-level-view text-center">
      <div class="row row-cols-1 justify-content-end gy-3">
        <div class="col" style="text-align: center">
          <h1 class="sokoban-display display-3 fw-normal" style="user-select: none;">
            Level '{{ config.levelIndex }}' complete!</h1>
        </div>
        <div class="col my-1">
          <h4 class="sokoban-display fw-normal"
              style="user-select: none; color: var(--background-color); text-align: right">Total time:
            {{ Math.trunc(config.totalTime / 100) / 10 }}s
          </h4>
        </div>
        <div class="col-12" v-if="password">
          <label class="form-label sokoban-label">Password</label>
          <div class="input-group">
            <input type="text" class="form-control" readonly
                   :value="password">
            <button class="btn btn-outline-secondary toastBtn" type="button"
                    style="background-color: var(--radioactive-color)" @click="copy(password)">
              Copy
            </button>
          </div>
        </div>
        <div class="col-12">
          <label class="form-label sokoban-label">Player actions</label>
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
          <label class="form-label sokoban-label">Map</label>
          <div class="input-group">
            <textarea class="form-control map-text-area" readonly
                      v-model="codedMap" style="font-size: .9rem"
                      :rows="codedMap
                        .split('\n')
                        .filter(line => line.length > 0)
                        .length"
            ></textarea>
            <button class="btn btn-outline-secondary toastBtn" type="button"
                    style="background-color: var(--radioactive-color)" @click="copy(codedMap)">
              Copy
            </button>
          </div>
        </div>
        <div class="col-auto d-grid gap-2 my-5">
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

<script lang="ts">
import {defineComponent} from 'vue';
import {SessionStore} from '@/store/session-store';
import {mapActionToChar} from '@/constants/actions';
import {getAllLevels} from '@/levels/levels';
import {LongTermStore} from '@/store/long-term-store';

export default defineComponent({
  name: 'NextLevelView',
  data() {
    const config = SessionStore.getNextLevelViewConfig()!;
    console.log(config);
    return {
      config: config,
    };
  },
  mounted() {
    //@ts-ignore
    history.replaceState({urlPath: this.$router.currentRoute.fullPath}, '', '/nuclear-defender');

    const toastTriggers = document.getElementsByClassName('toastBtn');
    const toast = document.getElementById('copy-toast');
    if (toastTriggers) {
      Array.from(toastTriggers)
          .forEach(trigger => {
            // @ts-ignore
            trigger.addEventListener('click', () => new bootstrap.Toast(toast).show());
          });
    }
    if (!this.config.isCustomLevel) {
      console.log('Not a custom level');
      this.enableNextLevel();
    }
    window.addEventListener('keyup', this.keyPressed);
  },
  unmounted() {
    window.removeEventListener('keyup', this.keyPressed);
  },
  computed: {
    movesCode() {
      return this.config.movesCode
          .map(move => mapActionToChar(move))
          .join('');
    },
    password() {
      const currentIndex: number = this.config.levelIndex;
      if (!this.config.isCustomLevel) {
        const nextLevel = getAllLevels()[currentIndex];
        if (nextLevel) {
          return nextLevel.title.toLowerCase().replace(/ /g, '-');
        }
      }
      return undefined
    },
    codedMap() {
      return this.config.level.map
          .replace(/\n\n/g, '\n')
          .replace(/^\n/g, '');
    }
  },
  methods: {
    keyPressed(key: any) {
      if (key.code === 'Enter') {
        this.continueButton();
      }
    },
    async copy(text: string) {
      await navigator.clipboard.writeText(text);
    },
    storeRecord(): void {
      let levelCompleteData = LongTermStore.getLevelCompleteData();
      const previousCompletionData = levelCompleteData
          .find(data => data.index === this.config.levelIndex);
      const currentData = {
        map: this.codedMap,
        timestamp: new Date().getTime(),
        index: this.config.levelIndex,
        title: this.config.level.title,
        movesCode: this.config.movesCode,
        totalTime: this.config.totalTime
      };
      if (previousCompletionData) {
        if (previousCompletionData.totalTime > currentData.totalTime) {
          levelCompleteData = levelCompleteData
              .filter(data => data.index !== this.config.levelIndex);
          levelCompleteData.push(currentData);
          LongTermStore.setLevelCompleteData(levelCompleteData);

        }
      } else {
        levelCompleteData.push(currentData);
        LongTermStore.setLevelCompleteData(levelCompleteData);
      }
    },
    enableNextLevel() {
      this.storeRecord();
      const currentIndex: number = this.config.levelIndex;
      const numberOfEnabledLevels = LongTermStore.getNumberOfEnabledLevels();
      console.log(currentIndex, numberOfEnabledLevels, getAllLevels().length);

      if (currentIndex < getAllLevels().length - 2) { //There are still more levels to enable
        if (currentIndex === numberOfEnabledLevels - 1) {
          LongTermStore.setNumberOfEnabledLevels(currentIndex + 2);
        }
        console.log(`LongTermStore.setCurrentSelectedIndex(currentIndex + 1)`);
        LongTermStore.setCurrentSelectedIndex(currentIndex + 1);
      }
    },
    continueButton() {
      this.$router.push('/');
    }
  }

});


</script>

<style scoped>
.next-level-view {
  height: 99vh;
  max-width: 720px;
}

</style>