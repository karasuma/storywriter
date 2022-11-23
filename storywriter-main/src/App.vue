<template>
  <!-- Teleport targets -->
  <KernelPanic />
  <div id="modal-imgviewer"></div>
  <div id="modal-inputbox"></div>
  <div id="modal-msgbox"></div>
  <div id="modal-colorbox"></div>

  <!-- Main contents -->
  <div class="mainwrapper">
    <div class="header">
      <ControlView :setting="vm.setting" />
    </div>

    <div class="contents" v-if="vm.setting.Visible">
      <SettingView :setting="vm.setting" />
    </div>
    <div class="contents" v-else>
      <div class="menu">
        <MenuView :vm="vm" />
      </div>

      <div class="main">
        <StoryMainView v-if="showMe(1)" :vm="vm" />
        <TimelineView v-if="showMe(2)" :vm="vm" />
        <DictionaryView v-if="showMe(3)" :vm="vm" />
        <ActorView v-if="showMe(4)" :vm="vm" />
        <ChatView v-if="showMe(5)" :vm="vm" />
        <WorldView v-if="showMe(6)" :vm="vm" />
        <MemoView v-if="showMe(7)" :vm="vm" />
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
      width: calc( 100vw - #{$Menu-Width} );
      overflow-x: hidden;
      overflow-y: hidden;
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
import { StoryWriterObjectSample } from './logics/models/storywriter-object';
import KernelPanic from './views/dialogs/KernelPanic.vue';
import ControlView from '@/views/controls/Control.vue';
import MenuView from '@/views/menu/Menu.vue';
import InputDialog from './views/dialogs/InputDialog.vue';
import MessageDialog from './views/dialogs/MessageDialog.vue';
import StoryMainView from './views/story/StoryMainView.vue';
import TimelineView from './views/timeline/TimelineView.vue';
import DictionaryView from './views/dictionary/DictionaryView.vue';
import ActorView from './views/actors/ActorView.vue';
import ChatView from './views/chat/ChatView.vue';
import WorldView from './views/world/WorldView.vue';
import MemoView from './views/memo/MemoView.vue';
import SettingView from './views/SettingView.vue';

@Options({
  components: {
    KernelPanic,
    InputDialog,
    MessageDialog,
    ControlView,
    MenuView,
    StoryMainView,
    TimelineView,
    DictionaryView,
    ActorView,
    ChatView,
    WorldView,
    MemoView,
    SettingView
  },
  methods: {
    showMe(view: number): boolean {
      return this.vm.currentView == view;
    }
  }
})

export default class App extends Vue {
  vm = new StoryWriterObjectSample()
}

</script>