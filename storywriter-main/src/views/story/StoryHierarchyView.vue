<template>
    <InputDialog :result="inputResult" :inputMessage="inputmsg" />
    <div id="StoryHierarchy">
        <div v-for="story in editableStories()" :key="story" class="hierarchy-items">
            <StoryHierarchyItemView :story="story" />
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

    & .hierarchy-items {
        &:hover {
            background-color: $Hover-Color;
        }
    }

    & .hierarchy-ctrl {
        margin: 8px 0;
        display: flex;
        justify-content: center;

        & img {
            width: 24px;
            height: auto;
            margin: 0 8px;
        }
    }
}
</style>

<script lang="ts">
import { Stories } from '@/logics/models/story-data';
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
            return this.root.GetFlattenStories().filter((x: Stories) => x.isDir || x.IsVisible());
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
    },
})

export default class StoryHierarchyView extends Vue {
    root!: Stories;
    createDir = false;
    inputmsg = new InputMessage();
}
</script>