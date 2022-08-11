<template>
    <div id="StoryMain">
        <div class="hierarchy">
            <StoryHierarchyView :root="story" />
        </div>
        <div class="storyedit">

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
        width: 260px;
        background-color: $Base-Color;
    }

    & .storyedit {
        width: auto;
    }
}
</style>

<script lang="ts">
import { Stories } from '@/logics/models/story-data';
import { Options, Vue } from 'vue-class-component';
import StoryHierarchyView from './StoryHierarchyView.vue';

@Options({
    components: {
        StoryHierarchyView
    }
})

export default class StoryMainView extends Vue {
    story = new Stories(true, "");
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
    }
}
</script>