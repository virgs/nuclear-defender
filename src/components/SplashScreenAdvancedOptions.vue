<template>
  <!-- toast -->
  <div class="toast-container position-fixed top-0 end-0 p-3">
    <div id="password-toast" class="toast" role="alert"
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
  <!-- Modal -->
  <div class="modal fade" id="password-modal" tabindex="-1" aria-labelledby="passwordModalLabel"
       aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h1 class="modal-title fs-5">Enter password</h1>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <div class="input-group">
            <input type="text" class="form-control"
                   placeholder="Password"
                   v-model="levelPassword">
            <button class="btn btn-outline-secondary toastBtn" type="button"
                    :disabled="this.levelPassword.length <= 0"
                    @keyup.enter="checkPassword"
                    style="background-color: var(--radioactive-color)" @click="checkPassword">
              Check
            </button>
          </div>
        </div>
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
      <div class="container splash-screen-advanced px-0">
        <div class="row row-cols-1 gy-3">

          <div class="col-12 mb-4">
            <label class="form-label sokoban-label">Player initial actions
              <a tabindex="0" class="btn btn-lg btn-danger px-1"
                 role="button" data-bs-toggle="popover"
                 style="background-color: transparent; border: none"
                 title="Player initial actions"
                 data-bs-trigger="focus"
                 :data-bs-html="true"
                 :data-bs-content="actionsLegentText">
                <i class="fa-regular fa-circle-question" style="color: var(--radioactive-color)"></i>
              </a>
            </label>
            <input type="text" class="form-control" placeholder="Enter actions" aria-label="Insert player actions"
                   id="playerActionsInput"
                   :class="[invalidPlayerActionsError.length <= 0 ? 'is-valid' : 'is-invalid']"
                   v-model="playerActions">
            <div class="form-label feedback-label invalid-feedback" style="position:absolute;">
              {{ invalidPlayerActionsError }}
            </div>
          </div>

          <div class="col-12 col-lg-6">
            <button class="btn btn-outline-secondary options-buttons w-100" type="button"
                    data-bs-toggle="modal" data-bs-target="#password-modal">
              Check password
            </button>
          </div>
          <div class="col-12 col-lg-6">
            <button class="btn btn-outline-secondary options-buttons w-100" type="button"
                    @click="mapEditorToggle = !mapEditorToggle"
                    data-bs-toggle="modal" data-bs-target="#mapEditorModal">
              {{ customMapExists ? 'Edit' : 'Create' }} custom map
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
import type {Level} from '@/game/levels/defaultLevels';
import {DefaultLevels} from '@/game/levels/defaultLevels';
import MapEditor from '@/components/MapEditor.vue';
import {LongTermStore} from '@/store/long-term-store';
import {mapStringToAction} from '@/game/constants/actions';

export default defineComponent({
  name: 'SplashScreenAdvancedOptions',
  components: {MapEditor},
  emits: ['mapEditorSaved', 'passwordUnblockedNewLevels', 'advancedOptionsVisibilityChanged', 'playerActionsChanged'],
  data() {
    return {
      customMapExists: LongTermStore.getCustomLevel() !== undefined,
      mapEditorToggle: false,
      validLevelPassword: false,
      levelPassword: '',
      playerActions: '',
      actionsLegentText: `
      <h5>Instructions</h5>
<ul>
<li>Each letter represents a player action</li>
</ul>

<h5>Actions list</h5>
<ul>
<li><b>l</b> go left</li>
<li><b>r</b> go right</li>
<li><b>u</b> go up</li>
<li><b>d</b> go down</li>
<li><b>s</b> do nothing</li>
</ul>

<p>
So, by entering <b>druls</b>, as soon as the game begins, the player would follow this command, step by step:
<ol>
<li>go down</li>
<li>go right</li>
<li>go up</li>
<li>go left</li>
<li>do nothing</li>
</ol>

<small>PS: If you're wondering what's the pointing of having a feature like this. Bear in mind it's very useful to verify another player's "solution". If you know what I mean.</small>
</p>
`
    };
  },
  watch: {
    playerActions() {
      this.$emit('playerActionsChanged', this.invalidPlayerActionsError.length <= 0 ? this.playerActions : undefined);
    }
  },
  mounted() {
    const passwordModal = document.getElementById('password-modal')!;
    const mapModal = document.getElementById('mapEditorModal')!;
    mapModal.addEventListener('show.bs.modal', () => this.$emit('advancedOptionsVisibilityChanged', true));
    mapModal.addEventListener('hide.bs.modal', () => this.$emit('advancedOptionsVisibilityChanged', false));
    passwordModal.addEventListener('show.bs.modal', () => this.$emit('advancedOptionsVisibilityChanged', true));
    passwordModal.addEventListener('hide.bs.modal', () => this.$emit('advancedOptionsVisibilityChanged', false));

    const toastTriggers = document.getElementsByClassName('toastBtn');
    const toast = document.getElementById('password-toast');
    if (toastTriggers) {
      Array.from(toastTriggers)
          .forEach(trigger => {
            // @ts-ignore
            trigger.addEventListener('click', () => new bootstrap.Toast(toast).show());
          });
    }
  },
  methods: {
    mapEditorSaved(map: Level) {
      this.customMapExists = true;
      this.$emit('mapEditorSaved', map);
    },
    checkPassword() {
      const unblockedLevelIndex = DefaultLevels
          .findIndex((level: Level) => {
            return level.title
                .toLowerCase()
                .replace(/ /g, '-') === this.levelPassword.toLowerCase();
          });
      if (unblockedLevelIndex !== -1) {
        if (unblockedLevelIndex >= LongTermStore.getNumberOfEnabledLevels()) {
          LongTermStore.setNumberOfEnabledLevels(unblockedLevelIndex + 1);
        }
        this.validLevelPassword = true;
        this.$emit('passwordUnblockedNewLevels', unblockedLevelIndex);
        return;
      }
      this.validLevelPassword = false;
    }
  },
  computed: {
    toastBodyTextName(): any {
      return this.validLevelPassword ? 'Good job!' : 'Wrong password.';
    },
    toastStyle(): any {
      return this.validLevelPassword ? {
        'background-color': 'var(--radioactive-color)',
        'color': 'var(--foreground-color)'
      } : {
        'background-color': 'var(--danger-color)',
        'color': 'var(--background-color)'
      };
    },
    invalidPlayerActionsError(): string {
      if (this.playerActions.length > 0) {
        const split = this.playerActions
            .split('');
        const invalidIndex = split
            .findIndex(char => mapStringToAction(char) === undefined);
        if (invalidIndex !== -1) {
          return `Invalid action found (${split[invalidIndex]}) at index ${invalidIndex}`;
        }
      }
      return '';
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
}

.advanced-options-button:active, .advanced-options-button:focus, .advanced-options-button:focus-visible {
  background-color: transparent !important;
}

.advanced-options-button:hover {
  color: var(--radioactive-color);
}

.advanced-options-button:hover .fa-solid {
  color: var(--radioactive-color);
  transform: rotate(580deg) scale(1.5);
}

.modal-header, .modal-footer {
  border: none;
}

.modal-content {
  background-color: black;
  border: 1px solid var(--radioactive-color);
}

.fa-solid {
  transition: 0.45s ease-out;
}

.options-buttons {
  color: var(--background-color);
  background-color: var(--foreground-color);
}

.options-buttons:hover {
  background-color: var(--danger-color);
}
</style>