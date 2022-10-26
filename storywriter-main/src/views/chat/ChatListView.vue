<script lang="ts">
import { ActorData } from '@/logics/models/actor-data';
import { ChatItem } from '@/logics/models/chat-data';
import { Defs } from '@/logics/models/defs';
import { ItemResource } from '@/logics/models/resource';
import { Stories } from '@/logics/models/story-data';
import { StoryWriterObject } from '@/logics/models/storywriter-object';
import { Utils } from '@/logics/models/utils';
import ErrorHandler from '@/logics/utils/error-handler';
import { Options, Vue } from 'vue-class-component';

@Options({
    props: {
        vm: {
            type: StoryWriterObject,
            required: true
        }
    },
    methods: {
        selectedCss(chat: ChatItem): string {
            if(chat.isEditing) {
                return "border-left: solid 3px orange; opacity: 1;";
            }
            return "border-left: solid 3px transparent;";
        },
        setEdit(chat: ChatItem): void {
            this.vm.chat.chats.forEach((x: ChatItem) => x.isEditing = false);
            chat.isEditing = true;
            this.$emit('selectchanged');
        },
        isImage(res: ItemResource): boolean {
            return res.type == Defs.ResourceType.Image;
        },
        addChatClicked(): void {
            this.vm.chat.Add();
        },
        description(c: ChatItem): string {
            const actors = c.timeline.map(t => t.actorId)
                .filter((x, i, a) => a.indexOf(x) === i)
                .map(id => this.vm.actor.actors.find((a: ActorData) => a.id == id)?.name ?? "")
                .filter((s: string) => s.length > 0);
            if(actors.length > 0 && c.description.length > 0) {
                return `${actors.length}人: ${c.description}`;
            }
            return actors.join(", ");
        },
        storyname(c: ChatItem): string {
            const story = this.vm.story.GetFlattenStories().find((x: Stories) => x.content.id == c.storyId);
            if(story === undefined || story.content.description.length == 0) {
                const actors = c.timeline
                    .map(t => t.actorId)
                    .filter((x, i, a) => a.indexOf(x) === i)
                    .map(id => this.vm.actor.actors.find((a: ActorData) => a.id == id)?.name ?? "")
                    .filter((s: string) => s.length > 0);
                return `${actors.length}人の会話`;
            }
            return story.content.description;
        },
        storycolorCss(c: ChatItem): string {
            const story = this.vm.story.GetFlattenStories().find((x: Stories) => x.content.id == c.storyId);
            const basecss = "background-color:";
            if(story === undefined || story.content.color.length == 0) {
                return `${basecss} rgba(0,0,0,0);`;
            }
            const rgb = Utils.hex2rgb(story.content.color);
            return `${basecss} rgba(${rgb.join(",")},0.2);`;
        }
    },
    computed: {
        filteredChats: function(): Array<ChatItem> {
            if(this.searchword.length == 0) {
                return this.vm.chat.chats;
            }
            return this.vm.chat.chats
                .filter((x: ChatItem) => x.GetAllChars().indexOf(this.searchword) >= 0);
        },
    },
    emits: [
        "selectchanged"
    ]
})

export default class ChatListView extends Vue {
    vm!: StoryWriterObject;
    public searchword = "";

    public GetActor(id: string): ActorData {
        const actor = this.vm.actor.actors.find(x => x.id == id);
        if(actor === undefined) {
            ErrorHandler.RaiseError(
                "Actor search error",
                "ChatListView.vue[GetActor(id: string): ActorData]: Invalid actor ID, Actor not found.",
                ErrorHandler.ErrorLevel.Failed
            );
        }
        return new ActorData("鵺");
    }

    public HasActor(id: string): boolean {
        return this.vm.actor.actors.find(x => x.id == id) !== undefined;
    }
}
</script>

<template>
    <div id="ChatList">
        <div class="search">
            <img src="@/assets/dark/search.png" />
            <input type="text" spellcheck="false" placeholder="会話の一部を入力..." v-model="searchword" />
        </div>

        <div class="chat selectable" v-for="c in filteredChats" :key="c.id" :id="c.id"
            :style="[selectedCss(c), storycolorCss(c)]" :title="c.name" @click="setEdit(c)">
            <p class="chat__story">{{ storyname(c) }}</p>
            <p class="chat__desc">{{ description(c) }}</p>
        </div>

        <div class="add">
            <img class="add__image selectable" @click="addChatClicked()"
                 src="@/assets/dark/add.png" title="会話の追加" />
        </div>
    </div>
</template>

<style lang="scss" scoped>

@import '@/views/css/base-design.scss';
#ChatList {
    height: 100%;
    display: flex;
    flex-direction: column;
    background-color: $Base-Color;

    & .search {
        height: 60px;
        min-height: 60px;
        margin: 0 16px;
        display: flex;
        align-items: center;
        justify-content: space-around;

        & img {
            @include square-size(21px);
            margin: 0 8px;
        }
        & input {
            width: calc(100% - 48px);
            height: 21px;
        }
    }

    & .chat {
        width: calc( 100% - 3px );
        height: 4em;
        display: flex;
        flex-direction: column;
        //align-items: center;
        @include non-user-select;
        cursor: pointer;

        border-bottom: solid 1px $Dim-Border-Color;
        &:nth-child(2) {
            border-top: solid 1px $Dim-Border-Color;
        }
        border-left: solid 3px $Base-Color;
        &:hover {
            background-color: $Hover-Color;
            border-left: solid 3px $Hover-Color;
        }

        &__story {
            @include hide-overflow-text;
            height: 1.5em;
            font-size: 1.6em;
            margin-top: 4px;
            margin-left: 8px;
        }
        &__desc {
            @include hide-overflow-text;
            font-size: 12px;
            margin-bottom: 6px;
            margin-left: 30px;
            opacity: 0.7;
        }
    }

    & .add {
        display: flex;
        justify-content: center;
        align-content: center;
        &__image {
            margin: 21px 0;
            @include square-size(31px);
        }
    }
}
</style>