<template>
  <!-- Teleport targets -->
  <KernelPanic />
  <div id="modal-inputbox"></div>
  <div id="modal-msgbox"></div>

  <!-- Main contents -->
  <div class="mainwrapper">
    <div class="header">
      <ControlView title="Storywriter - Create your awesome stories" />
    </div>

    <div class="contents">
      <div class="menu">
        <MenuView />
      </div>

      <div class="main">
        <StoryMainView />
      </div>
    </div>

    <div class="footer">
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import '@/views/css/base-design.scss';

body {
  background-color: $Base-Color;
}

.mainwrapper {
  & * {
    margin: 0;
    padding: 0;
  }

  & .header {
    min-width: 100%;
    position: absolute;
    left: 0;
    top: 0;
    z-index: 2;
    height: $Header-Height;
    background-color: $Header-Color;
  }

  & .contents {
    min-width: 100%;
    min-height: calc( 100% - #{$Footer-Height} * 3 );
    max-height: calc( 100% - #{$Footer-Height} * 3 );
    position: absolute;
    left: 0;
    top: $Header-Height;
    padding-bottom: $Footer-Height;
    background-color: $Content-BaseColor;
    display: flex;

    & .menu {
      background-color: $Content-BaseColor;
      width: $Menu-Width;
    }

    & .main {
      width: auto;
      overflow-x: hidden;
      overflow-y: scroll;
    }
  }

  & .footer {
    min-width: 100%;
    position: absolute;
    left: 0;
    bottom: 0;
    z-index: 1;
    height: $Footer-Height;
    background-color: #68be8d;
  }
}
</style>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';
import KernelPanic from './views/dialogs/KernelPanic.vue';
import ControlView from '@/views/controls/Control.vue';
import MenuView from '@/views/menu/Menu.vue';
import StoryMainView from './views/story/StoryMainView.vue';
import InputDialog from './views/dialogs/InputDialog.vue';
import MessageDialog from './views/dialogs/MessageDialog.vue';

@Options({
  components: {
    KernelPanic,
    InputDialog,
    MessageDialog,
    ControlView,
    MenuView,
    StoryMainView
  },
  methods: {

  }
})

export default class App extends Vue {
}

</script>