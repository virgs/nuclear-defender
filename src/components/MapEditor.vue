<template>
  <div class="row">
    <div class="col-12">
      <label class="form-label sokoban-label">
        Map editor
      </label>
    </div>
    <div class="col-12 col-lg-6">
      <label class="form-label sokoban-label">
        Map
        <i class="fa-regular fa-circle-question" data-bs-toggle="tooltip"
           data-bs-placement="right"
           data-bs-html="true"
           data-bs-custom-class="sokoban-tooltip"
           :data-bs-title="mapTooltipText"
        ></i>
      </label>
      <textarea class="form-control map-text-area" rows="10" v-model="codedMapText"></textarea>
    </div>
    <div class="col-12 col-lg-6">
      <label class="form-label sokoban-label">
        Render
      </label>
      <canvas>
      </canvas>
      <button class="btn btn-outline-secondary mt-4" type="button" id="toastBtn"
              @click="save"
              style="background-color: var(--radioactive-color); float: right">Save map
      </button>
    </div>
  </div>

</template>

<script lang="ts">

import {defineComponent} from 'vue';
import {defaultLevels} from '@/game/levels/defaultLevels';
import {mapStringToAction} from '@/game/constants/actions';

export default defineComponent({
  name: "MapEditor",
  emits: ["save"],
  props: ['visible'],
  data() {
    return {
      tmpThumbnailPath: defaultLevels[0].thumbnailPath,
      mapTooltipText: `'-': empty<br>
' ': floor<br>
'#': wall<br>
'.': target<br>
'$': box<br>
'*': boxOnTarget<br>
'@': hero<br>
'+': heroOnTarget`,
      codedMapText: '######\n#@   #\n# $ .#\n######',
    };
  },
  watch: {
    visible() {
      if (this.visible) {
        const canvas = document.getElementsByTagName('canvas')[0];
        const textArea = document.getElementsByTagName('textarea')[0];
        canvas.style.height = textArea.offsetHeight + 'px';
        canvas.style.width = '100%';

        const img = new Image();
        img.src = this.tmpThumbnailPath;
        img.onload = () => {
          const context = canvas.getContext('2d')!;
          canvas.style.backgroundColor = 'var(--foreground-color)';
          context.drawImage(img, 0, 0, 1500, 1880, 0, 0, canvas.clientHeight, canvas.clientWidth);
        };
      }

    },
  },
  methods: {
    save() {
      this.$emit('save', this.codedMapText);
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
  }
});
</script>

<style scoped>

</style>