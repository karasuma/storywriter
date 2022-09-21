<template>
    <div id="Menu">
        <img @click="changeView(1)" :style="borderCss(1)" class="selectable" src="@/assets/dark/edit.png" />
        <img @click="changeView(2)" :style="borderCss(2)" class="selectable" src="@/assets/dark/calendar.png" />
        <img @click="changeView(3)" :style="borderCss(3)" class="selectable" src="@/assets/dark/person.png" />
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
        user-select: none;
        cursor: pointer;
    }
}
</style>

<script lang="ts">
import ViewSelection from '@/logics/models/view-selection';
import { Options, Vue } from 'vue-class-component';

@Options({
    props: {
        selection: {
            type: ViewSelection,
            required: true
        }
    },
    methods: {
        changeView(view: number): void {
            this.selection.ChangeCurrentView(view);
        },
        borderCss(view: number): string {
            if(view == this.selection.currentView) {
                return "opacity: 1; border-left: solid 2px orange;"
            }
            return ""
        }
    }
})

export default class MenuView extends Vue {
    selection!: ViewSelection;
}
</script>