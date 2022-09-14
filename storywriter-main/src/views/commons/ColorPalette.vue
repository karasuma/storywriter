<template>
    <div class="palette">
        <div class="palette__colors selectable"
             style="margin-bottom: 10px;"
             :style="isSelectedCss('transparent')" @click="changeColor('transparent')"></div>
        <div class="palette__colors selectable" v-for="col in colorlist" :key="col"
             :style="[backgroundColorCss(col), isSelectedCss(col)]" @click="changeColor(col)"></div>
    </div>
</template>

<style lang="scss" scoped>
@import "@/views/css/base-design.scss";

.palette {
    width: $Palette-Width;
    overflow: hidden;

    display: flex;
    flex-direction: column;

    &__colors {
        width: calc( #{$Palette-Width} - 25px );
        height: calc( #{$Palette-Width} - 25px );
        margin: 4px;
        border-radius: 20px;
        border: solid 2px $Border-Color;
    }
}
</style>

<script lang="ts">
import { Vue, Options } from 'vue-class-component';
import { Defs } from '@/logics/models/defs';
import { PropType } from '@vue/runtime-core';
import { IStringResult } from '@/logics/utils/interfaces';

@Options({
    props: {
        selectedColor: {
            type: Function as PropType<IStringResult>,
            required: true
        }
    },
    methods: {
        changeColor(color: string): void {
            this.currentColor = color;
            this.selectedColor(color);
        },
        backgroundColorCss(c: string): string {
            return `background-color: ${c};`;
        },
        isSelectedCss(c: string): string {
            if(c == this.currentColor) {
                return "opacity: 1;"
            }
            return "";
        }
    },
    computed: {
        colorlist: function(): string[] {
            const tgtcolors = Defs.definedLightColors;
            const colors = new Array<string>();
            tgtcolors.forEach(c => colors.push(c));
            return colors;
        }
    }
})

export default class ColorPalette extends Vue {
    selectedColor!: IStringResult;
    currentColor = "transparent";
}
</script>