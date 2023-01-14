<!-- eslint-disable @typescript-eslint/no-non-null-assertion -->
<script lang="ts">
import { ActorData } from '@/logics/models/actor-data';
import { ChatItem, ChatTalker } from '@/logics/models/chat-data';
import { Stories, StoryData } from '@/logics/models/story-data';
import { StoryWriterObject } from '@/logics/models/storywriter-object';
import { Utils } from '@/logics/models/utils';
import DragElement from '@/logics/utils/draggable';
import { Options, Vue } from 'vue-class-component';
import ChatActorView from './ChatActorView.vue';
import ChatListView from './ChatListView.vue';

@Options({
    components: {
        ChatListView,
        ChatActorView
    },
    props: {
        vm: {
            type: StoryWriterObject,
            required: true
        }
    },
    methods: {
        hasEditing(): boolean {
            return this.vm.chat.chats.find((x: ChatItem) => x.isEditing) !== undefined;
        },
        editingChat(): ChatItem {
            return this.vm.chat.chats.find((x: ChatItem) => x.isEditing);
        },
        getFace(id: string): string {
            const actor = this.vm.actor.actors.find((x: ActorData) => x.id == id);
            if(actor !== undefined) {
                return actor.face.resource;
            }
            return "";
        },
        hasFace(id: string): boolean {
            return this.getFace(id).length > 0;
        },
        setFace(name: string, talker: ChatTalker): void {
            const actor: ActorData = this.vm.actor.actors.find((x: ActorData) => x.name == name);
            if(actor === undefined) {
                talker.actorId = "";
                return;
            }
            talker.actorId = actor.id;
        },
        autoResize(e: Event): void {
            if(this.textarea === null) {
                this.textarea = e.target as HTMLElement;
                this.textareaClientHeight = this.textarea.clientHeight;
            }
            this.textarea.style.height = this.textareaClientHeight + "px";
            const sh = this.textarea.scrollHeight;
            this.textarea.style.height = sh + "px";
        },
        addTL(): void {
            this.editingChat().AddTalk("", "");
        },
        removeTalk(talk: ChatTalker): void {
            this.editingChat().RemoveTalk(talk);
        },
        setStory(): void {
            if(this.selectStory == "") {
                this.editingChat().storyId = "";
                return;
            }
            const story: Stories = this.vm.story.GetFlattenStories()
                    .filter((x: Stories) => !x.isDir)
                    .find((x: Stories) => x.content.caption == this.selectStory);
            this.editingChat().storyId = story?.content.id ?? "";
        },
        selectChanged(): void {
            const story: Stories = this.vm.story.GetFlattenStories()
                    .filter((x: Stories) => !x.isDir)
                    .find((x: Stories) => x.content.id == this.editingChat().storyId);
            this.selectStory = story?.content.caption ?? "";
        },
        getActorName(id: string): string {
            const actor = this.vm.actor.actors.find((x: ActorData) => x.id == id);
            if(actor !== undefined) {
                return actor.name;
            }
            return "???";
        },
        optionColorCss(s: StoryData): string {
            const basecss = "background-color:";
            if(s.color.length == 0 || s.color == "transparent") {
                return `${basecss} transparent;`;
            }
            const rgb = Utils.hex2rgb(s.color);
            return `${basecss} rgba(${rgb.join(",")},0.3);`;
        },
        // Drag events
        itemDragStart(id: string, event: DragEvent): void {
            this.drag.DragStart(id, event, (event.target as HTMLElement).parentNode);
            this.dragging = true;
        },
        itemDragOver(id: string, event: DragEvent): void {
            if(!this.dragging) return;
            this.drag.DragOver(id, event);
        },
        itemDragLeave(id: string): void {
            if(!this.dragging) return;
            this.drag.DragLeave(id);
        },
        itemOnDrop(id: string, event: DragEvent): void {
            this.drag.Drop(id, event, (recvID: string, nextID: string) => {
                this.adjustTalk(recvID, nextID);
                this.dragging = false;
            });
        },
    },
    computed: {
        storyNameList: function(): Array<StoryData> {
            return this.vm.story.GetFlattenStories()
                    .filter((x: Stories) => !x.isDir)
                    .map((x: Stories) => x.content);
        },
        actorList: function(): Array<string> {
            return this.vm.actor.actors.map((x: ActorData) => x.name);
        }
    }
})

export default class ChatView extends Vue {
    vm!: StoryWriterObject;

    textareaClientHeight = 0;
    textarea: HTMLElement | null = null;
    selectStory = "";
    drag = new DragElement(document);
    dragging = false;

    public dbgGetStr(id: string): string {
        if(id == DragElement.NoNextElement) return "x";
        const talkidx = this.vm.chat.chats.find(x => x.isEditing)!.timeline.findIndex(x => x.id == id);
        const talk = this.vm.chat.chats.find(x => x.isEditing)!.timeline.find(x => x.id == id)!;
        return `${talk.text}[${talkidx}]`;
    }

    public adjustTalk(currentID: string, nextID: string): void {
        if(nextID == DragElement.NoNextElement) {
            this.moveTalk(currentID);
            return;
        }
        this.moveTalk(currentID, nextID);
    }

    public moveTalk(currentID: string, nextID?: string): void {
        const chat: ChatItem = this.vm.chat.chats.find((x: ChatItem) => x.isEditing)!;
        if(nextID === undefined) {
            const currentIdx = chat.timeline.findIndex((x: ChatTalker) => x.id == currentID);
            chat.timeline.push(chat.timeline[currentIdx]);
            chat.timeline.splice(currentIdx, 1);
            return;
        }
        const current = chat.timeline.find((x: ChatTalker) => x.id == currentID);
        const next = chat.timeline.find((x: ChatTalker) => x.id == nextID);
        chat.MoveTalk(current!, next!);
    }
}
</script>

<template>
    <div id="Chat">
        <div class="chatlist">
            <ChatListView @selectchanged="selectChanged" :vm="vm" />
        </div>

        <div class="mainchat" v-if="hasEditing()">
            <div class="mainchat__header">
                <select name="stories" id="stories-selector" v-model="selectStory" @change="setStory">
                    <option value="">...</option>
                    <option v-for="story in storyNameList" :key="story.id" :value="story.caption"
                            :style="optionColorCss(story)">
                        {{ story.caption }}
                    </option>
                </select>
                <input type="text" spellcheck="false" placeholder="説明..." v-model="editingChat().description" />
            </div>

            <div class="mainchat__chats">
                <div class="mainchat__chats__item"
                     v-for="c in editingChat().timeline" :id="c.id" :key="c.id"
                     @dragover="itemDragOver(c.id, $event)"
                     @dragleave="itemDragLeave(c.id)"
                     @drop="itemOnDrop(c.id, $event)"
                >
                    <p class="mainchat__chats__item-draggable"
                        draggable="true"
                        @dragstart="itemDragStart(c.id, $event)"
                    >―<br/>―<br/>―</p>
                    <div class="mainchat__chats__item-who" v-if="hasFace(c.actorId)">
                        <p :title="getActorName(c.actorId)">{{ getActorName(c.actorId) }}</p>
                        <img :src="getFace(c.actorId)" />
                        <div class="arrow"></div>
                        <ul>
                            <li @click="setFace('', c)">アンノウン</li>
                            <li v-for="a in actorList" :key="a" @click="setFace(a, c)">{{ a }}</li>
                        </ul>
                    </div>
                    <div class="mainchat__chats__item-who" v-else>
                        <p :title="getActorName(c.actorId)">{{ getActorName(c.actorId) }}</p>
                        <img src="@/assets/dark/person.png" />
                        <div class="arrow"></div>
                        <ul>
                            <li @click="setFace('', c)">アンノウン</li>
                            <li v-for="a in actorList" :key="a" @click="setFace(a, c)">{{ a }}</li>
                        </ul>
                    </div>
                    
                    <div class="mainchat__chats__item-text">
                        <ChatActorView :text="c" />
                    </div>
                    <img class="mainchat__chats__item-delete selectable" src="@/assets/dark/dispose.png"
                         @click="removeTalk(c)"/>
                </div>
                <div class="mainchat__chats__add">
                    <img class="selectable" src="@/assets/dark/add.png" @click="addTL()" />
                </div>
            </div>
        </div>
        <div class="mainchat__notfound" v-else>
            <img src="@/assets/dark/chat.png" />
        </div>
    </div>
</template>

<style lang="scss" scoped>
@import '@/views/css/base-design.scss';

#Chat {
    position: fixed;
    top: $Header-Height;
    bottom: $Footer-Height;
    min-height: calc( 100vh - #{$Header-Height} - #{$Footer-Height} - 2px );

    $Chat-Width: 250px;

    & * {
        @include non-user-select;
    }

    & .chatlist {
        width: $Chat-Width;
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

    & .mainchat {
        width: calc( 100vw - #{$Chat-Width} - #{$Menu-Width} - 2vw );
        padding-right: 2vw;
        position: fixed;
        top: 0;
        bottom: 0;
        left: calc( #{$Chat-Width} + #{$Menu-Width} );
        margin-top: $Header-Height;
        margin-bottom: $Footer-Height;
        max-height: calc( 100vh - #{$Header-Height} - #{$Footer-Height} - 2px );
        background-color: $Content-BaseColor;
        overflow-y: auto;
        overflow-x: hidden;

        &__header {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 50px;
            padding: 8px 0;
            border-bottom: solid 1px $Dim-Border-Color;
            
            & select {
                width: 30%;
                height: 28px;
                margin-right: 8px;

                & option {
                    color: $Base-Color;
                }
            }

            & input {
                width: 50%;
                margin-left: 8px;
                border-bottom: solid 1px $Dim-Border-Color;
                border-radius: 0;
                &:focus {
                    border-bottom: solid 1px $Border-Color;
                }
            }
        }

        &__chats {
            &__item {
                margin: 0 4px;
                padding: 8px 0;
                display: flex;
                align-items: center;

                &-face {
                    @include square-size(38px);
                    border-radius: 12px;
                    margin: 12px;
                }

                &-who {
                    position: relative;
                    display: flex;
                    flex-direction: column;
                    align-items: flex-start;

                    & > p {
                        font-size: 12px;
                        line-height: 1em;
                        width: 100%;
                        height: 1.1em;
                        padding: 0.1em 0.2em;
                        text-align: center;
                        background: $Font-Color;
                        color: $Content-BaseColor;
                        border-radius: 8px;
                        @include hide-overflow-text;
                    }
                    
                    & > img {
                        @include square-size(48px);
                        border-radius: 12px;
                        margin: 12px;
                    }
                    
                    & > .arrow {
                        position: absolute;
                        left: 5px;
                        top: calc( 90px - 0.9em );
                        border-left: 0.9em solid transparent;
                        border-right: 0.9em solid transparent;
                        border-bottom: 1em solid $Header-Hover-Color;
                        margin-left: 20px;
                        -webkit-transition: all .2s ease;
                        transition: all .2s ease;

                        visibility: hidden;
                        opacity: 0;
                        z-index: 11;
                    }
                    & > ul {
                        position: absolute;
                        left: 0px;
                        top: 90px;
                        -webkit-transition: all .2s ease;
                        transition: all .2s ease;
                        list-style: none;
                        margin: 0;
                        padding: 0;
                        border: solid 1px $Dim-Border-Color;

                        & > li {
                            background-color: $Header-Hover-Color;
                            color: $Content-BaseColor;
                            border-bottom: solid 1px $Dim-Border-Color;
                            width: 7em;
                            font-size: 16px;
                            font-weight: bold;
                            padding: 2px 3px;
                            @include hide-overflow-text;
                            cursor: default;
                            &:hover {
                                background: $Base-Inv-Color;
                                cursor: pointer;
                            }
                            &:nth-child(1) {
                                border-top: none;
                            }
                        }

                        visibility: hidden;
                        opacity: 0;
                        z-index: 10;
                    }
                    &:hover {
                        & > ul {
                            visibility: visible;
                            opacity: 1;
                        }
                        & > .arrow {
                            visibility: visible;
                            opacity: 1;
                        }
                    }
                }
                &-text {
                    width: 100%;
                }
                &-delete {
                    margin: 0 12px;
                    @include square-size(21px);
                }
                &-draggable {
                    font-size: 21px;
                    font-weight: bold;
                    line-height: 0.4em;
                    cursor: grab;
                    opacity: 0.6;
                    &:hover {
                        opacity: 1;
                    }
                    &:active {
                        cursor: grabbing;
                    }
                }
            }
            &__add {
                display: flex;
                justify-content: center;
                align-items: center;
                & img {
                    margin: 10px;
                    @include square-size(32px);
                }
            }
        }

        &__notfound {
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