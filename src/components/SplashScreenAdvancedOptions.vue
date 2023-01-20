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
          data-bs-target="#collapsibleOptions"
          aria-expanded="false" aria-controls="collapsibleOptions">
    <i class="fa-solid fa-circle-radiation"></i>
    Options
  </button>
  <div class="collapse p-0" id="collapsibleOptions">
    <div class="card card-body px-0" style="background-color: transparent">
      <div class="container splash-screen-advanced text-center">
        <div class="row row-cols-1 gy-3">
          <div class="col">
            <label class="form-label sokoban-label">Level password</label>
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
            <label class="form-label sokoban-label">Moves</label>
            <div class="input-group">
              <input type="text" class="form-control" placeholder="Insert moves code" aria-label="Moves code"
                     @change="notifyParent" v-model="movesCode">
              <button class="btn btn-outline-secondary" type="button" id="toastBtn"
                      style="background-color: var(--radioactive-color)"
                      :disabled="movesCode.length === 0">Insert
              </button>
            </div>
          </div>
          <div class="col-12">
            <label class="form-label sokoban-label">Create map</label>
            <button class="btn btn-outline-secondary mt-2" type="button" style="float: right"
                    @click="mapEditorToggle = !mapEditorToggle"
                    data-bs-toggle="modal" data-bs-target="#mapEditorModal">
              create
            </button>
            <div class="modal fade" id="mapEditorModal" tabindex="-1" role="dialog"
                 aria-labelledby="mapEditorModalLabel" aria-hidden="true">
              <MapEditor :toggle="mapEditorToggle" @save="mapEditorSaved"></MapEditor>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">

import {defineComponent} from 'vue';
import MapEditor from '@/components/MapEditor.vue';
import {mapStringToAction} from '@/game/constants/actions';

export default defineComponent({
  name: "SplashScreenAdvancedOptionsComponent",
  components: {MapEditor},
  emits: ["valid"],
  data() {
    return {
      mapEditorToggle: false,
      furthestLevelEnabled: 0,
      validLevelPassword: false,
      levelPassword: '',
      movesCode: ''
    };
  },
  watch: {
    movesCode() {
      this.notifyParent();
    }
  },
  methods: {
    parseMoves(movesText: string) {
      if (movesText) {
        if (movesText.length === 0) {
          return undefined;
        }
        return movesText.split('')
            .map(char => mapStringToAction(char));
      }
      return [];
    },
    mapEditorSaved(map: any) {
      console.log(map);
    },
    notifyParent() {
      // this.$emit('valid', true);
    },
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
.card-body {
  border: none;
}
.advanced-options-button {
  text-align: right;
  background-color: transparent;
  border-radius: 0;
  border: none;
  width: 100%;
}

.advanced-options-button:active, .advanced-options-button:focus, .advanced-options-button:focus-visible {
  background-color: transparent !important;
}

.advanced-options-button:hover {
}

.advanced-options-button:hover .fa-solid {
  color: var(--radioactive-color);
  transform: rotate(300deg) scale(1.25);
}

.fa-solid {
  transition: 0.45s ease-out;
}

</style>