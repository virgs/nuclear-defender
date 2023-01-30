<script lang="ts">
import {defineComponent} from 'vue';
import {SessionStore} from '@/store/session-store';
import {EventEmitter, EventName} from '@/events/event-emitter';
import PhaserContainer from '../components/PhaserContainer.vue';
import DirectionalButtons from '../components/DirectionalButtons.vue';

export default defineComponent({
  name: 'GameView',
  components: {PhaserContainer, DirectionalButtons},
  data() {
    const gameViewConfig = SessionStore.getGameViewConfig()!;
    return {
      totalTime: 0,
      startTime: Date.now(),
      playerActions: gameViewConfig.playerInitialActions,
      display: gameViewConfig.display,
      levelIndex: gameViewConfig.levelIndex,
      customLevel: gameViewConfig.isCustom,
      confirmationButton: undefined as any,
      smallScreenDisplay: true,
      scene: gameViewConfig.level,
      componentKey: 0,
      render: false,
      timer: -1,
    };
  },
  mounted() {
    //@ts-ignore
    history.replaceState({urlPath: this.$router.currentRoute.fullPath}, '', '/nuclear-defender');
    EventEmitter
        .listenToEvent(EventName.RESTART_LEVEL, () => this.resetClick());
    EventEmitter
        .listenToEvent(EventName.QUIT_LEVEL, () => this.exitClick());

    const interval = 100;
    this.timer = setInterval(() => {
      this.totalTime = Date.now() - this.startTime;
    }, interval);

    const container = document.getElementById('phaser-container')!;
    this.smallScreenDisplay = container.clientWidth <= 992 / 2; //half of bootstrap 'lg' breakpoint
    this.render = true;
    this.forceRerender();
  },
  unmounted() {
    clearInterval(this.timer);
  },
  methods: {
    forceRerender() {
      this.componentKey += 1;
    },
    resetClick() {
      this.forceRerender();
      this.totalTime = 0;
    },
    undoClick() {
      EventEmitter.emit(EventName.UNDO_BUTTON_CLICKED);
    },
    exitClick() {
      this.$router.push('/');
    }
  }
});

</script>

<template>
  <div class="container game-view text-center px-0 mx-auto">
    <div class="row align-items-center mx-0" style="max-width: 100vw">
      <div class="col-12 pt-2 px-4" id="game-view-title-id" style="text-align: left">
        <h1 class="sokoban-display display-6 fw-normal" style="user-select: none">
          {{ display }}: {{ scene.title }}
        </h1>
      </div>
      <div class="col-12 px-4" id="game-view-time-id">
        <h3 style="text-align: left; font-family: 'Poppins', serif; font-size: 1.5em">
          {{ Math.trunc(totalTime / 1000) }}s
        </h3>
      </div>
      <div class="row mx-auto px-0">
        <div class="col-12 col-md-8 col-lg-12 px-0" id="phaser-container">
          <PhaserContainer :render="render" :key="componentKey" :playable="true" :scene="scene"
                           :playerInitialActions="playerActions" :display-number="display"
                           :level-index="levelIndex"
                           :custom-level="customLevel"/>
        </div>

        <div class="col-12 col-md-4 col-lg-12 pt-4 pt-md-0 px-1" id="game-view-buttons">
          <div class="row mx-2" id="gameview-buttons-container">
            <div class="col-12">
              <div class="row justify-content-center mt-2">
                <div class="col-auto col-lg-3 d-grid gap-2">
                  <button class="btn btn-primary sokoban-outlined-button"
                          data-bs-toggle="modal" data-bs-target="#confirmation-modal"
                          @click="confirmationButton = exitClick" type="button">
                    <span>
                      <i class="fa-solid fa-door-open"></i>
                    </span>
                    <span v-if="!smallScreenDisplay" class="mx-2">QUIT</span>
                  </button>
                </div>
                <div class="col-auto col-lg-3 d-grid gap-2">
                  <button class="btn btn-primary sokoban-outlined-button"
                          data-bs-toggle="modal" data-bs-target="#confirmation-modal"
                          @click="confirmationButton = resetClick" type="button">
                    <span>
                      <i class="fa-solid fa-circle-xmark"></i>
                    </span>
                    <span v-if="!smallScreenDisplay" class="mx-2">RESTART</span>
                  </button>
                </div>
                <div class="col-auto col-lg-3 d-grid gap-2">
                  <button class="btn btn-primary sokoban-call-for-action-button"
                          @click="undoClick"
                          type="button">
                    <span>
                      <i class="fa-solid fa-delete-left"></i>
                    </span>
                    <span v-if="!smallScreenDisplay" class="mx-2">UNDO</span>
                  </button>
                </div>
              </div>
            </div>
            <DirectionalButtons class="col-12 align-self-end mb-4" v-if="smallScreenDisplay"/>
          </div>
        </div>
      </div>
    </div>
    <!-- Modal -->
    <div class="modal fade" id="confirmation-modal" tabindex="-1" aria-labelledby="confirmationModalLabel"
         aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h1 class="modal-title fs-5">Are you sure?</h1>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-primary sokoban-outlined-button" data-bs-dismiss="modal">No</button>
            <button type="button" class="btn btn-primary sokoban-call-for-action-button" data-bs-dismiss="modal"
                    @click="confirmationButton()">Yes
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>

.modal-header, .modal-footer {
  border: none;
}

.modal-content {
  background-color: black;
  border: 1px solid var(--radioactive-color);
}

</style>
