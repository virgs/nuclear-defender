<template>
  <div id="map-editor" class="modal-dialog modal-dialog-centered modal-lg" role="document">
    <div class="toast-container position-fixed top-0 end-0 pt-3">
      <div id="copy-toast" class="toast" role="alert" style="background-color: transparent"
           aria-live="assertive" aria-atomic="true" data-bs-delay="2500">
        <div class="d-flex sokoban-toast">
          <div class="toast-body">
            You little rascal.
          </div>
          <button type="button" class="btn-close me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
      </div>
    </div>

    <div class="modal-content">
      <div class="modal-header" style="border: none">
        <h2 class="modal-title" style="font-family: 'Righteous', serif">Map editor</h2>
      </div>
      <div class="modal-body mb-lg-5">
        <div class="row">
          <div class="col-12 mb-4 order-1">
            <label class="form-label sokoban-label">Title</label>
            <input type="text" :class="['form-control', titleIsValid ? 'is-valid' : 'is-invalid']"
                   placeholder="Title" v-model="title" spellcheck="false">
            <div class="form-label feedback-label invalid-feedback" style="">
              Title is longer than 25 characters
            </div>
          </div>
          <div class="col-8 col-lg-5 order-2 mb-4">
            <label class="form-label sokoban-label">
              Editor
              <a tabindex="0" class="btn btn-lg btn-danger px-1" role="button" data-bs-toggle="popover"
                 style="background-color: transparent; border: none"
                 title="Dismissible popover"
                 data-bs-trigger="focus"
                 :data-bs-html="true"
                 :data-bs-content="legendText">
                <i class="fa-regular fa-circle-question" style="color: var(--radioactive-color)"></i>
              </a>
            </label>
            <div style="display: inline-block">
              <textarea :class="['form-control map-text-area', mapIsValid ? 'is-valid' : 'is-invalid']" rows="10"
                        spellcheck="false"
                        @change="replaceCodeTokens"
                        id="map-editor-text-area" style="font-size: .9rem"
                        v-model="codedMapText"></textarea>
              <small class="cursor-position">{{ cursorPotision.y }}:{{ cursorPotision.x }}</small>
              <div class="form-label feedback-label invalid-feedback" style="">
                {{ editorInvalidError }}
              </div>
            </div>
          </div>
          <div class="col-12 col-lg-5 order-4 order-lg-3" style="text-align: left">
            <label class="form-label sokoban-label" style="float: none">
              Result
            </label>
            <div id="phaser-container">
              <PhaserContainer :playable="false" :render="render"
                               :key="editorRefreshKey" :scene="scene"
                               @processedMap="processedMap"/>
            </div>
            <div v-if="loading" :style="loadingStyle"
                 class="spinner-border" role="status">
            </div>
          </div>
          <div class="col-4 col-lg-2 order-3 order-lg-4" style="text-align: left;">
            <label class="form-label sokoban-label" style="float: none">
              Difficulty
            </label>
            <map-difficulty-gauge :estimative="estimative" :toggle="toggle"></map-difficulty-gauge>
          </div>

          <div v-show="maraudersMapEnabled" class="col-12 order-5 mt-5">
            <label class="form-label sokoban-label">Marauder's map</label>
            <div class="input-group">
              <input type="text" class="form-control" readonly :value="stringActions">
              <button class="btn btn-outline-secondary copyToastBtn" type="button"
                      :disabled="!stringActions || stringActions.length <= 0"
                      style="background-color: var(--radioactive-color)" @click="copyStringActions">
                Copy
              </button>
            </div>
          </div>

        </div>
      </div>
      <div class="modal-footer" style="border: none">
        <button class="btn sokoban-outlined-button mt-4" type="button" data-bs-dismiss="modal">Close
        </button>
        <button class="btn btn-outline-secondary mt-4" type="button" id="toastBtn"
                @click="saveButtonClick"
                data-bs-dismiss="modal"
                :disabled="!titleIsValid || !mapIsValid"
                style="background-color: var(--radioactive-color); float: right">Save
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import {Point} from '../math/point';
import {LongTermStore} from '../store/long-term-store';
import {mapActionToChar} from '../constants/actions';
import type {Level} from '../levels/availableLevels';
import {MapValidator} from '../levels/map-validator';
import {EventEmitter, EventName} from '../events/event-emitter';
import {CursorLocalizer} from '../levels/cursor-localizer';
import PhaserContainer from '../components/PhaserContainer.vue';
import MapDifficultyGauge from '../components/MapDifficultyGauge.vue';
import type {ProcessedMap} from '../levels/sokoban-map-stripper';
import {LevelDifficultyEstimator} from '../solver/level-difficulty-estimator';

export default defineComponent({
  name: 'MapEditor',
  components: {MapDifficultyGauge, PhaserContainer},
  props: ['toggle'],
  emits: ['save'],
  data() {
    const customLevel = LongTermStore.getCustomLevel()!;
    return {
      loading: false,
      title: customLevel.title,
      codedMapText: customLevel.map,
      scene: customLevel as Level,
      stringActions: customLevel.solution as string | undefined,
      estimative: customLevel.difficultyEstimative as number | undefined,
      editorInvalidError: '',
      render: false,
      mapIsValid: true,
      editorRefreshKey: 0,
      cursorPotision: new Point(0, 0),
      legendText: `
<h5>Instructions</h5>
<ul>
<li>Each text line represents a line in the map</li>
<li>Every feature is represented by a letter. Sometimes an orientation letter is needed</li>
<li>Use <b>[</b> and <b>]</b> to put multiple features in the same spot: <b>[ls.]</b>: left oriented spring (<b>ls</b>) on a target (<b>.</b>); and <b>[@.]</b>: hero positioned on a target.</li>
<li>Numbers multiply next feature: <b>4$</b> means four barrels in a row. The same as <b>$$$$</b> </li>
</ul>

<h5>Features list</h5>
<ul>
<li><b>@</b> hero</li>
<li><b>$</b> barrels</li>
<li><b>-</b> empty</li>
<li><b>&nbsp</b> floor</li>
<li><b>#</b> wall</li>
<li><b>.</b> target</li>
<li><b>o</b> oily floor</li>
<li><b>s</b> spring*</li>
<li><b>t</b> treadmill*</li>
<li><b>w</b> one way door*</li>
</ul>
<small>* require preceeding orientation<br>
<h5 class="mt-2">Orientation list</h5>
<ul>
<li><b>u</b> up</li>
<li><b>l</b> left</li>
<li><b>d</b> down</li>
<li><b>r</b> right</li>
</ul>
`,
    };
  },
  mounted() {
    window.addEventListener('keyup', () => this.updateCursorPosition());
    window.addEventListener('click', () => this.updateCursorPosition());

    const mapModal = document.getElementById('mapEditorModal')!;
    mapModal.addEventListener('show.bs.modal', () => {
      this.render = true;

      const customLevel = LongTermStore.getCustomLevel()!;
      this.codedMapText = customLevel.map;
      this.scene = customLevel;
      this.stringActions = customLevel.solution;
      this.estimative = customLevel?.difficultyEstimative;
    });
    mapModal.addEventListener('hide.bs.modal', () => {
      MapValidator.getInstance().abort();
    });

    const toastTriggers = document.getElementsByClassName('copyToastBtn');
    if (toastTriggers) {
      const toast = document.getElementById('copy-toast');
      Array.from(toastTriggers)
          .forEach(trigger => {
            // @ts-ignore
            trigger.addEventListener('click', () => new bootstrap.Toast(toast).show());
          });
    }
    const popoverTriggerList = document.querySelectorAll('[data-bs-toggle="popover"]');
    //@ts-ignore
    [...popoverTriggerList].map(popoverTriggerEl => new bootstrap.Popover(popoverTriggerEl));
  },
  computed: {
    loadingStyle() {
      return {
        position: 'absolute',
        top: '50%',
        left: '50%',
        color: !this.mapIsValid ? 'var(--danger-color)' : 'var(--radioactive-color)'
      };
    },
    titleIsValid() {
      return this.title.length < 25;
    },
    maraudersMapEnabled() {
      return this.title.toLowerCase() === 'mischief managed';
    }
  },
  watch: {
    toggle() {
      const modalIsBeingShown = document.getElementsByTagName('body')[0]!.classList.contains('modal-open');
      if (modalIsBeingShown) {
        const adjustCanvasDimensions = () => {
          const textArea = document.getElementsByTagName('textarea')[0];
          if (textArea.offsetHeight === 0) {
            return setTimeout(adjustCanvasDimensions, 50);
          }
          this.render = true;
          this.refresh();
        };
        setTimeout(adjustCanvasDimensions, 50); //it takes sometime until the container is rendered
      }
    },
    codedMapText() {
      this.estimative = undefined;
      this.refresh();
    }
  },
  methods: {
    replaceCodeTokens(text: string) {
      console.log(text, this.codedMapText)
    },
    copyStringActions() {
      navigator.clipboard.writeText(this.stringActions!);
    },
    refresh() {
      if (this.estimative !== undefined) {
        this.render = true;
        ++this.editorRefreshKey;
        return;
      }
      this.render = true;
      this.estimative = undefined;
      this.stringActions = undefined;
      this.editorInvalidError = 'Verifying solution. It may take a few minutes.';
      this.mapIsValid = false;
      this.loading = true;

      //@ts-ignore
      this.scene = {
        title: this.title,
        map: this.codedMapText
      };
      ++this.editorRefreshKey;
    },
    async processedMap(output: { processedMap: ProcessedMap, map: string, error: Error }) {
      if (this.estimative !== undefined) {
        this.mapIsValid = true;
        return;
      }
      this.loading = false;
      try {
        if (output.error) {
          throw output.error;
        }

        const solutionOutput = await MapValidator.getInstance().validate(output.processedMap);
        if (solutionOutput.aborted) {
          console.log('ignoring aborted');
          return;
        }
        this.estimative = new LevelDifficultyEstimator().estimate(solutionOutput);
        this.stringActions = solutionOutput.actions!
            .map(action => mapActionToChar(action))
            .join('');
        console.log('map validated');

        this.mapIsValid = true;
      } catch (exc: any) {
        this.editorInvalidError = exc.message;
      }
    },
    saveButtonClick() {
      const canvas: any = document.querySelector('#phaser-container canvas')!;
      this.scene.title = this.title;
      this.scene.snapshot = canvas.toDataURL();
      this.scene.difficultyEstimative = this.estimative!;
      this.scene.solution = this.stringActions!;
      LongTermStore.setCustomLevel(this.scene);
      LongTermStore.setCurrentSelectedIndex(0);
      this.$emit('save', this.scene);
    },
    updateCursorPosition() {
      const input = document.getElementById('map-editor-text-area');
      if (input) {
        //@ts-ignore
        const inputLinearChars = input.selectionStart;
        const cursor = new CursorLocalizer(inputLinearChars, this.codedMapText).localize();
        this.cursorPotision.y = cursor.y + 1;
        this.cursorPotision.x = cursor.x + 1;
        EventEmitter.emit(EventName.MAP_EDITOR_CURSOR_POSITION_CHANGED, cursor);
      }
    }
  }
});
</script>

<style scoped>
.modal-content {
  background-color: black;
  border: 1px solid var(--radioactive-color);
}

.cursor-position {
  position: absolute;
  font-family: 'Martian Mono', serif;
  font-weight: bolder;
  color: var(--background-color);
  top: -25px;
  right: 10px;
}
</style>