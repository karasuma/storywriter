<template>
    <InputDialog :result="inputResult" :inputMessage="inputmsg" />
    <div id="StoryHierarchy">
        <div v-for="story in editableStories()" :key="story" :id="story.id" class="hierarchy-items">
            <StoryHierarchyItemView :story="story"
                @ondragstart="dragStart"
                @ondragover="dragOver"
                @ondragleave="dragLeave"
                @ondrop="onDrop"
                @refreshItems="refresh"
                />
        </div>

        <div class="hierarchy-ctrl">
            <img class="selectable" @click="makeStory" title="お話の追加" src="@/assets/dark/edit.png" />
            <img class="selectable" @click="makeDirectory" title="章の追加" src="@/assets/dark/folder.png" />
        </div>
    </div>
</template>

<style lang="scss" scoped>
@import '@/views/css/base-design.scss';

#StoryHierarchy {
    display: flex;
    flex-direction: column;
    width: 100%;

    & * {
        width: calc( 100% - 6px );
    }

    & .hierarchy-items {
        height: 1.5em;
    }

    & .hierarchy-ctrl {
        margin: 8px 0;
        display: flex;
        justify-content: center;
        user-select: none;

        & img {
            width: 24px;
            height: auto;
            margin: 0 8px;
            cursor: pointer;
        }
    }
}
</style>

<script lang="ts">
import { Stories } from '@/logics/models/story-data';
import { StoryWriterObject } from '@/logics/models/storywriter-object';
import { Utils } from '@/logics/models/utils';
import DragElement from '@/logics/utils/draggable';
import InputMessage from '@/logics/utils/input-message';
import Notifier from '@/logics/utils/notifier';
import { Options, Vue } from 'vue-class-component';
import InputDialog from '../dialogs/InputDialog.vue';
import StoryHierarchyItemView from './StoryHierarchyItemView.vue';

@Options({
    components: {
        StoryHierarchyItemView,
        InputDialog,
    },
    props: {
        vm: {
            type: StoryWriterObject,
            required: true
        }
    },
    methods: {
        editableStories(): Array<Stories> {
            return this.vm.story.GetFlattenStories().filter((x: Stories) => x.IsVisible());
        },
        inputResult(instr: string): void {
            this.vm.story.AppendStory(instr, this.createDir);
        },
        makeStory(): void {
            this.createDir = false;
            this.inputmsg = InputMessage.Create("ストーリーの追加");
        },
        makeDirectory(): void {
            this.createDir = true;
            this.inputmsg = InputMessage.Create("グループの追加");
        },

        dragStart(id: string, event: DragEvent): void {
            this.drag.DragStart(id, event, (event.target as HTMLElement).parentNode);
        },
        dragOver(id: string, event: DragEvent): void {
            this.drag.DragOver(id, event);
        },
        dragLeave(id: string): void {
            this.drag.DragLeave(id);
        },
        onDrop(id: string, event: DragEvent): void {
            this.drag.Drop(id, event, (recvID: string, nextID: string) => {
                this.adjustStories(recvID, nextID);
            }, true);
        },
        refresh(story: Stories): void {
            story.isExpanding = !story.isExpanding;
        }
    },
})

export default class StoryHierarchyView extends Vue {
    vm!: StoryWriterObject;
    createDir = false;
    inputmsg = new InputMessage();
    drag = new DragElement(document);

    public packStories(): void {
        this.vm.story.InitializeHierarchy();
    }
    
    public adjustStories(movedID: string, nextID: string): void {
        const flatten = this.vm.story.GetFlattenStories();
        const moved = flatten.find(x => x.id === movedID);
        if(moved === undefined) return;
        const movedIdx = moved.parent.children.findIndex(x => x.id === movedID);

        if(nextID === DragElement.NoNextElement) {
            this.vm.story.children.push(moved);
            moved.parent.children.splice(movedIdx, 1);
            moved.ChangeDepth(this.vm.story.depth + 1);
            moved.parent = this.vm.story;
            this.vm.story.InitializeHierarchy();
            return;
        }

        const next = flatten.find(x => x.id === nextID);
        if(next === undefined) return;
        const nextIdx = next.parent.children.findIndex(x => x.id === nextID);
        if(moved.parent.id !== next.parent.id) {
            if(next.FindAncestor(moved.id) !== null && moved.isDir) {
                this.vm.message.Send(
                    "ストーリーの親子関係は入れ替えられません。",
                    Notifier.Levels.Warning
                );
                return;
            }
            next.parent.children.splice(nextIdx, 0, moved);
            moved.parent.children.splice(movedIdx, 1);
            moved.ChangeDepth(next.depth);
            moved.parent = next.parent;
        } else {
            Utils.moveAt(moved.parent.children, movedIdx, nextIdx > movedIdx ? nextIdx - 1 : nextIdx);
        }
        this.vm.story.InitializeHierarchy();
    }
}
</script>