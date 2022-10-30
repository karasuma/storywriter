<template>
    <InputDialog :result="appendItem" :inputMessage="inputdlg" />
    <MessageDialog :result="deleteItem" :message="messagedlg" />
    <div class="StoryItem" :style="itemBorder()">
        <div v-if="story.isDir" class="item"
                    @dragover="$emit('ondragover', story.id, $event)"
                    @dragleave="$emit('ondragleave', story.id)"
                    @drop="$emit('ondrop', story.id, $event)">
            <div class="title">
                <div class="draggable"
                    draggable="true"
                    @dragstart="$emit('ondragstart', story.id, $event)"></div>
                <div class="selected" :style="selected()"></div>
                <div class="selected" :style="[leftMargin(), directoryBorder()]"></div>
                <img src="@/assets/dark/caret.png" @click="toggleExpand()" :style="expandingImg()"/>
                <p @click="toggleExpand()" :title="story.content.caption">{{ story.content.caption }}</p>
            </div>
            <div class="controls">
                <img title="編集" src="@/assets/dark/edit.png" @click="createDialog(true)" class="selectable" />
                <img title="追加" src="@/assets/dark/add.png" @click="createDialog(false)" class="selectable" />
                <img title="削除" src="@/assets/dark/dispose.png" @click="deleteDialog()" class="selectable" />
            </div>
        </div>
        <div v-else class="item editable_item"
                    @dragover="$emit('ondragover', story.id, $event)"
                    @dragleave="$emit('ondragleave', story.id)"
                    @drop="$emit('ondrop', story.id, $event)"
                    @click="editStory(story)"
        >
            <div class="title">
                <div class="draggable"
                    draggable="true"
                    @dragstart="$emit('ondragstart', story.id, $event)"></div>
                <div class="selected" :style="selected()"></div>
                <div class="selected" :style="[leftMargin(), directoryBorder()]"></div>
                <div class="blank"></div>
                <p :title="story.content.caption">{{ story.content.caption }}</p>
            </div>
            <div class="controls">
                <div class="blank"></div>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
@import '@/views/css/base-design.scss';

$StoryItem-Height: 18px;
.StoryItem {
    margin-left: 3px;
    width: calc( 100% - 6px );
    padding: 2px 0;
    height: $StoryItem-Height;

    & .editable_item:hover {
        background-color: $Hover-Color;
    }

    & * {
        @include non-user-select;
    }

    & .item {
        display: flex;
        justify-content: space-between;
        width: 100%;

        & .title {
            max-width: calc( 100% - 60px );
            display: flex;
            justify-content: flex-start;

            & .draggable {
                width: 20px;
                margin: 2px 0;
                border-left: double 6px $Border-Color;
                opacity: 0.5;
                user-select: contain;
                cursor: grab;
                &:hover {
                    opacity: 1;
                }
                &:active {
                    cursor: grabbing;
                }
            }

            & .selected {
                margin-top: -2px;
                margin-right: 2px;
                height: calc( #{$StoryItem-Height} + 4px );
            }

            $Caret: calc( #{$StoryItem-Height} - 3px );
            & img {
                min-width: $Caret;
                height: $Caret;
            }

            & .blank {
                min-width: $Caret;
                height: $Caret;
            }

            & p {
                @include hide-overflow-text;
                margin-left: 4px;
                padding: 2px 0;
                text-align: left;
                width: $Hierarchy-Width;
                font-size: calc( #{$StoryItem-Height} - 4px );
                &:hover {
                    cursor: pointer;
                }
            }
        }

        & .controls {
            display: flex;
            & * {
                height: calc( #{$StoryItem-Height} - 1px );
                margin: 0 2px;
                &:hover {
                    cursor: pointer;
                }
            }
        }
    }
}

</style>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import { Stories } from "@/logics/models/story-data";
import InputDialog from "../dialogs/InputDialog.vue";
import MessageDialog from "../dialogs/MessageDialog.vue";
import SystemMessage from "@/logics/utils/SystemMessage";
import InputMessage from "@/logics/utils/input-message";

@Options({
    components: {
        InputDialog,
        MessageDialog
    },
    props: {
        story: {
            type: Stories,
            required: true
        }
    },
    emits: [
        "ondragstart",
        "ondragover",
        "ondragleave",
        "ondrop",
        "refreshItems"
    ],
    methods: {
        directoryBorder(): string {
            const border = `border-right: solid 1px #999;`;
            if(!this.story.isDir && this.story.depth > 1) return border;
            return "";
        },
        itemBorder(): string {
            return `padding-left: 3px; border-left: solid 4px ${this.story.content.color};`;
        },
        leftMargin(): string {
            return `margin-left: ${this.GetDepthMargin()}px;`;
        },
        selected(): string {
            const globalcss = "margin-right: 6px; min-width: 3px;";
            return `${globalcss} background-color: ${this.story.isEditing ? "orange" : "transparent"};`;
        },
        appendItem(result: string): void {
            if(this.rename) {
                this.story.content.caption = result;
                return;
            }
            this.story.AppendStory(result, this.isDir);
        },
        deleteItem(result: number): void {
            if(result == SystemMessage.MessageResult.OK) {
                Stories.RemoveStoryFromID(this.story.root, this.story.id);
            }
        },
        createDialog(rename: boolean): void {
            this.rename = rename;
            this.inputdlg = InputMessage.Create(
                rename ? "グループ名の編集" : "サブアイテムの追加",
                rename ? this.story.content.caption : "");
        },
        deleteDialog(): void {
            const title = `${this.story.content.caption} の削除`;
            const msg = `${this.story.content.caption} を削除しますか？`;
            this.messagedlg = SystemMessage.Create(title, msg, SystemMessage.MessageType.Normal, true);
        },
        toggleExpand(): void {
            this.$emit('refreshItems', this.story);
        },
        expandingImg(): string {
            return `transform: rotate(${this.story.isExpanding ? 90 : 0}deg);`;
        },
        editStory(item: Stories): void {
            this.story.GetFlattenStories().forEach((x: Stories) => x.isEditing = false);
            item.isEditing = true;
        }
    },
})

export default class StoryHierarchyItemView extends Vue {
    story!: Stories;
    messagedlg = new SystemMessage();
    inputdlg = new InputMessage();
    rename = false;

    public GetDepthMargin(): number {
        return (this.story.depth - 1) * 10; // depth * margin
    }
}
</script>
