<script lang="ts">
import { Defs } from '@/logics/models/defs';
import { ItemResource } from '@/logics/models/resource';
import { IReceiveString } from '@/logics/models/utils';
import { PropType } from '@vue/runtime-core';
import { Options, Vue } from 'vue-class-component';
import { Buffer } from 'buffer';
import MessageDialog from '../dialogs/MessageDialog.vue';
import SystemMessage from '@/logics/utils/SystemMessage';
import ResourceViewer from '@/logics/utils/resource-viewer';
import ImageViewer from './ImageViewer.vue';

@Options({
    components: {
        MessageDialog,
        ImageViewer,
    },
    props: {
        resource: {
            type: ItemResource,
            required: true
        },
        boxSize: {
            type: String,
            required: false,
            default: "32px"
        },
        appendResource: {
            type: Function as PropType<IReceiveString>,
            required: true
        },
        removeResource: {
            type: Function as PropType<IReceiveString>,
            required: true
        }
    },
    methods: {
        hasResource(): boolean {
            return this.resource.type != Defs.ResourceType.None;
        },
        isImage(): boolean {
            return this.resource.type == Defs.ResourceType.Image;
        },
        chooseFile(self?: boolean): void {
            this.changeSelf = self ?? false;
            this.$refs.inputfile.click();
        },
        fileSelected(): void {
            const e = this.$refs.inputfile as HTMLInputElement;
            if(e.files === null) return;
            for(let index = 0; index < e.files!.length; index++) {
                const receivedFile = e.files[index];
                if(!receivedFile) return;
                this.AddResource(receivedFile);
            }
            if(e instanceof Event) {
                (e as Event).preventDefault();
            }    
        },
        fileDropped(event: DragEvent): void {
            this.setHovering(false);
            const files = event.dataTransfer?.files;
            if(files === undefined) return;
            for(let index = 0; index < files.length; index++) {
                this.AddResource(files[index]);
            }
        },
        setHovering(isHover: boolean): void {
            this.isHovering = isHover;
        },
        removeClicked(): void {
            this.message = SystemMessage.Create(
                "削除の確認", "削除するともう元に戻せません。\nこのデータを削除しますか？",
                SystemMessage.MessageType.Warning, true
            )
        },
        msgResult(result: number): void {
            if(result == SystemMessage.MessageResult.OK) {
                this.removeResource(this.resource.id);
            }
        },
        viewImage(src: string): void {
            this.resourceView = ResourceViewer.Show(src);
        }
    },
    computed: {
        boxSizeCss: function(): string {
            return `width: ${this.boxSize}; height: ${this.boxSize};`;
        },
        boxBorderCss: function(): string {
            if(this.isHovering) {
                return `border: dashed 3px #aaa;`;
            }
            return `border: solid 1px #999;`;
        }
    }
})

export default class ResourceBox extends Vue {
    resource!: ItemResource;
    boxSize!: string;
    appendResource!: IReceiveString;
    removeResource!: IReceiveString;

    isHovering = false;
    changeSelf = false;

    message = new SystemMessage();
    resourceView = new ResourceViewer();

    public GetFileAsBase64(filepath: File): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = e => {
                if(e.target !== null) {
                    resolve((e.target.result as string));
                }
            };
            reader.onerror = err => reject(err);
            reader.readAsBinaryString(filepath);
        })
    }

    public AddResource(filepath: File): void {
        this.GetFileAsBase64(filepath)
            .then(bstr => {
                const b64str = Buffer.from(bstr, 'binary').toString('base64');
                const src = `data:${filepath.type};base64,${b64str}`;
                if(this.changeSelf) {
                    this.resource.resource = src;
                } else {
                    this.appendResource(src);
                }
            });
    }
}
</script>

<template>
    <ImageViewer :resource="resourceView" />
    <MessageDialog :message="message" :result="msgResult" />
    <div id="ResourceBox" :style="boxSizeCss">
        <input
            style="display: none;"
            ref="inputfile"
            type="file"
            accept="image/*"
            @change="fileSelected()"
        />

        <div v-if="hasResource() && isImage()" class="image">
            <img :src="resource.resource" class="image__main" @click="viewImage(resource.resource)" />
            <img src="@/assets/dark/close.png" class="image__close selectable" @click="removeClicked()" />
            <img src="@/assets/dark/change.png" class="image__change selectable" @click="chooseFile(true)" />
        </div>
        <div v-else class="drop selectable" :style="[boxBorderCss, boxSizeCss]"
            @click="chooseFile()"
            @dragover.prevent="setHovering(true)"
            @dragleave.prevent="setHovering(false)"
            @drop.prevent="fileDropped($event)"
        >
            <img src="@/assets/dark/add.png" class="drop__main" />
            <p class="drop__desc">drop here…</p>
        </div>
    </div>
</template>

<style lang="scss" scoped>
@import '@/views/css/base-design.scss';
@import '@/views/css/dialog.scss';

#ResourceBox {
    z-index: calc( #{$Dialog-ZIndex} + 10);
    cursor: pointer;

    & .image {
        position: relative;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;

        &__main {
            border-radius: 12px;
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        &__close {
            border-radius: 12px;
            background-color: black;
            position: absolute;
            top: 5px;
            right: 5px;
            width: 18px;
            height: 18px;
            padding: 3px;
        }
        &__change {
            border-radius: 12px;
            background-color: black;
            position: absolute;
            top: 32px;
            right: 5px;
            width: 18px;
            height: 18px;
            padding: 3px;
        }
    }

    & .drop {
        border-radius: 12px;
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;

        &__main {
            margin: 8px;
        }
        &__desc {
            height: auto;
            margin: 3px;
            max-width: 100%;
            text-align: center;
            @include hide-overflow-text;
            font-size: 12px;
        }
    }
}
</style>