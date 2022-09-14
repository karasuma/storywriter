<template>
    <div id="StoryMain">
        <div class="hierarchy">
            <StoryHierarchyView :root="vm.story" />
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
    position: fixed;
    top: $Header-Height;
    bottom: $Footer-Height;
    min-height: calc( 100vh - #{$Header-Height} - #{$Footer-Height} - 2px );

    & .hierarchy {
        width: $Hierarchy-Width;
        position: fixed;
        top: 0;
        bottom: 0;
        left: $Menu-Width;
        margin-top: $Header-Height;
        margin-bottom: $Footer-Height;
        max-height: calc( 100vh - #{$Header-Height} - #{$Footer-Height} - 2px );
        overflow-y: scroll;
        overflow-x: hidden;
        background-color: $Base-Color;
    }

    & .edit {
        width: calc( 100vw - #{$Hierarchy-Width} - #{$Menu-Width} - 2vw );
        padding-right: 2vw;
        position: fixed;
        top: 0;
        bottom: 0;
        left: calc( #{$Hierarchy-Width} + #{$Menu-Width} );
        margin-top: $Header-Height;
        margin-bottom: $Footer-Height;
        max-height: calc( 100vh - #{$Header-Height} - #{$Footer-Height} - 2px );
        background-color: $Content-BaseColor;
        overflow-y: auto;
        overflow-x: hidden;

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
import { StoryWriterObject } from '@/logics/models/storywriter-object';
import { Options, Vue } from 'vue-class-component';
import StoryEditView from './StoryEditView.vue';
import StoryHierarchyView from './StoryHierarchyView.vue';

@Options({
    components: {
        StoryHierarchyView,
        StoryEditView
    },
    props: {
        vm: {
            type: StoryWriterObject,
            required: true
        }
    },
    methods: {
        getEditingStory(): StoryData {
            return this.vm.story.GetFlattenStories().find((x: Stories) => x.isEditing).content;
        },
        hasEditingStory(): boolean {
            return this.vm.story.GetFlattenStories().findIndex((x: Stories) => x.isEditing) >= 0;
        },
        removeStory(id: string): void {
            const parentID = this.vm.story.GetFlattenStories().find((x: Stories) => x.content.id == id).id;
            Stories.RemoveStoryFromID(this.vm.story.root, parentID);
        }
    }
})

export default class StoryMainView extends Vue {
    vm!: StoryWriterObject;
}
</script>