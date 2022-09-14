<template>
    <div id="timeline">
        <div class="controls">
            <ColorPalette :selectedColor="changeColor" />
        </div>

        <div class="stories">
            <div class="stories__search">
                <div class="stories__search__inputarea">
                    <img src="@/assets/dark/search.png" />
                    <input type="text" spellcheck="false" placeholder="search..."
                            v-model="searchstr"/>
                </div>
                <p>{{ searchResult() }}</p>
            </div>

            <div class="stories__main">
                <div class="stories__main__inner" :style="noteHeight(vm.story)">
                    <div v-for="item in stories()" :key="item.story.id" :id="item.story.id"
                         v-show="isVisible(item.story.content)"
                         @click="itemClicked(item.story)"
                         class="stories__main__inner-item"
                         :style="[itemColor(item.story.content.color), itemPosition(item)]">
                        <p>{{ item.story.content.caption }}</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
@import '@/views/css/base-design.scss';

#timeline {
    position: fixed;
    top: $Header-Height;
    bottom: $Footer-Height;
    min-height: calc( 100vh - #{$Header-Height} - #{$Footer-Height} - 2px );
    & .controls {
        width: $Palette-Width;
        position: fixed;
        top: 0;
        bottom: 0;
        left: $Menu-Width;
        margin-top: $Header-Height;
        margin-bottom: $Footer-Height;
        max-height: calc( 100vh - #{$Header-Height} - #{$Footer-Height} - 2px );
        background-color: $Base-Color;
        overflow-y: scroll;
        overflow-x: hidden;
    }

    & .stories {
        width: calc( 100vw - #{$Palette-Width} - #{$Menu-Width} - 2vw );
        padding-right: 2vw;
        position: fixed;
        top: 0;
        bottom: 0;
        left: calc( #{$Palette-Width} + #{$Menu-Width} );
        margin-top: $Header-Height;
        margin-bottom: $Footer-Height;
        max-height: calc( 100vh - #{$Header-Height} - #{$Footer-Height} - 2px );
        background-color: $Content-BaseColor;
        overflow-y: auto;
        overflow-x: hidden;

        &__search {
            width: 100%;
            height: 90px;
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            justify-content: flex-end;
            &__inputarea {
                display: flex;
                justify-content: flex-end;
                & input {
                    width: 250px;
                }
                & * {
                    margin: 0 8px;
                    height: 32px;
                }
            }
            & p {
                margin: 8px 16px;
                font-size: 14px;
            }
        }

        &__main {
            width: 100%;
            &__inner {
                width: calc( 100% - 20px );
                margin: 20px;
                padding: 20px 0;

                border: solid 1px $Border-Color;
                border-radius: 10px;
                background-color: $Base-Color;
                background-image: linear-gradient(180deg, $Hover-Color 1px, transparent 1px);
                background-size: 100% 3em;
                line-height: 3em;
                padding-bottom: 1px;

                &-item {
                    width: 200px;
                    height: 2em;
                    margin-left: 10px;
                    background-color: $Content-BaseColor;
                    cursor: pointer;
                    & p {
                        line-height: 2em;
                        font-size: 14px;
                        margin-left: 6px;
                        @include hide-overflow-text;
                    }
                }
            }
        }
    }
}
</style>

<script lang="ts">
import { Defs } from '@/logics/models/defs';
import { Stories, StoryData } from '@/logics/models/story-data';
import { StoryWriterObject, StoryWriterObjectSample } from '@/logics/models/storywriter-object';
import ViewSelection from '@/logics/models/view-selection';
import { Options, Vue } from 'vue-class-component';
import ColorPalette from '../commons/ColorPalette.vue';

@Options({
    components: {
        ColorPalette,
    },
    props: {
        vm: {
            type: StoryWriterObject,
            required: true
        },
        selection: {
            type: ViewSelection,
            required: true
        }
    },
    methods: {
        changeColor(color: string): void {
            this.currentColor = color;
        },
        storyCss(item: StoryData): string {
            return `border-left: solid 3px ${item.color};`;
        },
        searchResult(): string {
            if(this.searchstr == "") {
                return "...";
            }
            const matchlist = this.stories()
                .filter((x: IdxStoryPair) => x.story.content.caption.indexOf(this.searchstr) >= 0).length;
            if(matchlist == 0) {
                return "No story found.";
            }
            return `${matchlist} stor${matchlist > 1 ? "ies" : "y"} found.`;
        },
        itemColor(c: string): string {
            const bcol = c.length == 0 || c == "#333333" ? "#111" : c;
            const boxborder = `border: solid 1px ${bcol}; border-left: solid 4px ${bcol};`

            const colidx = Defs.definedLightColors.indexOf(c);
            const scol = colidx >= 0 ? Defs.definedDarkColors[colidx] : bcol;
            const boxshadow = `box-shadow: 6px 6px ${scol};`;
            return `${boxborder} ${boxshadow}`;
        },
        itemPosition(s: IdxStoryPair): string {
            const top = s.idx * this.storySpan;
            const left = (Defs.definedLightColors.indexOf(s.story.content.color) + 1) * 20;
            const basecss = "position: relative; "
            return basecss+`top: ${top}px; left: ${left}px;`
        },
        noteHeight(s: Stories): string {
            const lasttime = s.GetLastTime();
            const height = (this.storySpan + 40) * lasttime + 20;
            return `height: ${height}px;`;
        },
        isVisible(s: StoryData): boolean {
            if(this.currentColor != "transparent" && this.currentColor != s.color) {
                return false;
            }
            if(this.searchstr.length != 0 && s.caption.indexOf(this.searchstr) == -1) {
                return false;
            }
            return true;
        },
        stories(): Array<IdxStoryPair> {
            const items = new Array<IdxStoryPair>();
            let index = 0;
            this.vm.story.GetFlattenStories().filter((x: Stories) => !x.isDir)
                .filter((x: Stories) => this.isVisible(x.content))
                .forEach((s: Stories) => {
                    items.push({idx: index, story: s});
                    index++;
                });
            return items;
        },
        itemClicked(s: Stories): void {
            this.vm.story.GetFlattenStories().forEach((x: Stories) => x.isEditing = false);
            s.isEditing = true;
            this.selection.ChangeCurrentView(1);
        }
    }
})

export default class TimelineView extends Vue {
    vm!: StoryWriterObject;
    selection!: ViewSelection;
    
    currentColor = "transparent";
    searchstr = "";
    story = new StoryWriterObjectSample();
    storySpan = 30;
}

interface IdxStoryPair {
    idx: number;
    story: Stories;
}
</script>