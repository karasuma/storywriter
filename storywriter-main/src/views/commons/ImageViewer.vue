<script lang="ts">
import { Utils } from "@/logics/models/utils";
import ResourceViewer from "@/logics/utils/resource-viewer";
import { Options, Vue } from "vue-class-component";

@Options({
    props: {
        resource: {
            type: ResourceViewer,
            required: true,
        },
        expandRatio: {
            type: Number,
            default: 5
        },
        expandPower: {
            type: Number,
            default: 3
        }
    },
    methods: {
        closeButton: function() {
            this.resource.visible = false;
        },
        resize: function(event: WheelEvent) {
            const delta = event.deltaY * this.expandPower * this.resizeRatio;
            const next = Utils.clamp(this.currentSize - delta, 1, this.expandRatio);
            this.currentSize = next;

            this.resizing = true;
            this.dragging(event);
        },
        dragging: function(event: MouseEvent) {
            if(!this.pushing && !this.resizing) return;
            this.resizing = false;
            let iw = this.imageWidth;
            let ih = this.imageHeight;
            const hmax = Math.max( 0, -((window.outerWidth - (iw * this.currentSize)) / 2) );
            const vmax = Math.max( 0, -((window.outerHeight - (ih * this.currentSize)) / 2) );
            const nextX = this.deltaX + event.movementX * this.moveRatio;
            this.deltaX = Utils.clamp(nextX, -hmax, hmax);
            const nextY = this.deltaY + event.movementY * this.moveRatio;
            this.deltaY = Utils.clamp(nextY, -vmax, vmax);
        },
        resetSize: function(event: MouseEvent) {
            this.currentSize = 1;
            this.resizing = true;
            this.dragging(event);
        },
        changePushFlag: function(flag: boolean) {
            this.pushing = flag;
        }
    },
    computed: {
        resizeCss: function(): string {
            const scale = "scale(" + this.currentSize + ", " + this.currentSize + ")";
            return "transform: " + scale + ";";
        },
        moveCss: function(): string {
            const hori = Math.round(this.deltaX + this.offsetX) + "px";
            const vert = Math.round(this.deltaY + this.offsetY) + "px";
            return `top:${vert};left:${hori};`;
        }
    },
    watch: {
        'resource.visible': function(): void {
            if(this.resource.src.length == 0) return;
            this.initDeltaPosition();
        }
    }
})

export default class ImageViewer extends Vue {
    resource!: ResourceViewer;
    expandRatio!: number;
    expandPower!: number;

    currentSize = 1;
    resizeRatio = 0.001;
    moveRatio = 1;
    deltaX = 0;
    deltaY = 0;
    offsetX = 0;
    offsetY = 0;
    imageWidth = 0;
    imageHeight = 0;

    pushing = false;
    resizing = false;

    defaultFile: File | null = null;

    public getImageElement(): HTMLImageElement {
        return document.getElementById("ivewer") as HTMLImageElement;
    }

    public initDeltaPosition(): void {
        this.deltaX = 0;
        this.deltaY = 0;
        this.currentSize = 1;
        new Promise((resolve, _) => { // Fire-and-Forget
            setTimeout(() => {
                const img = this.getImageElement();
                resolve(img);
            }, 5); // Wait several mseconds until image loaded
        }).then((result: unknown) => {
            const img = result as HTMLImageElement;
            if(!Utils.isNullOrUndefined(img)) {
                this.initPosAfterImgLoaded(img);
            }
        });
    }

    private initPosAfterImgLoaded(img: HTMLImageElement): void {
        const width = window.innerWidth;
        this.imageWidth = img.width;
        const height = window.innerHeight;
        this.imageHeight = img.height;
        const isInWindow = [width >= this.imageWidth, height >= this.imageHeight];
        const isWide = this.imageWidth > this.imageHeight;
        const square = this.imageWidth == this.imageHeight;
        this.offsetX = (isInWindow[0] || !isWide || square) ? width - (width + this.imageWidth) / 2 : 0;
        this.offsetY = (isInWindow[1] || isWide || square) ? height - (height + this.imageHeight) / 2 : 0;
    }
}
</script>

<template>
    <teleport to="#modal-imgviewer" v-if="resource.visible">
        <div class="modal" name="root"
            @mousedown.prevent="changePushFlag(true)"
            @mousemove.prevent="dragging"
            @dblclick.prevent="resetSize"
            @mouseup.prevent="changePushFlag(false)"
        >
            <img :src="resource.src"
                id="ivewer"
                @wheel="resize" :style="[resizeCss, moveCss]"
            >
            <p class="modal__close" @click="closeButton">&times;</p>
        </div>
    </teleport>
</template>

<style lang="scss" scoped>
@import '@/views/css/dialog.scss';
$Modal-Background: #dfdfdf;
$Modal-Font-Color: #3a3a3a;
$Modal-Button: #dfdfdf;
$Modal-Button-Focus: #aaaaaa;

* {
    overflow-x: hidden;
    overflow-y: hidden;
}

.modal {
    position: fixed;
    top: 0;
    left: 0;
    margin: 0;
    z-index: calc( #{$Dialog-ZIndex} - 1 );
    width: 100vw;
    height: 100vh;
    overflow: auto;
    background-color: rgba(0,0,0,0.4);

    & * {
        color: $Modal-Font-Color;
        user-select: none;
        -webkit-user-drag: none;
    }

    &__close {
        position: fixed;
        top: 0;
        right: 0;
        width: 64px;
        height: 64px;
        font-size: 64px;
        text-align: center;
        line-height: 0.9em;
        color: $Modal-Button;
        cursor: pointer;
        background-color: black;
        opacity: 0.9;
        &:hover {
            background-color: crimson;
        }
    }

    & img {
        position: fixed;
        cursor: default;
        max-width: 100vw;
        max-height: 100vh;
        margin: auto;
        box-shadow: 0 0 32px 12px black;
    }
}
</style>