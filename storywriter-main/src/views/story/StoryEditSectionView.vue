<template>
    <MessageDialog :message="message" :result="msgResult" />
    <ColorDialog :showTrigger="colortrig" :result="colorResult" />
    <div class="section" :style="bgColor()">
        <div class="section__controls">
            <input type="text" placeholder="..." spellcheck="false" v-model="item.title" />
            <img class="selectable" src="@/assets/dark/paint.png" @click="changeColor()" />
            <img class="selectable" src="@/assets/dark/dispose.png" @click="askDelete()" />
        </div>

        <hr />

        <div class="section__stories" v-for="story in item.stories" :key="story.id" :id="story.id">
            <textarea spellcheck="false" placeholder="..." v-model="story.text"></textarea>
            <div class="section__stories__arrows">
                <img class="selectable" src="@/assets/dark/arrow.png" style="transform: rotate(90deg);" 
                v-show="!isTop(story.id)" @click="moveItem(story.id, true)"/>
                <img class="selectable" src="@/assets/dark/arrow.png" style="transform: rotate(-90deg);"
                v-show="!isBottom(story.id)" @click="moveItem(story.id, false)"/>
            </div>
            <img class="section__stories__dispose selectable" src="@/assets/dark/dispose.png" @click="removeStory(story.id)" />
        </div>

        <div class="section__add">
            <img class="selectable" src="@/assets/dark/add.png" @click="addStory()" />
        </div>
    </div>
</template>

<style lang="scss" scoped>
@import "@/views/css/base-design.scss";

hr {
    border-top: solid 1px $Border-Color;
}

.section {
    margin: 20px auto;
    padding: 10px;
    width: 90%;
    border-radius: 18px;
    box-shadow: 0 0 8px #111;
    & * {
        border-radius: 8px;
        @include non-user-select;
    }
    
    &__controls {
        display: flex;
        justify-content: flex-end;
        align-items: center;
        margin: 8px 0;
        & input {
            background-color: $Content-BaseColor;
            width: 100%;
            font-size: 26px;
            margin: 0 4px;
            padding: 6px;
            cursor: text;
            opacity: 1;
        }
        & img {
            margin-left: 8px;
            @include square-size(28px);
        }
    }

    &__stories {
        display: flex;
        align-items: center;
        margin: 12px 0;

        & textarea {
            width: 100%;
            background-color: $Content-BaseColor;
            cursor: text;
        }

        &__arrows {
            display: flex;
            flex-direction: column;
            justify-content: center;
            margin: 2px 6px;
            width: 24px;
            height: auto;
            & img {
                margin: 4px;
                @include square-size(21px);
            }
        }

        &__dispose {
            margin: 0 6px;
            @include square-size(26px);
        }
    }

    &__add {
        margin: 8px;
        display: flex;
        justify-content: center;
        &__move {
            height: 30px;
            margin-left: 10px;
            display: flex;
            & img {
                @include square-size(30px);
                margin: 0 3px;
            }
        }
    }
}
</style>

<script lang="ts">
import { StoryContent, StoryItem } from '@/logics/models/story-data';
import { Utils } from '@/logics/models/utils';
import SystemMessage from '@/logics/utils/SystemMessage';
import { Vue, Options } from 'vue-class-component';
import MessageDialog from '../dialogs/MessageDialog.vue';
import ColorMessage from '@/logics/utils/color-message';
import ColorDialog from '../dialogs/ColorDialog.vue';

@Options({
    components: {
        MessageDialog,
        ColorDialog
    },
    props: {
        item: {
            type: StoryItem,
            required: true
        }
    },
    methods: {
        removeStory(id: string): void {
            this.item.removeStory(id);
        },
        addStory(): void {
            this.item.addStory();
        },
        bgColor(): string {
            return `background-color: ${this.item.color};`;
        },
        askDelete(): void {
            this.message = SystemMessage.Create(
                "確認",
                `${this.item.title.length == 0 ? "この小話" : (this.item.title + " ")}を削除しますか？`,
                SystemMessage.MessageType.Normal,
                true
            );
        },
        changeColor(): void {
            this.colortrig = ColorMessage.Show(ColorMessage.Type.Dark);
        },
        msgResult(result: number): void {
            if(result == SystemMessage.MessageResult.OK) {
                this.$emit('removeSelf', this.item.id);
            }
        },
        colorResult(color: string): void {
            this.item.color = color;
        },
        isTop(id: string): boolean {
            return this.item.stories.findIndex((x: StoryContent) => x.id == id) == 0;
        },
        isBottom(id: string): boolean {
            return this.item.stories.findIndex((x: StoryContent) => x.id == id) == this.item.stories.length - 1;
        },
        moveItem(id: string, up: boolean): void {
            const currentID = this.item.stories.findIndex((x: StoryContent) => x.id == id);
            const neighborID = Utils.clamp(currentID - (up ? 1 : -1), 0, this.item.stories.length);

            // Swap
            const current = this.item.stories[currentID];
            this.item.stories.splice(currentID, 1);
            this.item.stories.splice(neighborID, 0, current);
        },
        moveStoryItem(id: string, up: boolean): void {
            const idx = this.item.stories.findIndex((x: StoryContent) => x.id == id);
            const item = this.item.stories.find((x: StoryContent) => x.id == id);
            if(up) {
                this.item.stories.splice(idx - 1, 0, item);
                this.item.stories.splice(idx + 1, 1);
            } else {
                this.item.stories.splice(idx + 1, 0, item);
                this.item.stories.splice(idx, 1);
            }
        },
        canMoveStoryItem(id: string, up: boolean): boolean {
            const idx = this.item.stories.findIndex((x: StoryContent) => x.id == id);
            if(up) {
                return idx > 0;
            } else {
                return idx < this.item.stories.length - 1;
            }
        }
    },
    emits: [
        "removeSelf"
    ]
})

export default class StoryEditSectionView extends Vue {
    item!: StoryItem;
    message = new SystemMessage();
    colortrig = new ColorMessage();
}
</script>