<template>
    <teleport to="#modal-colorbox" v-if="showTrigger.visible">
        <div id="Color">
            <div class="wrapper">
                <div class="title">色の選択</div>
                <div class="contents">
                    <div class="contents__item" v-for="c in colors" :key="c"
                        :style="itemColor(c)" @click="colorClick(c)"></div>
                </div>
                <div class="buttons">
                    <div class="buttons__cancel" @click="reject()">Cancel</div>
                </div>
            </div>
        </div>
    </teleport>
</template>

<style lang="scss" scoped>
@import "@/views/css/dialog.scss";

#Color {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.4);
    z-index: calc( #{$Dialog-ZIndex} - 2 );

    & * {
        color: $Font-Color;
        @include non-user-select;
    }

    & .wrapper {
        margin: 30vh 25vw;
        border-radius: $Modal-Radius;
        background-color: $Background-Color;
        box-shadow: 0 0 16px 1px black;
        display: flex;
        flex-direction: column;
        justify-content: space-between;

        & .title {
            width: 100%;
            text-align: center;
            padding: 20px auto;
            font-size: 24px;
            font-weight: bold;
        }

        & .contents {
            width: 95%;
            margin: 0 auto;
            display: flex;
            border-top: solid 1px $Border-Color;
            border-bottom: solid 2px $Border-Color;

            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            align-items: flex-start;
            align-content: flex-start;
            &__item {
                margin: 10px;
                padding: 2px;
                @include square-size(48px);
                border: solid 3px $Border-Color;
                border-radius: 8px;
                &:hover {
                    border: solid 3px $Shadow-Color;
                }
            }
        }

        & .buttons {
            display: flex;
            justify-content: flex-end;
            width: 95%;

            $Button-TextSize: 14px;
            & * {
                margin: 6px 12px;
                width: calc( #{$Button-TextSize} * 6 );
                padding: 3px 12px;
                font-size: $Button-TextSize;
                font-weight: bold;
                border: solid 1px $Border-Color;
                border-radius: 2px;
                text-align: center;
                cursor: pointer;
            }
            &__cancel:hover {
                background-color: #c8c2c6; // 霞色
            }
        }
    }
}
</style>

<script lang="ts">
import { Defs } from '@/logics/models/defs';
import { IStringResult } from '@/logics/utils/interfaces';
import { PropType } from 'vue';
import { Vue, Options } from 'vue-class-component';
import ColorMessage from '@/logics/utils/color-message';

@Options({
    props: {
        result: {
            type: Function as PropType<IStringResult>,
            required: true
        },
        showTrigger: {
            type: ColorMessage,
            required: true
        }
    },
    methods: {
        itemColor(color: string): string {
            return `background-color: ${color};`;
        },
        reject(): void {
            this.showTrigger.visible = false;
        },
        colorClick(col: string): void {
            this.result(col);
            this.showTrigger.visible = false;
        }
    },
    computed: {
        colors: function(): Array<string> {
            const isDark = this.showTrigger.type == ColorMessage.Type.Dark;
            return isDark ? Defs.definedDarkColors : Defs.definedLightColors;
        }
    }
})

export default class ColorDialog extends Vue {
    result!: IStringResult;
    showTrigger!: ColorMessage;
}
</script>