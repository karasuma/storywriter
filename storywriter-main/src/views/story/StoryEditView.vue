<template>
    <MessageDialog :message="message" :result="msgResult" />
    <ColorDialog :showTrigger="colortrig" :result="colorResult" />
    <div class="storyedit" :style="dataColor()">
        <div class="storyedit__title">
            <input type="text" placeholder="..." spellcheck="false" v-model="storyData.caption" />
            <img class="selectable" src="@/assets/dark/paint.png" @click="changeColor()" />
            <img class="selectable" src="@/assets/dark/dispose.png" @click="removeConfirm()" />
        </div>

        <div class="storyedit__desc">
            <textarea spellcheck="false" rows="4" v-model="storyData.description"></textarea>
        </div>

        <div class="storyedit__timeline" v-for="item in storyData.items" :key="item.id" :id="item.id"
             @dragover="itemDragOver(item.id, $event)"
             @dragleave="itemDragLeave(item.id)"
             @drop="itemOnDrop(item.id, $event)">
            <p draggable="true" @dragstart="itemDragStart(item.id, $event)">
                ―<br/>―<br/>―
            </p>
            <StoryEditSectionView :item="item" @removeSelf="remove" />
        </div>

        <div class="storyedit__add">
            <img class="selectable" src="@/assets/dark/add.png" @click="addData()" />
        </div>
    </div>
</template>

<style lang="scss" scoped>
@import "@/views/css/base-design.scss";

.storyedit {
    width: 90%;
    margin: 0 auto;

    &__title {
        display: flex;
        align-items: center;
        margin: 8px 0;
        width: 100%;
        $Img-Width: 28px;

        & input {
            width: calc( 100% - #{$Img-Width} - 8px ); // 8px: approx margin
            font-size: 32px;
            font-weight: bold;
            padding: 4px;
            text-align: center;
        }
        & img {
            @include square-size($Img-Width);
            user-select: none;
            margin: 6px;
        }
    }

    &__desc {
        width: 100%;
        margin: 16px 0;
        padding: 16px 0;
        border-bottom: solid 2px $Border-Color;
    }

    &__timeline {
        width: 100%;
        display: flex;
        align-items: center;
        & > p {
            font-size: 24px;
            font-weight: bold;
            line-height: 0.4em;
            padding: 8px;
            user-select: none;
            cursor: grab;
            opacity: 0.6;
            &:hover {
                opacity: 1;
            }
            &:active {
                cursor: grabbing;
                opacity: 1;
            }
        }
    }

    &__add {
        display: flex;
        justify-content: center;
        margin: 16px;

        & img {
            width: 32px;
            height: auto;
            user-select: none;
        }
    }
}
</style>

<script lang="ts">
import { StoryContent, StoryData, StoryItem } from '@/logics/models/story-data';
import ColorMessage from '@/logics/utils/color-message';
import DragElement from '@/logics/utils/draggable';
import SystemMessage from '@/logics/utils/SystemMessage';
import { Vue, Options } from 'vue-class-component';
import ColorDialog from '../dialogs/ColorDialog.vue';
import MessageDialog from '../dialogs/MessageDialog.vue';
import StoryEditSectionView from './StoryEditSectionView.vue';

@Options({
    components: {
        StoryEditSectionView,
        MessageDialog,
        ColorDialog
    },
    props: {
        storyData: {
            type: StoryData,
            required: true
        }
    },
    methods: {
        add(): void {
            this.addItem();
        },
        remove(id: string): void {
            this.storyData.removeItem(id);
        },
        dataColor(): string {
            return `border-top: solid 5px ${this.storyData.color};`;
        },
        addData(): void {
            this.storyData.addItem();
        },
        msgResult(result: number): void {
            if(result == SystemMessage.MessageResult.OK) {
                this.$emit("deleteStory", this.storyData.id);
            }
        },
        colorResult(color: string): void {
            this.storyData.color = color;
        },
        removeConfirm(): void {
            this.message = SystemMessage.Create(
                "削除の確認",
                `${this.storyData.caption} を削除しますか？`,
                SystemMessage.MessageType.Normal,
                true
            );
        },
        changeColor(): void {
            this.colortrig = ColorMessage.Show(ColorMessage.Type.Light);
        },
        // Drag events
        itemDragStart(id: string, event: DragEvent): void {
            this.drag.DragStart(id, event, (event.target as HTMLElement).parentNode);
            this.dragging = true;
        },
        itemDragOver(id: string, event: DragEvent): void {
            if(!this.dragging) return;
            this.drag.DragOver(id, event);
        },
        itemDragLeave(id: string): void {
            if(!this.dragging) return;
            this.drag.DragLeave(id);
        },
        itemOnDrop(id: string, event: DragEvent): void {
            this.drag.Drop(id, event, (recvID: string, nextID: string) => {
                this.adjustSection(recvID, nextID);
                this.dragging = false;
            });
        },
    },
    emits: [
        "deleteStory"
    ]
})

export default class StoryEditView extends Vue {
    storyData!: StoryData;
    message = new SystemMessage();
    colortrig = new ColorMessage();
    drag = new DragElement(document);
    dragging = false;

    public copyItem(src: StoryItem): StoryItem {
        const item = new StoryItem(src.title);
        item.id = src.id;
        item.color = src.color;
        src.stories.forEach(s => {
            const c = new StoryContent(s.text);
            c.id = s.id;
            item.stories.push(c);
        });
        return item;
    }

    public adjustSection(currID: string, nextID: string): void {
        if(nextID.length == 0) {
            this.moveSection(currID);
            return;
        }
        this.moveSection(currID, nextID);
    }

    public moveSection(currID: string, nextID?: string): void {
        const item = this.storyData.items.findIndex(x => x.id == currID);
        const target = this.storyData.items.findIndex(x => x.id == nextID);

        const temp = this.copyItem(this.storyData.items[item]);
        this.storyData.items.splice(item, 1);
        if(nextID === undefined) {
            this.storyData.items.push(temp);
            return;
        }
        if(item > target) {
            this.storyData.items.splice(target, 0, temp);
        } else {
            this.storyData.items.splice(target - 1, 0, temp);
        }
    }
}
</script>