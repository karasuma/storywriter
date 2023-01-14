<script lang="ts">
import { ChatTalker } from '@/logics/models/chat-data';
import { Options, Vue } from 'vue-class-component';

@Options({
    props: {
        text: {
            type: ChatTalker,
            required: true
        }
    },
    methods: {
        resizeTextarea(): void {
            this.Resize();
        }
    }
})

export default class ChatActorView extends Vue {
    text!: ChatTalker;

    innerText = "";
    textarea!: HTMLElement;
    clientHeight = -1;
    mounted(): void {
        this.innerText = this.text.text;
        this.$nextTick(function() {
            this.Resize();
        });
        window.addEventListener('resize', this.Resize);
    }
    beforeDestroy(): void {
        window.removeEventListener('resize', this.Resize);
    }

    public Resize(): void {
        if(this.clientHeight < 0) {
            this.clientHeight = this.textarea.clientHeight;
        }
        this.textarea.style.height = this.clientHeight + "px";
        const sh = this.textarea.scrollHeight;
        this.textarea.style.height = sh + "px";
    }
}
</script>

<template>
    <div class="chatitem">
        <div class="chatitem__arrow"></div>
        <textarea class="chatitem__text" spellcheck="false" placeholder="..." style="height: 0px;"
                  @input.prevent="resizeTextarea" :ref="(el) => {textarea = el}"
                  v-model="text.text"></textarea>
    </div>
</template>

<style lang="scss" scoped>
@import "@/views/css/base-design.scss";

.chatitem {
    background-color: $Base-Inv-Color;
    display: flex;
    flex-direction: row;
    align-items: center;
    background-color: transparent;
    height: auto;

    &__arrow {
        width: 0;
        height: 0;
        margin: 0;
        border-top: 0.9em solid transparent;
        border-right: 1em solid $Base-Inv-Color;
        border-bottom: 0.9em solid transparent;
    }
    &__text {
        background-color: $Base-Inv-Color;
        border-radius: 8px;
        border: none;
        outline: none;
        color: $Content-BaseColor;
        min-width: 50%;
        min-height: 1em;
        resize: none;
    }
}
</style>