<script lang="ts">
import { ActorData, Actors } from '@/logics/models/actor-data';
import { Defs } from '@/logics/models/defs';
import { ItemResource } from '@/logics/models/resource';
import { StoryWriterObject } from '@/logics/models/storywriter-object';
import { Utils } from '@/logics/models/utils';
import DragElement from '@/logics/utils/draggable';
import InputMessage from '@/logics/utils/input-message';
import { Vue, Options } from 'vue-class-component';
import InputDialog from '../dialogs/InputDialog.vue';

@Options({
    components: {
        InputDialog
    },
    props: {
        actors: {
            type: Actors,
            required: true
        }
    },
    methods: {
        selectedCss(actor: ActorData): string {
            if(actor.isEditing) {
                return "border-left: solid 3px orange; opacity: 1;";
            }
            return "border-left: solid 3px transparent;";
        },
        setEdit(actor: ActorData): void {
            this.actors.actors.forEach((x: ActorData) => x.isEditing = false);
            actor.isEditing = true;
        },
        addActorClicked(): void {
            StoryWriterObject.ModalOpen();
            this.inputmsg = InputMessage.Create("キャラクターの追加");
        },
        isImage(res: ItemResource): boolean {
            return res.type == Defs.ResourceType.Image;
        },
        // Drag events
        itemDragStart(id: string, event: DragEvent): void {
            this.drag.DragStart(id, event);
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
                this.AdjustActor(recvID, nextID);
                this.dragging = false;
            });
        },
    },
    computed: {
        filteredActors: function(): Array<ActorData> {
            if(this.searchword.length == 0) {
                return this.actors.actors;
            }
            return this.actors.filter((x: ActorData) => x.name.indexOf(this.searchword) >= 0);
        }
    }
})

export default class ActorListView extends Vue {
    actors!: Actors;

    searchword = "";
    inputmsg = new InputMessage();

    drag = new DragElement(document);
    dragging = false;

    public addActor(name: string): void {
        this.actors.Add(name);
    }

    public AdjustActor(moveeID: string, nextID: string): void {
        const moveeIdx = this.actors.actors.findIndex(x => x.id === moveeID);
        if(nextID === DragElement.NoNextElement) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const movee = this.actors.actors[moveeIdx];
            this.actors.actors.push(movee);
            this.actors.actors.splice(moveeIdx, 1);
            return;
        }
        const nextIdx = this.actors.actors.findIndex(x => x.id === nextID);
        Utils.moveAt(this.actors.actors, moveeIdx, nextIdx > moveeIdx ? nextIdx - 1 : nextIdx);
    }
}
</script>

<template>
    <InputDialog :inputMessage="inputmsg" :result="addActor" />
    <div id="Actorlist">
        <div class="search">
            <img src="@/assets/dark/search.png" />
            <input type="text" spellcheck="false" placeholder="..." v-model="searchword" />
        </div>

        <div class="actor selectable" v-for="d in filteredActors" :key="d.id" :id="d.id"
            draggable="true" @dragstart="itemDragStart(d.id, $event)"
            @dragover="itemDragOver(d.id, $event)"
            @dragleave="itemDragLeave(d.id)"
            @drop="itemOnDrop(d.id, $event)"
            :style="selectedCss(d)" :title="d.name" @click="setEdit(d)">
            <img v-if="isImage(d.face)" class="actor__face" :src="d.face.resource" />
            <img v-else class="actor__face" src="@/assets/dark/person.png" />
            <p class="actor__caption">{{ d.name }}</p>
        </div>

        <div class="add">
            <img class="add__image selectable" @click="addActorClicked()"
                 src="@/assets/dark/add.png" title="キャラクターの追加" />
        </div>
    </div>
</template>

<style lang="scss" scoped>

@import '@/views/css/base-design.scss';
#Actorlist {
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
            user-select: none;
        }
        & input {
            width: calc(100% - 48px);
            height: 21px;
        }
    }

    & .actor {
        width: calc( 100% - 3px );
        height: 4em;
        display: flex;
        align-items: center;
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

        &__face {
            @include square-size(32px);
            margin: 0 4px;
            object-fit: cover;
            border-radius: 10px;
        }

        &__caption {
            margin: 2px 6px;
            font-size: 21px;
            font-weight: bold;
            height: 1.3em;
            @include hide-overflow-text;
        }
    }

    & .add {
        display: flex;
        justify-content: center;
        align-content: center;
        &__image {
            margin: 21px 0;
            @include square-size(31px);
            user-select: none;
        }
    }
}
</style>