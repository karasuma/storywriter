<template>
    <div id="KernelPanic" v-show="isVisible">
        <div class="wrapper">
            <div class="title">{{ title }}</div>
            <div class="message"><p>{{ message }}</p></div>
            <div class="button">
                <div class="button__confirm" @click="Exit">Got it.</div>
            </div>
        </div>
    </div>
</template>

<style lang="scss">
@import '@/views/css/dialog.scss';

$Border-Alert-Color: #833;

#KernelPanic {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(50, 0, 0, 0.4);

    // 42: Answer to the Ultimate Question of Life, the Universe, and Everything
    z-index: calc( #{$Dialog-ZIndex} + 42 );

    & * {
        color: $Font-Color;
        @include non-user-select;
    }

    & .wrapper {
        margin: 22vh 22vw;
        border-radius: $Modal-Radius;
        background-color: $Background-Color;
        box-shadow: 0 0 16px 1px black;
        display: flex;
        flex-direction: column;
        justify-content: space-between;

        & .title {
            width: 95%;
            text-align: center;
            margin: 20px auto;
            font-size: 32px;
            font-weight: bold;
            color: $Font-Alert-Color;
            @include hide-overflow-text;
        }

        & .message {
            width: 95%;
            margin: 0 auto;
            padding: 5vh 0;
            display: flex;
            font-size: 24px;
            border-top: solid 1px $Border-Alert-Color;
            border-bottom: solid 2px $Border-Alert-Color;

            & p {
                overflow-y: scroll;
                max-height: 30vh;
                width: 95%;
                margin: 0 auto;
            }
        }

        & .button {
            width: 95%;
            $Button-TextSize: 14px;
            &__confirm {
                margin: 12px 15%;
                padding: 3px;
                text-align: center;
                font-size: 16px;
                font-weight: bold;
                border: solid 1px $Border-Alert-Color;
                &:hover {
                    background-color: #f2a0a1;
                    cursor: pointer;
                }
            }
        }
    }
}
</style>

<script lang="ts">
import { IpcUtils } from '@/logics/utils/ipc-utils'
import { Options, Vue } from 'vue-class-component'

@Options({
    methods: {
        Exit(): void {
            IpcUtils.Send("close");
        }
    }
})

export default class KernelPanic extends Vue {
    isVisible = false;
    title = "";
    message = "";

    mounted(): void {
        IpcUtils.Receive(IpcUtils.GenRelayedChannel("KernelPanic"), (_, arg) => {
            const params = arg as string[];
            this.title = params[0];
            this.message = params[1];
            this.isVisible = true;
            console.log("Kernel Panic");
        })
    }
}
</script>