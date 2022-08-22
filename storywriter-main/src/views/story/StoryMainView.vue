<template>
    <div id="StoryMain">
        <div class="hierarchy">
            <StoryHierarchyView :root="story" />
        </div>
        <div class="edit">
            <div v-if="hasEditingStory()">
                <StoryEditView :storyData="getEditingStory()" @deleteStory="removeStory" />
            </div>
            <div v-else class="blank">
                <img src="@/assets/dark/edit.png" />
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
@import '@/views/css/base-design.scss';

#StoryMain {
    background-color: $Base-Color;
    display: flex;
    min-height: calc( 100vh - #{$Header-Height} - #{$Footer-Height} - 2px );

    & .hierarchy {
        width: $Hierarchy-Width;
        background-color: $Base-Color;
    }

    & .edit {
        width: 100%;
        background-color: $Content-BaseColor;

        & .blank {
            position: relative;
            bottom: -10px;
            left: -5px;
            @include square-size(50vw);
            & img {
                opacity: 0.1;
                @include square-size(100%);
            }
        }
    }
}
</style>

<script lang="ts">
import { Stories, StoryData } from '@/logics/models/story-data';
import { Options, Vue } from 'vue-class-component';
import StoryEditView from './StoryEditView.vue';
import StoryHierarchyView from './StoryHierarchyView.vue';

@Options({
    components: {
        StoryHierarchyView,
        StoryEditView
    },
    methods: {
        getEditingStory(): StoryData {
            return this.story.GetFlattenStories().find((x: Stories) => x.isEditing).content;
        },
        hasEditingStory(): boolean {
            return this.story.GetFlattenStories().findIndex((x: Stories) => x.isEditing) >= 0;
        },
        removeStory(id: string): void {
            const parentID = this.story.GetFlattenStories().find((x: Stories) => x.content.id == id).id;
            Stories.RemoveStoryFromID(this.story.root, parentID);
        }
    }
})

export default class StoryMainView extends Vue {
    story = Stories.Create();
    mounted(): void {
        this.story.AppendStory("Content1");
        const dir1 = this.story.AppendStory("Dir1", true);
        dir1.AppendStory("Dir1-Content1");
        dir1.AppendStory("Dir1-Content2");
        const dir2 = dir1.AppendStory("Dir-c1", true);
        dir2.AppendStory("Dir-c1-Content1");
        dir2.AppendStory("Dir-c1-Content2");
        const c2 = this.story.AppendStory("Content2");
        c2.isEditing = true;
        this.story.AppendStory("Content3");

        c2.content.color = "#007bbb";
        c2.content.description = "サンプルの\nストーリー紹介文";
        const i1 = c2.content.addItem();
        i1.title = "Sample title";
        i1.color = "#007b43";
        i1.addStory("new story");
    }
}
</script>