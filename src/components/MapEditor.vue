<template>
  <div id="map-editor" class="modal-dialog modal-dialog-centered modal-lg" role="document">
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

    <div class="modal-content">
      <div class="modal-header" style="border: none">
        <h2 class="modal-title" style="font-family: 'Righteous', serif">Map editor</h2>
      </div>
      <div class="modal-body">
        <div class="row">
          <div class="col-12 mb-4 order-1">
            <label class="form-label sokoban-label">Title</label>
            <input type="text" :class="['form-control', titleIsValid ? 'is-valid' : 'is-invalid']"
                   placeholder="Title" v-model="title">
            <div class="form-label feedback-label invalid-feedback" style="position:absolute;">
              Title is longer than 25 characters
            </div>
          </div>
          <div class="col-9 col-lg-5 order-2 mb-4">
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
            <textarea :class="['form-control map-text-area', mapIsValid ? 'is-valid' : 'is-invalid']" rows="9"
                      v-model="codedMapText"></textarea>
            <div class="form-label feedback-label invalid-feedback" style="">
              {{ editorInvalidError }}
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
            <div v-if="loading" style="position: absolute; top: 50%; left: 50%; color: var(--radioactive-color)"
                 class="spinner-border" role="status">
            </div>
          </div>
          <div class="col-3 col-lg-2 order-3 order-lg-4" style="text-align: left;">
            <label class="form-label sokoban-label" style="float: none">
              Difficulty
            </label>
            <map-difficulty-gauge :estimative="estimative"></map-difficulty-gauge>
          </div>

          <div v-if="title.toLowerCase() === 'mischief managed'" class="col-12 order-5">
            <label class="form-label sokoban-label">Marauder's map</label>
            <div class="input-group">
              <input type="text" class="form-control" readonly :value="stringActions">
              <button class="btn btn-outline-secondary copyToastBtn" type="button"
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
import type {Level} from '@/game/levels/levels';
import {LongTermStore} from '@/store/long-term-store';
import {mapActionToChar} from '@/game/constants/actions';
import {MapValidator} from '@/game/solver/map-validator';
import PhaserContainer from '@/components/PhaserContainer.vue';
import type {SolutionOutput} from '@/game/solver/sokoban-solver';
import MapDifficultyGauge from '@/components/MapDifficultyGauge.vue';
import type {ProcessedMap} from '@/game/tiles/sokoban-map-processor';
import {LevelDifficultyEstimator} from '@/game/solver/level-difficulty-estimator';

export default defineComponent({
  name: 'MapEditor',
  components: {MapDifficultyGauge, PhaserContainer},
  props: ['toggle'],
  emits: ['save'],
  data() {
    let customLevel = LongTermStore.getCustomLevel()!;
    if (!customLevel) {
      customLevel = this.createCustomLevel();
    }
    return {
      loading: false,
      title: customLevel.title,
      codedMapText: customLevel.map,
      scene: customLevel as Level,
      editorInvalidError: '',
      render: false,
      mapIsValid: true,
      solution: undefined as SolutionOutput | undefined,
      editorRefreshKey: 0,
      estimative: undefined as number | undefined,
      estimatedDifficulty: -1,
      legendText: `
<h5>Instructions</h5>
<ul>
<li>Each text line represents a line in the map</li>
<li>Every feature is represented by a letter. Sometimes an orientation letter is needed</li>
<li>Use <b>[</b> and <b>]</b> to put multiple features in the same spot: <b>[ls.]</b>: left oriented spring (<b>ls</b>) on a target (<b>.</b>)</li>
<li>Number multiply next feature: <b>4$</b> means four barrels in a row. The same as <b>$$$$</b> </li>
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
    const toastTriggers = document.getElementsByClassName('copyToastBtn');
    const toast = document.getElementById('copy-toast');
    if (toastTriggers) {
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
    titleIsValid() {
      return this.title.length < 25;
    },
    stringActions() {
      return (this.solution?.actions || [])
          .map(action => mapActionToChar(action))
          .join('');
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
          // const container = document.getElementById('phaser-container')!;
          // container.style.height = textArea.offsetHeight + 'px';
          // container.style.width = '100%';
          this.refresh();
          this.render = true;
        };
        setTimeout(adjustCanvasDimensions, 50); //it takes sometime until the container is rendered
      }
    },
    codedMapText() {
      this.refresh();
    },
  },
  methods: {
    copyStringActions() {
      navigator.clipboard.writeText(this.stringActions);
    },
    createCustomLevel() {
      const titles = ['mug tree nightmare', 'hairy keyboard', 'frozen rule'];
      const title = titles[Math.floor(Math.random() * titles.length)];
      return {
        title: title,
        map: '######\n#@   #\n# $ .#\n######',
      };
    },
    async refresh() {
      this.render = true;
      this.estimative = undefined;
      this.solution = undefined;
      this.editorInvalidError = 'Verifying solution';
      this.mapIsValid = false;
      this.loading = true;

      this.scene = {
        title: this.title,
        map: this.codedMapText
      };
      ++this.editorRefreshKey;
    },
    async processedMap(output: ProcessedMap) {
      this.loading = false;
      try {
        const solutionOutput = await new MapValidator().validate(output);
        this.solution = solutionOutput;
        this.estimative = new LevelDifficultyEstimator().estimate(solutionOutput);

        this.mapIsValid = true;
      } catch (exc: any) {
        console.error(exc)
        this.editorInvalidError = exc.message;
      }
    },
    saveButtonClick() {
      const canvas: any = document.querySelector('#phaser-container canvas')!;
      this.scene.snapshot = canvas.toDataURL();
      LongTermStore.setCustomLevel(this.scene);
      LongTermStore.setCurrentSelectedIndex(0);
      this.$emit('save', this.scene);
    },

  }
});
</script>

<style scoped>
.modal-content {
  background-color: black;
  border: 1px solid var(--radioactive-color);
}

</style>