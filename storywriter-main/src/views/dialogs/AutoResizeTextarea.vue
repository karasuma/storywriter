<script lang="ts">
import { Vue, Options } from "vue-class-component";

@Options({
    props: {
        value: {
            type: String,
            default: ""
        },
        minHeight: {
            type: Number,
            default: 0
        }
    },
    methods: {
        resizeTextarea(): void {
            this.Resize();
        },
        emitTextarea(target: EventTarget): string {
            return (target as HTMLInputElement).value;
        }
    },
    watch: {
        value: function(newValue: string | undefined): void {
            if(newValue === undefined) return;
            this.Resize();
            this.localText = newValue;
        },
        localText: function(newValue: string): void {
            this.$emit('input', newValue);
        }
    },
    emits: ['input']
})

export default class AutoResizeTextarea extends Vue {
    value!: string;
    minHeight!: number;

    localText = "";
    textarea!: HTMLElement;
    clientHeight = -1;

    mounted(): void {
        this.$nextTick(function() {
            this.Resize();
        });
        this.localText = this.value;
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
        this.textarea.style.height = Math.max(sh, this.minHeight) + "px";
    }
}
</script>

<template>
    <textarea spellcheck="false" placeholder="..." style="height: 0px; resize: none;"
              @input.prevent="resizeTextarea" :ref="(el) => {textarea = el}"
              :value="localText" @input="$emit('input', emitTextarea($event.target))"></textarea>
</template>

<style lang="scss" scoped>
@import "@/views/css/base-design.scss";

textarea {
    width: 100%;
    background-color: $Content-BaseColor;
    cursor: text;
}

</style>