<template>
  <div id="map-editor" class="modal-dialog modal-dialog-centered modal-lg" role="document">
    <div class="modal-content">
      <div class="modal-header" style="border: none">
        <h2 class="modal-title" style="font-family: 'Righteous', serif">Map editor</h2>
      </div>
      <div class="modal-body">
        <div class="row">
          <div class="col-12 mb-3">
            <label class="form-label sokoban-label">Title</label>
            <input type="text" class="form-control" placeholder="Title" v-model="title">
          </div>
          <div class="col-12 col-lg-4">
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
            <textarea :class="['form-control map-text-area', valid ? 'is-valid' : 'is-invalid']" rows="10"
                      v-model="codedMapText"></textarea>
            <div class="form-label feedback-label invalid-feedback" style="position:absolute;">
              {{ invalidError }}
            </div>
          </div>
          <div class="col-12 col-lg-6" style="text-align: left">
            <label class="form-label sokoban-label" style="float: none">
              Result
            </label>
            <div id="phaser-container">
              <PhaserContainer :playable="false" :render="render" :key="editorKey"/>
            </div>
            <div v-if="loading" style="position: absolute; top: 50%; left: 50%; color: var(--radioactive-color)"
                 class="spinner-border" role="status">
            </div>
          </div>
          <div class="col-12 col-lg-2" style="text-align: left;">
            <label class="form-label sokoban-label" style="float: none">
              Difficulty
            </label>
            <map-difficulty-gauge :estimative="estimative"></map-difficulty-gauge>
          </div>
        </div>
      </div>
      <div class="modal-footer" style="border: none">
        <button class="btn sokoban-outlined-button mt-4" type="button" data-bs-dismiss="modal">Close
        </button>
        <button class="btn btn-outline-secondary mt-4" type="button" id="toastBtn"
                @click="save"
                data-bs-dismiss="modal"
                :disabled="!valid"
                style="background-color: var(--radioactive-color); float: right">Save
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import type {StoredLevel} from '@/store';
import {Store} from '@/store';
import {defineComponent} from 'vue';
import {Tiles} from '@/game/tiles/tiles';
import {SokobanSolver} from '@/game/solver/sokoban-solver';
import PhaserContainer from '@/components/PhaserContainer.vue';
import MapDifficultyGauge from '@/components/MapDifficultyGauge.vue';
import type {ProcessedMap} from '@/game/tiles/sokoban-map-processor';
import {SokobanMapProcessor} from '@/game/tiles/sokoban-map-processor';
import {ManhattanDistanceCalculator} from '@/game/math/manhattan-distance-calculator';
import {StandardSokobanAnnotationTranslator} from '@/game/tiles/standard-sokoban-annotation-translator';
import {LevelDifficultyEstimator} from '@/game/solver/level-difficulty-estimator';

export default defineComponent({
  name: "MapEditor",
  components: {MapDifficultyGauge, PhaserContainer},
  props: ['toggle'],
  emits: ["save"],
  data() {
    const customLevel = Store.getInstance().getCustomLevel();
    Math.random();
    return {
      loading: false,
      title: customLevel?.level.title || this.createRandomTitle(),
      invalidError: '',
      render: false,
      valid: true,
      editorKey: 0,
      estimative: undefined as number | undefined,
      estimatedDifficulty: -1,
      codedMapText: customLevel?.level.map || '######\n#@   #\n# $ .#\n######',
      legendText: `
<h5>Instructions</h5>
<ul>
<li>Each text line represents a line in the map</li>
<li>Every feature is represented by a letter. Sometimes an orientation letter is needed</li>
<li>Use <b>[</b> and <b>]</b> to put multiple features in the same spot: <b>[ls.]</b>: left oriented spring (<b>ls</b>) on a target (<b>.</b>)</li>
<li>Number multiply next feature: <b>4$</b> means four boxes in a row. The same as <b>$$$$</b> </li>
</ul>

<h5>Features list</h5>
<ul>
<li><b>@</b> hero</li>
<li><b>$</b> box</li>
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
    const popoverTriggerList = document.querySelectorAll('[data-bs-toggle="popover"]');
    //@ts-ignore
    [...popoverTriggerList].map(popoverTriggerEl => new bootstrap.Popover(popoverTriggerEl));
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
    createRandomTitle() {
      const titles = ['mug tree nightmare', 'hairy keyboard', 'frozen rule'];
      return titles[Math.floor(Math.random() * titles.length)];
    },
    async refresh() {
      this.render = true;
      try {
        this.estimative = undefined;
        this.invalidError = '';
        this.valid = false;
        this.loading = true;
        const store = Store.getInstance();
        const map = new StandardSokobanAnnotationTranslator()
            .translate(this.codedMapText);
        const output = new SokobanMapProcessor(map)
            .strip([Tiles.hero, Tiles.box]);

        const newStoredLevel: StoredLevel = {
          bestTime: -1, index: -1, level: {
            title: this.title,
            map: this.codedMapText,
          },
          dynamicFeatures: output.removedFeatures,
          strippedLayeredTileMatrix: output.strippedLayeredTileMatrix
        };
        store.setCurrentStoredLevel(newStoredLevel);
        ++this.editorKey;
        this.loading = false;

        await this.validateMap(output);
        this.valid = true;
      } catch (exc: any) {
        this.estimative = undefined;
        this.invalidError = exc.message;
        this.valid = false;
      }
    },
    save() {
      this.$emit('save', {map: this.codedMapText, title: this.title});
    },
    async validateMap(output: ProcessedMap) {
      const heroNumber = output.removedFeatures.get(Tiles.hero)!.length;
      if (heroNumber > 1) {
        throw new Error('Map can only have one hero. Found: ' + heroNumber);
      } else if (heroNumber < 0) {
        throw new Error('Map has to have at least one hero');
      }
      const boxNumber = output.removedFeatures.get(Tiles.box)!.length;
      const targetNumber = output.pointMap.get(Tiles.target)!.length;
      if (boxNumber !== targetNumber) {
        throw new Error(`Number of boxes (${boxNumber}) different of number of targets (${targetNumber})`);
      }

      await this.tryToSolveMap(output);

      return true;
    },
    async tryToSolveMap(output: ProcessedMap) {
      const solver = new SokobanSolver({
        strippedMap: output.strippedLayeredTileMatrix,
        staticFeatures: output.pointMap,
        cpu: {
          sleepingCycle: 5000,
          sleepForInMs: 25
        },
        distanceCalculator: new ManhattanDistanceCalculator()
      });

      const solutionOutput = await solver.solve(output.removedFeatures);
      if (!solutionOutput.actions) {
        throw new Error('Map is not solvable');
      }

      this.estimative = new LevelDifficultyEstimator(solutionOutput).estimate();
    }

  }
});
</script>

<style scoped>
.modal-content {
  background-color: black;
  border: 1px solid var(--radioactive-color);
}

</style>