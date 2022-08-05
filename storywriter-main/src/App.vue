<template>
  <!-- Teleport targets -->
  <div id="modals"></div>

  <!-- Main contents -->
  <div class="mainwrapper">
    <div class="header">
      <Control title="Storywriter - Create your awesome stories" />
    </div>

    <div class="contents">
      <div class="menu">

      </div>

      <div class="main">
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
    min-width: 100%;
  }

  & .header {
    position: absolute;
    left: 0;
    top: 0;
    z-index: 2;
    height: $Header-Height;
    background-color: $Header-Color;
  }

  & .contents {
    position: absolute;
    left: 0;
    top: $Header-Height;
    bottom: $Footer-Height;
    padding-top: $Header-Height;
    padding-bottom: $Footer-Height;
    background-color: $Content-BaseColor;

    & .menu {
      width: $Menu-Width;
    }

    & .main {
      margin: 0;
      width: 100%;
      padding-top: $Header-Height;
      padding-bottom: $Footer-Height;
    }
  }

  & .footer {
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
import Control from '@/views/controls/Control.vue';

@Options({
  components: {
    Control,
  },
})

export default class App extends Vue { }

</script>