<script lang="ts">
import { Defs } from '@/logics/models/defs';
import { ItemResource } from '@/logics/models/resource';
import { StoryWriterObject } from '@/logics/models/storywriter-object';
import { Utils } from '@/logics/models/utils';
import { WorldData } from '@/logics/models/world-data';
import DragElement from '@/logics/utils/draggable';
import SystemMessage from '@/logics/utils/SystemMessage';
import { Vue, Options } from 'vue-class-component';
import ResourceBox from '../commons/ResourceBox.vue';
import MessageDialog from '../dialogs/MessageDialog.vue';
import WorldDetailView from './WorldDetailView.vue';
import WorldHierarchyView from './WorldHierarchyView.vue';

@Options({
    components: {
        WorldHierarchyView,
        WorldDetailView,
        ResourceBox,
        MessageDialog
    },
    props: {
        vm: {
            type: StoryWriterObject,
            required: true
        }
    },
    methods: {
        hasEditingWorld(): boolean {
            return this.vm.world.GetFlattenWorlds().findIndex((x: WorldData) => x.isEditing) >= 0;
        },
        editingWorld(): WorldData {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            return this.vm.world.GetFlattenWorlds().find((x: WorldData) => x.isEditing)!;
        },
        appendCaption(src: string): void {
            this.editingWorld().image.resource = src;
            this.editingWorld().image.type = Defs.ResourceType.Image;
        },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        removeCaption(_: string): void {
            this.editingWorld().image.resource = "";
            this.editingWorld().image.type = Defs.ResourceType.None;
        },
        appendImage(src: string): void {
            this.editingWorld().AppendResource(src);
        },
        removeImage(id: string): void {
            this.editingWorld().RemoveResource(id);
        },
        appendDesc(): void {
            this.editingWorld().AppendDesc();
        },
        removeDesc(id: string): void {
            this.editingWorld().RemoveDesc(id);
        },
        deleteClicked(): void {
            this.message = SystemMessage.Create(
                "世界の削除",
                `${this.editingWorld().caption} を削除しますか？`,
                SystemMessage.MessageType.Normal,
                true
            );
        },
        deleteWorld(result: number): void {
            if(result === SystemMessage.MessageResult.OK) {
                const self: WorldData = this.editingWorld();
                this.vm.world.RemoveWorldData(self.id);
            }
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
                this.AdjustDescription(recvID, nextID);
                this.dragging = false;
            });
        },
    }
})

export default class WorldView extends Vue {
    vm!: StoryWriterObject;

    blankImage = new ItemResource();
    drag = new DragElement(document);
    dragging = false;
    message = new SystemMessage();
    
    public AdjustDescription(moveeID: string, nextID: string): void {
        const editing = this.vm.world.GetFlattenWorlds().find((x: WorldData) => x.isEditing);
        if(editing === undefined) return;
        const moveeIdx = editing.descriptions.findIndex(x => x.id == moveeID);
        if(nextID === DragElement.NoNextElement) {
            Utils.moveAt(editing.descriptions, moveeIdx, editing.descriptions.length - 1);
            return;
        }
        const nextIdx = editing.descriptions.findIndex(x => x.id === nextID);
        Utils.moveAt(editing.descriptions, moveeIdx, nextIdx > moveeIdx ? nextIdx - 1 : nextIdx);
    }
}
</script>

<template>
    <MessageDialog :message="message" :result="deleteWorld" />
    <div id="World">
        <div class="hierarchy">
            <WorldHierarchyView :vm="vm.world" />
        </div>
        <div v-if="hasEditingWorld()" class="edit">
            <div class="edit__dispose">
                <img src="@/assets/dark/dispose.png" class="selectable" @click="deleteClicked" />
            </div>
            <input class="edit__caption" v-model="editingWorld().caption"
                   type="text" spellcheck="false" placeholder="土地名..." />
            <div class="edit__image">
                <ResourceBox :resource="editingWorld().image" :boxSize="'100%'"
                             :appendResource="appendCaption" :removeResource="removeCaption" />
            </div>
            <hr />
            <div class="edit__details">
                <div class="edit__details__images">
                    <div class="edit__details__images-item" style="width: 80px; height: 80px;"
                         v-for="img in editingWorld().resources" :id="img.id" :key="img.id">
                        <ResourceBox :resource="img" :boxSize="'80px'"
                                     :appendResource="appendImage" :removeResource="removeImage" />
                    </div>
                    <div class="edit__details__images-item" style="width: 80px; height: 80px;">
                        <ResourceBox :resource="blankImage" :boxSize="'80px'"
                                     :appendResource="appendImage" :removeResource="removeImage" />
                    </div>
                </div>
                <div class="edit__details__descriptions">
                    <div class="edit__details__descriptions-item"
                         v-for="d in editingWorld().descriptions" :key="d.id" :id="d.id"
                         @dragover="itemDragOver(d.id, $event)"
                         @dragleave="itemDragLeave(d.id)"
                         @drop="itemOnDrop(d.id, $event)">
                        <p class="selectable" draggable="true" @dragstart="itemDragStart(d.id, $event)">
                            ―<br/>―<br/>―
                        </p>
                        <WorldDetailView :detail="d" />
                        <img src="@/assets/dark/dispose.png" class="selectable" @click="removeDesc(d.id)" />
                    </div>
                    <div class="edit__details__descriptions-add">
                        <img src="@/assets/dark/add.png" class="selectable" @click="appendDesc" />
                    </div>
                </div>
            </div>
        </div>
        <div v-else class="edit">
            
        </div>
    </div>
</template>

<style lang="scss" scoped>
@import '@/views/css/base-design.scss';

#World {
    position: fixed;
    top: $Header-Height;
    bottom: $Footer-Height;
    min-height: calc( 100vh - #{$Header-Height} - #{$Footer-Height} - 2px );

    $World-Width: 250px;
    & * {
        @include non-user-select;
    }

    & .hierarchy {
        width: $World-Width;
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
    & .edit {
        width: calc( 100vw - #{$World-Width} - #{$Menu-Width} - 2vw );
        padding-right: 2vw;
        position: fixed;
        top: 0;
        bottom: 0;
        left: calc( #{$World-Width} + #{$Menu-Width} );
        margin-top: $Header-Height;
        margin-bottom: $Footer-Height;
        max-height: calc( 100vh - #{$Header-Height} - #{$Footer-Height} - 2px );
        background-color: $Content-BaseColor;
        overflow-y: auto;
        overflow-x: hidden;

        &__dispose {
            position: absolute;
            right: 20px;
            top: 20px;
            & > img {
                @include square-size(32px);
                cursor: pointer;
            }
        }
        &__caption {
            width: calc( 100% - 80px );
            margin: 15px;
            display: flex;
            font-size: 2em;
        }
        &__image {
            margin: 10px auto;
            width: calc( 100% - 20px );
            height: 150px;
        }
        & > hr {
            border: solid 1px $Border-Color;
            margin: 12px 5px;
        }
        &__details {
            padding: 20px 0;
            margin: 0 auto;
            width: calc( 100% - 20px );

            display: flex;
            justify-content: center;
            align-items: flex-start;
            &__images {
                margin: 0 5px;
                min-width: 200px;
                display: flex;
                flex-wrap: wrap;
                align-items: flex-start;
                align-content: flex-start;
                &-item {
                    margin: 6px;
                    @include square-size(80px);
                }
            }
            &__descriptions {
                margin-left: 10px;
                width: 100%;
                display: flex;
                flex-direction: column;
                justify-content: center;
                &-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 8px 0;
                    & > * {
                        width: 100%;
                    }
                    & > img {
                        @include square-size(26px);
                        cursor: pointer;
                        margin-left: 7px;
                    }
                    & > p {
                        font-size: 21px;
                        font-weight: bold;
                        line-height: 0.4em;
                        width: 31px;
                        margin-right: 7px;
                        cursor: pointer;
                    }
                }
                &-add {
                    margin: 21px 0;
                    width: 100%;
                    display: flex;
                    justify-content: center;
                    & img {
                        @include square-size(32px);
                        cursor: pointer;
                    }
                }
            }
        }
    }
}
</style>