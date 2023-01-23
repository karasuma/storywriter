<template>
    <InputDialog :result="appendItem" :inputMessage="inputdlg" />
    <div class="StoryItem" :style="itemBorder()">
        <div v-if="story.isDir" class="item directory editable_item"
                    @dragover="$emit('ondragover', story.id, $event)"
                    @dragleave="$emit('ondragleave', story.id)"
                    @drop="$emit('ondrop', story.id, $event)"
        >
            <div class="title">
                <div class="draggable"
                    draggable="true"
                    @dragstart="$emit('ondragstart', story.id, $event)"></div>
                <!--<div class="selected" :style="[leftMargin(), directoryBorder()]"></div>-->
                <div class="depth" v-for="d in expandLefts(story.depth)" :key="d"></div>
                <img src="@/assets/dark/caret.png" @click="toggleExpand()" :style="expandingImg()"/>
                <p :style="selected()" :title="story.content.caption" @click="editStory(story)">
                    {{ story.content.caption }}
                </p>
            </div>
            <div class="controls">
                <img title="お話の追加" src="@/assets/dark/edit.png" @click="createDialog(false)" class="selectable" />
                <img v-show="isLessThanDepth(story.depth)" title="章の追加" src="@/assets/dark/folder.png" @click="createDialog(true)" class="selectable" />
            </div>
        </div>
        <div v-else class="item editable_item"
                    @dragover="$emit('ondragover', story.id, $event)"
                    @dragleave="$emit('ondragleave', story.id)"
                    @drop="$emit('ondrop', story.id, $event)"
        >
            <div class="title">
                <div class="draggable"
                    draggable="true"
                    @dragstart="$emit('ondragstart', story.id, $event)"></div>
                <!--<div class="selected" :style="[leftMargin(), directoryBorder()]"></div>-->
                <div class="depth" v-for="d in expandLefts(story.depth)" :key="d"></div>
                <div class="blank"></div>
                <p :style="selected()" :title="story.content.caption" @click="editStory(story)">
                    {{ story.content.caption }}
                </p>
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
    font-size: $StoryItem-Height;

    & .editable_item:hover {
        background-color: $Hover-Color;
    }

    & * {
        @include non-user-select;
    }

    & .item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;

        & .title {
            max-width: calc( 100% - 60px );
            height: 1.5em;
            display: flex;
            align-items: center;

            & > img {
                cursor: pointer;
            }

            & .draggable {
                min-width: 15px;
                height: 1.3em;
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
                margin-right: 2px;
                height: calc( #{$StoryItem-Height} + 4px );
            }

            & .depth {
                margin: 0 9px;
                border-right: solid 1px #999;
                height: 100%;
            }

            & .blank {
                @include square-size(calc( #{$StoryItem-Height} - 3px ));
            }

            & p {
                @include hide-overflow-text;
                margin-left: 4px;
                text-align: left;
                //width: $Hierarchy-Width;
                width: 100%;
                &:hover {
                    cursor: pointer;
                    opacity: 0.6;
                }
            }
        }

        & .controls {
            display: flex;
            & * {
                height: $StoryItem-Height;
                margin: 0 2px;
                &:hover {
                    cursor: pointer;
                }
            }
        }
    }

    & .directory {
        & > .title {
            & > img {
                @include square-size(1.3em);
                margin-right: 3px;
                margin-top: 3px;
            }
            
            & > p {
                font-size: 1.3em;
            }
        }
    }
}

</style>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import { Stories } from "@/logics/models/story-data";
import InputDialog from "../dialogs/InputDialog.vue";
import InputMessage from "@/logics/utils/input-message";
import { Enumerable, Utils } from "@/logics/models/utils";
import { StoryWriterObject } from "@/logics/models/storywriter-object";

@Options({
    components: {
        InputDialog,
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
            //const globalcss = "margin-right: 6px; min-width: 3px;";
            //return `${globalcss} background-color: ${this.story.isEditing ? "orange" : "transparent"};`;
            return `color: ${this.story.isEditing ? "#68be8d" : "white"};`;
        },
        appendItem(result: string): void {
            this.story.AppendStory(result, this.isDir);
        },
        createDialog(isDir: boolean): void {
            this.isDir = isDir;
            this.inputdlg = InputMessage.Create(`${isDir ? "章" : "お話"}の追加`);
            StoryWriterObject.ModalOpen();
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
        },
        expandLefts(depth: number): Array<string> {
            return Enumerable.Range(depth - 1).map(() => Utils.getUniqueId());
        },
        isLessThanDepth(depth: number): boolean {
            return depth < this.maxDepth;
        }
    },
})

export default class StoryHierarchyItemView extends Vue {
    story!: Stories;
    inputdlg = new InputMessage();
    isDir = false;

    maxDepth = 2;

    public GetDepthMargin(): number {
        return (this.story.depth - 1) * 10; // depth * margin
    }
}
</script>
