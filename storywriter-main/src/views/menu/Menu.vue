<template>
    <div id="Menu">
        <img class="selectable" src="@/assets/dark/edit.png" />
        <img class="selectable" src="@/assets/dark/calendar.png" />
        <img class="selectable" src="@/assets/dark/person.png" />
        <img class="selectable" src="@/assets/dark/chat.png" />
        <img class="selectable" src="@/assets/dark/world.png" />
        <img class="selectable" src="@/assets/dark/memo.png" />
    </div>
</template>

<style lang="scss" scoped>
@import '@/views/css/base-design.scss';

#Menu {
    background-color: $Base-Color;
    display: flex;
    flex-direction: column;
    height: 100%;
    border-right: solid 1px $Border-Color;

    & * {
        padding: 6px 4px;
        margin: 6px 0;
        width: calc( #{$Menu-Width} - 12px );
        cursor: pointer;
    }
    & *:first-child {
        opacity: 1;
        border-left: solid 2px orange;
    }
}
</style>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';

@Options({

})

export default class MenuView extends Vue { }
</script>