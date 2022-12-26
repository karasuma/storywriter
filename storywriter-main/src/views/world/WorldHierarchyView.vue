<script lang="ts">
import { Enumerable, Utils } from '@/logics/models/utils';
import { WorldData, Worlds } from '@/logics/models/world-data';
import DragElement from '@/logics/utils/draggable';
import InputMessage from '@/logics/utils/input-message';
import Notifier from '@/logics/utils/notifier';
import { Vue, Options } from 'vue-class-component';
import InputDialog from '../dialogs/InputDialog.vue';

@Options({
    components: {
        InputDialog,
    },
    props: {
        vm: {
            type: Worlds,
            required: true
        },
        notify: {
            type: Notifier,
            required: true
        }
    },
    methods: {
        addClicked(world: WorldData, isDir: boolean): void {
            this.addTarget = world;
            this.inputIsDir = isDir;
            this.inputString = "";
            this.inputdlg = InputMessage.Create(`${isDir ? "エリア" : "場所"}の追加`);
        },
        appendItem(result: string): void {
            this.vm.AddWorldData(result, this.inputIsDir, this.addTarget);
        },
        leftExpands(depth: number): Array<string> {
            return Enumerable.Range(depth).map(() => Utils.getUniqueId());
        }, 
        expandingImg(world: WorldData): string {
            const expanding = world.isExpanding && (world.children.findIndex(x => x.isExpanding) !== -1);
            return `transform: rotate(${expanding ? 90 : 0}deg);`;
        },
        isDir(world: WorldData): boolean {
            return world.isDir && (world.depth < this.maxDepth);
        },
        showDirCtrl(world: WorldData): boolean {
            return world.isDir && (world.depth < this.maxDepth - 1);
        },
        isDirCss(world: WorldData): string {
            return this.isDir(world) ? "margin-top: 6px;" : "";
        },
        selectedCss(world: WorldData): string {
            return `color: ${world.isEditing ? "#55ed88" : "white"};`;
        },
        selectClicked(world: WorldData): void {
            this.vm.GetFlattenWorlds().forEach((x: WorldData) => {
                x.isEditing = false;
            });
            world.isEditing = true;
        },
        toggleExpand(world: WorldData): void {
            world.children.forEach(x => x.isExpanding = !x.isExpanding);
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
                this.AdjustArea(recvID, nextID);
                this.dragging = false;
            }, true);
        },
    },
    computed: {
        visibleWorlds: function(): Array<WorldData> {
            return this.vm.GetFlattenWorlds()
                .filter((x: WorldData) => x.isExpanding && (x.parent?.isExpanding ?? true));
        },
    }
})

export default class WorldHierarchyView extends Vue {
    vm!: Worlds;
    notify!: Notifier;
    
    inputdlg = new InputMessage();
    addTarget = new WorldData(this.vm);
    inputString = "";
    inputIsDir = false;

    maxDepth = 3;
    drag = new DragElement(document);
    dragging = false;

    public AdjustArea(moveeID: string, nextID: string): void {
        const flatten = this.vm.GetFlattenWorlds();
        const movee = flatten.find(x => x.id === moveeID);
        if(movee === undefined) return;

        const moveeIdx = movee.parent.children.findIndex(x => x.id === moveeID);
        if(nextID === DragElement.NoNextElement) {
            this.vm.area.children.push(movee);
            movee.parent.children.splice(moveeIdx, 1);
            movee.ChangeDepth(this.vm.area.depth + 1);
            movee.parent = this.vm.area;
            this.vm.MakeFlattenWorlds();
            return;
        }

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const next = flatten.find(x => x.id === nextID)!;
        const nextIdx = next.parent.children.findIndex(x => x.id === nextID);
        if(movee.parent.id !== next.parent.id) {
            if(next.FindAncestor(movee.id) !== null && movee.isDir) {
                this.notify.Send(
                    "エリアの親子関係は入れ替えられません。（例：日本国埼玉県 → 埼玉国日本県）",
                    Notifier.Levels.Warning
                );
                return;
            }
            next.parent.children.splice(nextIdx, 0, movee);
            movee.parent.children.splice(moveeIdx, 1);
            movee.ChangeDepth(next.depth);
            movee.parent = next.parent;
        } else {
            Utils.moveAt(movee.parent.children, moveeIdx, nextIdx > moveeIdx ? nextIdx - 1 : nextIdx);
        }
        this.vm.MakeFlattenWorlds();
    }
}
</script>

<template>
    <InputDialog :result="appendItem" :inputMessage="inputdlg" />
    <div class="items">
        <div class="area" v-for="w in visibleWorlds" :key="w.id" :id="w.id"
                         @dragover="itemDragOver(w.id, $event)"
                         @dragleave="itemDragLeave(w.id)"
                         @drop="itemOnDrop(w.id, $event)">
            <div class="area__draggable selectable" draggable="true" @dragstart="itemDragStart(w.id, $event)">
                <p>||</p>
            </div>
            <div class="area__depth" v-for="d in leftExpands(w.depth - 1)" :key="d"></div>
            <div v-if="w.isDir" class="area__directory">
                <div class="area__directory__left" :style="isDirCss(w)">
                    <img src="@/assets/dark/caret.png"  @click="toggleExpand(w)"
                        :style="expandingImg(w)"/>
                    <p @click="selectClicked(w)" :style="selectedCss(w)" :title="w.caption">{{ w.caption }}</p>
                </div>
                <div class="area__directory__right">
                    <img src="@/assets/dark/add-file.png" title="土地（ファイル）の追加" class="selectable" @click="addClicked(w, false)" />
                    <img v-show="showDirCtrl(w)"
                         src="@/assets/dark/add-folder.png" title="地域（グループ）の追加" class="selectable" @click="addClicked(w, true)" />
                </div>
            </div>
            <div v-else class="area__item">
                <p @click="selectClicked(w)" :style="selectedCss(w)" :title="w.caption">{{ w.caption }}</p>
            </div>
        </div>
        <div class="area__add">
            <img src="@/assets/dark/add-file.png" title="土地（ファイル）の追加" class="selectable" @click="addClicked(vm.area, false)" />
            <img src="@/assets/dark/add-folder.png" title="地域（グループ）の追加" class="selectable" @click="addClicked(vm.area, true)" />
        </div>
    </div>
</template>

<style lang="scss" scoped>
@import '@/views/css/base-design.scss';

.items {
    width: 100%;
    & .area {
        height: 100%;
        display: flex;
        flex-wrap: nowrap;

        &__draggable {
            min-width: 1em;
            margin: 0 5px;
            display: flex;
            justify-content: center;
            align-items: center;
            & > p {
                font-size: 1.3em;
                cursor: grab;
                &:active {
                    cursor: grabbing;
                }
            }
        }

        &__depth {
            margin-left: calc( 0.7em + 3px );
            min-width: 1em;
            border-left: solid 1px $Border-Color;
        }

        &__directory {
            display: flex;
            justify-content: space-between;
            align-items: center;
            width: 100%;
            &__left {
                display: flex;
                align-items: center;
                width: 100%;
                margin-left: 4px;
                & > img {
                    @include square-size(1.5em);
                    cursor: pointer;
                }
                & > p {
                    margin-left: 6px;
                    height: 100%;
                    font-size: 1.2em;
                    cursor: pointer;
                    &:hover {
                        opacity: 0.8;
                    }
                }
            }
            &__right {
                display: flex;
                justify-content: flex-end;
                align-items: center;
                width: 4em;
                margin-right: 4px;
                & > img {
                    @include square-size(1.5em);
                    margin: 0 2px;
                }
            }
        }

        &__item {
            & > p {
                height: 100%;
                cursor: pointer;
                &:hover {
                    opacity: 0.6;
                }
            }
        }

        &__add {
            width: 100%;
            margin: 16px 0;
            display: flex;
            justify-content: center;
            align-items: center;
            & img {
                @include square-size(2em);
                margin: 0 6px;
            }
        }
    }
}
</style>