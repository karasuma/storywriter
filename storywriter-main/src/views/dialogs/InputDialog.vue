<template>
    <teleport to="#modal-inputbox" v-if="inputMessage.visible">
        <div id="Input">
            <div class="wrapper">
                <div class="title">{{ inputMessage.title }}</div>
                <div class="contents">
                    <input type="text" v-model="inputMessage.defaultText"
                     placeholder="..." spellcheck="false" @keyup.enter="Confirm" />
                </div>
                <div class="buttons">
                    <div class="buttons__confirm" :class="{invisible: !showConfirm()}" @click="Confirm">Confirm</div>
                    <div class="buttons__cancel" @click="Cancel">Cancel</div>
                </div>
            </div>
        </div>
    </teleport>
</template>

<style lang="scss" scoped>
@import '@/views/css/dialog.scss';

#Input {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.4);
    z-index: calc( #{$Dialog-ZIndex} - 1 );

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

            & * {
                align-self: center;
                width: 100%;
                margin: 30px 0;
            }
            & input:hover {
                background-color: #ddd;
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
            &__confirm:hover {
                background-color: #a0d8ef; // 空色
            }
            &__cancel:hover {
                background-color: #c8c2c6; // 霞色
            }
        }
    }
}

.invisible {
    opacity: 0.6;
    background-color: #95949a;
    cursor: not-allowed;
    &:hover {
        background-color: #95949a;
    }
}
</style>

<script lang="ts">
import InputMessage from "@/logics/utils/input-message";
import { IStringResult } from "@/logics/utils/interfaces";
import { PropType } from "@vue/runtime-core";
import { Vue, Options } from "vue-class-component";

@Options({
    props: {
        result: {
            type: Function as PropType<IStringResult>,
            required: true
        },
        inputMessage: {
            type: InputMessage,
            required: true
        }
    },
    methods: {
        Confirm(): void {
            if(!this.showConfirm()) return;
            this.result(this.inputMessage.defaultText);
            this.inputMessage.defaultText = "";
            this.inputMessage.visible = false;
        },
        Cancel(): void {
            this.inputMessage.defaultText = "";
            this.inputMessage.visible = false;
        },
        showConfirm(): boolean {
            return this.inputMessage.defaultText.length > 0;
        }
    }
})

export default class InputDialog extends Vue {
    result!: IStringResult;
    inputMessage!: InputMessage;
}
</script>