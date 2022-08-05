<template>
    <div class="control">
        <Message :isVisible="msgboxVisible" :message="msg" :result="messageBoxResult" :strictly="true" />
        <div class="action">
            <img src="../../assets/dark/config.png" class="selectable" />
            <img src="../../assets/dark/save.png" class="selectable" />
            <img src="../../assets/dark/home.png" class="selectable" />
        </div>

        <div class="title" :title="title"><p>{{ title }}</p></div>

        <div class="window">
            <div class="selectable window__minimum" @click="minimize">－</div>
            <div class="selectable window__maximum" @click="maximize">□</div>
            <div class="selectable window__close" @click="close">×</div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
@import '@/views/css/base-design.scss';

.control {
    background-color: $Header-Color;
    @include non-user-select;

    & .action {
        position: absolute;
        left: 0;
        top: 0;
        height: $Header-Height;
        display: flex;
        cursor: pointer;

        & img {
            height: calc( #{$Header-Height} - 8px );
            margin: 0 6px;
            margin-top: 4px;
            cursor: pointer;
        }
    }

    & .title {
        -webkit-app-region: drag;
        position: absolute;
        left: calc( #{$Header-Height} * 3 + 20px );
        top: 0;
        // 60px: margin of 3 actions(20px) + 3 window controls padding & margin(106px)
        width: calc( 100% - #{$Header-Height} * 6 - 126px );
        height: $Header-Height;

        & p {
            @include hide-overflow-text;
            transform: translate(0, 50%);
            width: 100%;
            text-align: center;
        }
    }

    & .window {
        position: absolute;
        right: 0;
        top: 0;
        display: flex;
        height: $Header-Height;

        & * {
            font-size: calc( #{ $Header-Height - 10px } );
            padding: 0 16px;
            cursor: pointer;
            pointer-events: auto;
            &:hover {
                background-color: $Base-Color;
            }
        }
        &__close {
            background-color: crimson;
            color: white;
            height: 100%;
            &:hover {
                background-color: crimson;
            }
        }
    }
}
</style>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';
import { ipcRenderer } from 'electron';
import SystemMessage from '@/logics/SystemMessage';
import Message from '@/views/dialogs/Message.vue';

@Options({
    components: {
        Message
    },
    props: {
        title: {
            type: String,
            required: true
        }
    },
    methods: {
        close: function() {
            this.msg = new SystemMessage("確認", "セーブして終了しますか？", SystemMessage.MessageType.Normal);
            this.msgboxVisible = true;
        },
        minimize: function() {
            ipcRenderer.send('minimize');
        },
        maximize: function() {
            ipcRenderer.send('maximize');
        },
        messageBoxResult: function(result: number): void {
            if(result == SystemMessage.MessageResult.None) return;
            if(result == SystemMessage.MessageResult.OK) {
                ipcRenderer.send('close');
            }
            this.msgboxVisible = false;
            console.log(`result: ${result}`);
        }
    }
})

export default class Control extends Vue {
    title = "x";
    msgboxVisible = false;
    msg = new SystemMessage();
}
</script>
