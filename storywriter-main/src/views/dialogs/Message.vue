<template>
    <teleport to="#modal-msgbox">
        <div id="Message" v-show="isVisible">
            <div class="wrapper">
                <div class="title">{{ message.title }}</div>

                <div class="contents">
                    <div class="icon">
                        <img v-if="getImagePath" src="@/assets/info.png" />
                        <img v-else src="@/assets/alert.png" />
                    </div>
                    <div class="text">
                        <p>{{ message.message }}</p>
                    </div>
                </div>

                <div class="buttons">
                    <div class="buttons__confirm" @click="Confirm">YES!</div>
                    <div class="buttons__reject" :class="{invisible: !showNo()}" @click="Reject">No...</div>
                    <div class="buttons__cancel" :class="{invisible: !showCancel()}" @click="Cancel">Cancel</div>
                </div>
            </div>
        </div>
    </teleport>
</template>

<style lang="scss" scoped>
@import '@/views/css/dialog.scss';

#Message {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.4);
    z-index: $Dialog-ZIndex;

    & * {
        color: $Font-Color;
        @include non-user-select;
    }

    & .wrapper {
        margin: 22vh 25vw;
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
            }

            $Content-Margin: 25px;
            & .icon {
                flex-basis: 35%;
                & img {
                    margin: $Content-Margin;
                }
            }
            & .text {
                margin: auto $Content-Margin;
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
            &__reject:hover {
                background-color: #d69090; // 退紅
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
import { Options, Vue } from 'vue-class-component';
import SystemMessage from '@/logics/SystemMessage';
import IMessageResult from '@/logics/IMessageResult';
import { PropType } from 'vue';
import { ipcMain, ipcRenderer } from 'electron';

@Options({
    props: {
        message: {
            type: SystemMessage,
            required: true
        },
        result: {
            type: Function as PropType<IMessageResult>,
            required: true
        },
        strictly: {
            type: Boolean,
            default: false
        }
    },
    methods: {
        Confirm(): void {
            this.result(SystemMessage.MessageResult.OK);
        },
        Reject(): void {
            if(!this.showNo()) this.result(SystemMessage.MessageResult.None);
            else this.result(SystemMessage.MessageResult.No);
            this.isVisible = false;
        },
        Cancel(): void {
            if(!this.showCancel()) this.result(SystemMessage.MessageResult.None);
            else this.result(SystemMessage.MessageResult.Cancel);
            this.isVisible = false;
        },
        showNo(): boolean {
            return this.message.status != SystemMessage.MessageType.Info;
        },
        showCancel(): boolean {
            return this.message.status != SystemMessage.MessageType.Info && !this.strictly;
        }
    },
    computed: {
        getImagePath(): boolean {
            const isInfo = this.message.status == SystemMessage.MessageType.Info;
            const isNormal = this.message.status == SystemMessage.MessageType.Normal;
            return isInfo || isNormal;
        }
    }
})

export default class Message extends Vue {
    isVisible = false;
    message!: SystemMessage;
    result!: IMessageResult;
    strictly!: boolean;

    mounted(): void {
        ipcRenderer.on('messagebox-relay', () => {
            this.isVisible = true;
        });
    }
}
</script>