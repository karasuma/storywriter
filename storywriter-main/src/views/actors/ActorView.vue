<script lang="ts">
import { ActorData, ActorDetail } from '@/logics/models/actor-data';
import { Defs } from '@/logics/models/defs';
import { ItemResource } from '@/logics/models/resource';
import { StoryWriterObject } from '@/logics/models/storywriter-object';
import { Utils } from '@/logics/models/utils';
import DragElement from '@/logics/utils/draggable';
import SystemMessage from '@/logics/utils/SystemMessage';
import { Options, Vue } from 'vue-class-component';
import ResourceBox from '../commons/ResourceBox.vue';
import AutoResizeTextarea from '../dialogs/AutoResizeTextarea.vue';
import MessageDialog from '../dialogs/MessageDialog.vue';
import ActorDetailView from './ActorDetailView.vue';
import ActorListView from './ActorListView.vue';

@Options({
    components: {
        ActorListView,
        ResourceBox,
        MessageDialog,
        ActorDetailView,
        AutoResizeTextarea
    },
    props: {
        vm: {
            type: StoryWriterObject,
            required: true
        }
    },
    methods: {
        editingActor(): ActorData {
            return this.vm.actor.actors.find((x: ActorData) => x.isEditing);
        },
        hasEditingActor(): boolean {
            return this.vm.actor.actors.find((x: ActorData) => x.isEditing) !== undefined;
        },
        appendFace(src: string): void {
            this.editingActor().face = new ItemResource(src, Defs.ResourceType.Image);
        },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        removeFace(_: string): void { // Ignore eslint because this is called by IStringResult
            this.editingActor().face = new ItemResource("", Defs.ResourceType.None);
        },
        appendImage(src: string): void {
            this.editingActor().AddImage(src);
        },
        removeImage(id: string): void {
            this.editingActor().RemoveImage(id);
        },
        isTopDetailCss(d: ActorDetail): string {
            const data = this.editingActor() as ActorData;
            if(data.details.findIndex(x => x.id == d.id) == 0) {
                return "display: none;";
            }
            return "";
        },
        isBottomDetailCss(d: ActorDetail): string {
            const data = this.editingActor() as ActorData;
            const datalen = data.details.length;
            if(data.details.findIndex(x => x.id == d.id) == (datalen - 1)) {
                return "display: none;";
            }
            return "";
        },
        downDetailClicked(d: ActorDetail): void {
            const data = this.editingActor() as ActorData;
            const didx = data.details.findIndex(x => x.id == d.id);
            data.SwapDetail(data.details[didx], data.details[didx + 1]);
        },
        upDetailClicked(d: ActorDetail): void {
            const data = this.editingActor() as ActorData;
            const didx = data.details.findIndex(x => x.id == d.id);
            data.SwapDetail(data.details[didx], data.details[didx - 1]);
        },
        deleteConfirmClicked(): void {
            StoryWriterObject.ModalOpen();
            this.systemMessage = SystemMessage.Create(
                "キャラクターの削除",
                `${this.editingActor().name} を除名しますか？`,
                SystemMessage.MessageType.Warning,
                true
            );
        },
        deleteActor(result: number): void {
            if(result == SystemMessage.MessageResult.OK) {
                this.vm.actor.Remove(this.editingActor().id);
            }
        },
        addDetail(): void {
            this.editingActor().AddDetail();
        },
        removeDetail(d: ActorDetail): void {
            this.editingActor().RemoveDetail(d.id);
        },
        // Drag events
        itemDragStart(id: string, event: DragEvent): void {
            this.drag.DragStart(id, event, (event.target as HTMLElement).parentNode?.parentNode);
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
                this.AdjustDescription(recvID, nextID);
                this.dragging = false;
            });
        },
    }
})

export default class ActorView extends Vue {
    vm!: StoryWriterObject;

    blankImage = new ItemResource();
    systemMessage = new SystemMessage();
    drag = new DragElement(document);
    dragging = false;
    
    public AdjustDescription(moveeID: string, nextID: string): void {
        const editing = this.vm.actor.actors.find((x: ActorData) => x.isEditing);
        if(editing === undefined) return;
        const moveeIdx = editing.details.findIndex(x => x.id == moveeID);
        if(nextID === DragElement.NoNextElement) {
            Utils.moveAt(editing.details, moveeIdx, editing.details.length - 1);
            return;
        }
        const nextIdx = editing.details.findIndex(x => x.id === nextID);
        Utils.moveAt(editing.details, moveeIdx, nextIdx > moveeIdx ? nextIdx - 1 : nextIdx);
    }
}
</script>

<template>
    <MessageDialog :message="systemMessage" :result="deleteActor" />
    
    <div id="Actor">
        <div class="actorlist">
            <ActorListView :actors="vm.actor" />
        </div>

        <div v-if="hasEditingActor()" class="actorView">
            <img src="@/assets/dark/dispose.png" class="actorView__dispose selectable" @click="deleteConfirmClicked()" />
            <div class="actorView__header">
                <div style="width: 160px; height: 160px;">
                    <ResourceBox :resource="editingActor().face" :boxSize="'160px'"
                                 :appendResource="appendFace" :removeResource="removeFace"
                                 :setting="vm.setting"
                    />
                </div>
                <input type="text" spellcheck="false" placeholder="..." v-model="editingActor().name" />
            </div>

            <hr />

            <div class="actorView__detail">
                <div class="actorView__detail__images">
                    <div class="actorView__detail__images-item" style="width: 80px; height: 80px;"
                         v-for="img in editingActor().images" :id="img.id" :key="img.id">
                        <ResourceBox :resource="img" :boxSize="'80px'"
                                     :appendResource="appendImage" :removeResource="removeImage"
                                     :setting="vm.setting"
                        />
                    </div>
                    <div class="actorView__detail__images-item" style="width: 80px; height: 80px;">
                        <ResourceBox :resource="blankImage" :boxSize="'80px'"
                                     :appendResource="appendImage" :removeResource="removeImage"
                                     :setting="vm.setting"
                        />
                    </div>
                </div>
                
                <div class="actorView__detail__details">
                    <p class="actorView__detail__details-title">紹介</p>
                    <!--<textarea spellcheck="false" placeholder="..." v-model="editingActor().description"
                              class="actorView__detail__details-desc">
                    </textarea>-->
                    <AutoResizeTextarea
                        :value="editingActor().description"
                        @input="editingActor().description = $event"
                        :minHeight="130"
                    />
                    <div class="actorView__detail__details-item"
                         v-for="d in editingActor().details" :id="d.id" :key="d.id"
                         @dragover="itemDragOver(d.id, $event)"
                         @dragleave="itemDragLeave(d.id)"
                         @drop="itemOnDrop(d.id, $event)">
                        <div class="actorView__detail__details-item-dispose">
                            <img class="selectable" src="@/assets/dark/dispose.png" @click="removeDetail(d)" />
                        </div>
                         <div class="actorView__detail__details-item-arrow">
                            <p draggable="true" @dragstart="itemDragStart(d.id, $event)">
                                ―<br/>―<br/>―
                            </p>
                         </div>
                         <div class="actorView__detail__details-item-view">
                            <ActorDetailView :detail="d" />
                        </div>
                    </div>
                    <div class="actorView__detail__details-add">
                        <img @click="addDetail()" class="selectable" src="@/assets/dark/add.png" />
                    </div>
                </div>
            </div>
        </div>

        <div v-else class="actorView__notfound">
        </div>
    </div>
</template>

<style lang="scss" scoped>
@import '@/views/css/base-design.scss';

#Actor {
    position: fixed;
    top: $Header-Height;
    bottom: $Footer-Height;
    min-height: calc( 100vh - #{$Header-Height} - #{$Footer-Height} - 2px );

    $Actor-Width: 250px;

    & .actorlist {
        width: $Actor-Width;
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

    & .actorView {
        width: calc( 100vw - #{$Actor-Width} - #{$Menu-Width} - 2vw );
        padding-right: 2vw;
        position: fixed;
        top: 0;
        bottom: 0;
        left: calc( #{$Actor-Width} + #{$Menu-Width} );
        margin-top: $Header-Height;
        margin-bottom: $Footer-Height;
        max-height: calc( 100vh - #{$Header-Height} - #{$Footer-Height} - 2px );
        background-color: $Content-BaseColor;
        overflow-y: auto;
        overflow-x: hidden;

        &__dispose {
            position: absolute;
            right: 30px;
            top: 30px;
            @include square-size(32px);
            user-select: none;
        }
        &__header {
            display: flex;
            align-items: center;

            & * {
                margin: 10px;
            }

            & input {
                font-size: 3em;
                font-weight: bold;
                width: 100%;
            }
        }

        & hr {
            border: solid 1px $Border-Color;
            margin: 12px 3px;
            margin-left: 6px;
        }

        &__detail {
            display: flex;
            justify-content: center;

            $Image-Width: 220px;
            &__images {
                width: $Image-Width;
                display: flex;
                flex-wrap: wrap;
                align-items: flex-start;
                align-content: flex-start;
                padding-left: 18px;
                &-item {
                    margin: 8px;
                    border: solid 1px $Dim-Border-Color;
                    border-radius: 12px;
                }
            }

            &__details {
                display: flex;
                flex-direction: column;
                margin: 0 6px;
                width: calc( 100% - $Image-Width );

                &-title {
                    font-size: 24px;
                    font-weight: bold;
                    margin-top: 10px;
                    @include non-user-select();
                }

                &-desc {
                    margin: 10px 0;
                    height: 10em;
                }

                &-item {
                    padding: 10px 0;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    position: relative;

                    &-dispose {
                        position: absolute;
                        top: 10px;
                        left: 10px;
                        @include square-size(21px);
                        & img {
                            @include square-size(21px);
                            user-select: none;
                        }
                    }

                    &-arrow {
                        margin: 12px;
                        display: flex;
                        flex-direction: column;
                        justify-content: center;
                        align-items: center;
                        width: 16px;
                        & > p {
                            font-size: 24px;
                            font-weight: bold;
                            line-height: 0.4em;
                            padding: 8px;
                            user-select: none;
                            cursor: grab;
                            opacity: 0.6;
                            &:hover {
                                opacity: 1;
                            }
                            &:active {
                                cursor: grabbing;
                                opacity: 1;
                            }
                        }
                    }
                    &-view {
                        width: 100%;
                    }
                }

                &-add {
                    margin: 10px 0;
                    display: flex;
                    justify-content: center;
                    align-items: flex-start;
                    & img {
                        @include square-size(32px);
                        user-select: none;
                    }
                }
            }
        }
    }
}
</style>