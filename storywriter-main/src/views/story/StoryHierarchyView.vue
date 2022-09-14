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
            <img class="selectable" @click="makeStory" title="ストーリーの追加" src="@/assets/dark/edit.png" />
            <img class="selectable" @click="makeDirectory" title="ディレクトリの追加" src="@/assets/dark/folder.png" />
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
import DragElement from '@/logics/utils/draggable';
import InputMessage from '@/logics/utils/input-message';
import { Options, Vue } from 'vue-class-component';
import InputDialog from '../dialogs/InputDialog.vue';
import StoryHierarchyItemView from './StoryHierarchyItemView.vue';

@Options({
    components: {
        StoryHierarchyItemView,
        InputDialog,
    },
    props: {
        root: {
            type: Stories,
            required: true
        }
    },
    methods: {
        editableStories(): Array<Stories> {
            return this.root.GetFlattenStories().filter((x: Stories) => x.IsVisible());
        },
        inputResult(instr: string): void {
            this.root.AppendStory(instr, this.createDir);
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
            this.drag.DragStart(id, event);
        },
        dragOver(id: string, event: DragEvent): void {
            this.drag.DragOver(id, event);
        },
        dragLeave(id: string): void {
            this.drag.DragLeave(id);
        },
        onDrop(id: string, event: DragEvent): void {
            this.drag.Drop(id, event, (recvID: string, nextID: string) => {
                this.adjustStories(recvID, id, nextID);
            });
        },
        refresh(story: Stories): void {
            story.isExpanding = !story.isExpanding;
        }
    },
})

export default class StoryHierarchyView extends Vue {
    root!: Stories;
    createDir = false;
    inputmsg = new InputMessage();
    drag = new DragElement(document);

    public packStories(): void {
        this.root.InitializeHierarchy();
    }

    public moveStories(mover: Stories, insert?: Stories): void {
        if(insert === undefined) { // Insert for the last
            // move
            this.root.children.push(mover);
            // remove
            const idx = mover.parent.children.findIndex(s => s.id == mover.id);
            mover.parent.children.splice(idx, 1);
            // change parent
            const hierParent = this.root.GetFlattenStories()[this.root.GetFlattenStories().length - 1];
            mover.parent = hierParent.isDir ? hierParent : hierParent.parent;
        } else {
            // shift timeline
            this.root.GetFlattenStories()
                .filter(s => s.content.time >= insert.content.time)
                .forEach(s => s.content.time++);
            // insert
            const insertPos = insert.parent.children.findIndex(s => s.id == insert.id);
            insert.parent.children.splice(insertPos, 0, mover);
            // remove
            const idx = mover.parent.children.findIndex(s => s.id == mover.id);
            mover.parent.children.splice(idx, 1);
            // change parent and timeline
            mover.parent = insert.parent;
            mover.content.time = insert.content.time - 1;
        }
        // change depth
        mover.depth = mover.parent.depth + 1;
    }

    public adjustStories(movedID: string, nextSiblingID: string, nextID: string): void {
        const flatten = this.root.GetFlattenStories();
        const movedStory = flatten.find((x: Stories) => x.id == movedID);
        if(movedStory === undefined) return;

        if(nextSiblingID === undefined || nextID.length == 0) {
            // Currently dropped element was placed to the last
            this.moveStories(movedStory);
        } else {
            const nextStory = flatten.find((x: Stories) => x.id == nextSiblingID);
            if(nextStory === undefined) return;
            this.moveStories(movedStory, nextStory);
        }
        this.packStories();
    }
}
</script>