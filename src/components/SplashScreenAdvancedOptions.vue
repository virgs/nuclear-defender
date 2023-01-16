<template>
  <div class="toast-container position-fixed top-0 end-0 p-3">
    <div id="toast" class="toast" role="alert"
         style="background-color: transparent"
         aria-live="assertive" aria-atomic="true" data-bs-delay="2500">
      <div class="d-flex sokoban-toast" :style="toastStyle">
        <div class="toast-body">
          {{ toastBodyTextName }}
        </div>
        <button type="button" class="btn-close me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
    </div>
  </div>
  <button class="btn btn-primary advanced-options-button" type="button" data-bs-toggle="collapse"
          data-bs-target="#collapseExample"
          aria-expanded="false" aria-controls="collapseExample">
    <i class="fa-solid fa-circle-radiation"></i>
    Options
  </button>
  <div class="collapse p-0" id="collapseExample">
    <div class="card card-body px-0" style="background-color: transparent">
      <div class="container splash-screen-advanced text-center">
        <div class="row row-cols-1 justify-content-center gy-3">
          <div class="col">
            <label class="form-label sokoban-label">Enter level password</label>
            <div class="input-group">
              <input type="text" class="form-control" placeholder="Level password" aria-label="Level password"
                     @change="notifyParent" v-model="levelPassword">
              <button class="btn btn-outline-secondary" type="button" id="toastBtn"
                      style="background-color: var(--radioactive-color)"
                      :disabled="levelPassword.length === 0">Check
              </button>
            </div>
          </div>
          <div class="col">
            <label class="form-label sokoban-label">Moves code</label>
            <input type="text" class="form-control" placeholder="Level password" aria-label="Moves code"
                   @change="notifyParent" v-model="movesCode">
          </div>
          <div class="col">
            <label class="form-label sokoban-label">
              Design your own map
              <i class="fa-regular fa-circle-question" data-bs-toggle="tooltip"
                 data-bs-placement="right"
                 data-bs-html="true"
                 data-bs-custom-class="sokoban-tooltip"
                 :data-bs-title="mapTooltipText"
              ></i>
            </label>
            <textarea class="form-control map-text-area" rows="10" v-model="codedMapText"
                      @change="() => notifyParent()"></textarea>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">

import {mapStringToAction} from "@/game/constants/actions";
import {defineComponent} from 'vue';

export default defineComponent({
  name: "SplashScreenAdvancedOptionsComponent",
  emits: ["valid"],
  data() {
    return {
      mapTooltipText: `'-': empty<br>
' ': floor<br>
'#': wall<br>
'.': target<br>
'$': box<br>
'*': boxOnTarget<br>
'@': hero<br>
'+': heroOnTarget`,
      furthestLevelEnabled: 0,
      validLevelPassword: false,
      levelPassword: '',
      codedMapText: '',
      movesCode: ''
    };
  },
  watch: {
    codedMapText() {
      this.notifyParent()
    },
    movesCode() {
      this.notifyParent()
    }
  },
  methods: {
    notifyParent() {
      // this.$emit('valid', true);
    },
    //TODO check if it's solvable, compare box and target numbers, check if there's only one hero...
    validateMap(map: string) {
      return true;
    },
    parseMoves(movesText: string) {
      if (movesText) {
        if (movesText.length === 0) {
          return undefined;
        }
        return movesText.split('')
            .map(char => mapStringToAction(char));
      }
      return [];
    }

  },
  computed: {
    toastBodyTextName(): any {
      return this.validLevelPassword ? 'Good job!' : 'Wrong level password. Try again.';
    },
    toastStyle(): any {
      return this.validLevelPassword ? {
        'background-color': 'var(--highlight-color)',
        'color': 'var(--foreground-color)'
      } : {
        'background-color': 'var(--danger-color)',
        'color': 'var(--background-color)'
      };
    }

  }
});
</script>

<style scoped>
.advanced-options-button {
  background-color: transparent;
  border-radius: 0;
  border: none;
  text-align: left;
  width: 100%;
}

.advanced-options-button:active, .advanced-options-button:focus, .advanced-options-button:focus-visible {
  /*border-bottom: 1px solid var(--highlight-color);*/
  background-color: transparent !important;
}

.advanced-options-button:hover {
  /*border-bottom: 1px solid var(--background-color);*/
}

.fa-solid {
  transition: 0.45s ease-out;
}

.advanced-options-button:hover .fa-solid {
  transform: rotate(300deg);
}

</style>