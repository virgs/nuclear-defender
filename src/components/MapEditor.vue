<template>
  <div id="map-editor" class="modal-dialog modal-dialog-centered modal-lg" role="document">
    <div class="modal-content">
      <div class="modal-header" style="border: none">
        <h2 class="modal-title">Map editor</h2>
      </div>
      <div class="modal-body">
        <div class="row">
          <div class="col-12 mb-3">
            <label class="form-label sokoban-label">Level title</label>
            <input type="text" class="form-control" placeholder="Title" v-model="title">
          </div>
          <div class="col-12 col-lg-6">
            <label class="form-label sokoban-label">
              Code
              <i class="fa-regular fa-circle-question" data-bs-toggle="tooltip"
                 data-bs-placement="right"
                 data-bs-html="true"
                 data-bs-custom-class="sokoban-tooltip"
                 :data-bs-title="mapTooltipText"
              ></i>
            </label>
            <textarea :class="['form-control map-text-area', valid ? 'is-valid' : 'is-invalid']" rows="10"
                      v-model="codedMapText"></textarea>
            <div class="form-label feedback-label invalid-feedback">
              {{ invalidError }}
            </div>
          </div>
          <div class="col-12 col-lg-6" style="text-align: left">
            <label class="form-label sokoban-label" style="float: none">
              Render
            </label>
            <div id="phaser-container">
              <PhaserContainer :playable="false" :render="render" :key="editorKey"/>
            </div>
            <div v-if="loading" style="position: absolute; top: 50%; left: 50%; color: var(--radioactive-color)"
                 class="spinner-border" role="status">
            </div>
          </div>
        </div>
      </div>
      <div class="modal-footer" style="border: none">
        <button class="btn sokoban-outlined-button mt-4" type="button" data-bs-dismiss="modal">Close
        </button>
        <button class="btn btn-outline-secondary mt-4" type="button" id="toastBtn"
                @click="save"
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
import PhaserContainer from "@/components/PhaserContainer.vue";
import type {ProcessedMap} from '@/game/tiles/sokoban-map-processor';
import {SokobanMapProcessor} from '@/game/tiles/sokoban-map-processor';
import {StandardSokobanAnnotationTranslator} from '@/game/tiles/standard-sokoban-annotation-translator';
import {SokobanSolver} from '@/game/solver/sokoban-solver';
import {ManhattanDistanceCalculator} from '@/game/math/manhattan-distance-calculator';
import {Actions, mapActionToChar} from '@/game/constants/actions';

export default defineComponent({
  name: "MapEditor",
  components: {PhaserContainer},
  props: ['toggle'],
  emits: ["save"],
  data() {
    return {
      loading: false,
      title: ['Mouse user nightmare'][0],
      invalidError: '',
      render: false,
      valid: true,
      editorKey: 0,
      mapTooltipText: `'-': empty<br>
' ': floor<br>
'#': wall<br>
'.': target<br>
'$': box<br>
'@': hero<br>
's': spring*<br>
't': treadmill*<br>
'w': one way door*<br>
'o': oily floor<br>
* require preceeding orientation letter (us: up spring):<br>
'u': up<br>
'l': left<br>
'd': down<br>
'r': right<br>
<br>Use [ and ] to put multiple features in the same spot: [us.]: target on an up oriented spring.
<br>Number multiply next feature
`,
      codedMapText: '######\n#@   #\n# $ .#\n######',
    };
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
    async refresh() {
      this.render = true;
      try {
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
      const data = {
        ...solutionOutput,
        actions: solutionOutput.actions
            ?.map((action: Actions) => mapActionToChar(action))
            .join('')
      };
      if (!solutionOutput.actions) {
        throw new Error('Map is not solvable');
      }
      console.log(data);
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