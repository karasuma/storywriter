<script lang="ts">
import { Defs } from '@/logics/models/defs';
import { MemoItem } from '@/logics/models/memo-data';
import { StoryWriterObject } from '@/logics/models/storywriter-object';
import { Utils } from '@/logics/models/utils';
import ColorMessage from '@/logics/utils/color-message';
import DragElement from '@/logics/utils/draggable';
import Notifier from '@/logics/utils/notifier';
import SystemMessage from '@/logics/utils/SystemMessage';
import { Vue, Options } from 'vue-class-component';
import ColorPalette from '../commons/ColorPalette.vue';
import ColorDialog from '../dialogs/ColorDialog.vue';
import MessageDialog from '../dialogs/MessageDialog.vue';

@Options({
    components: {
        ColorPalette,
        MessageDialog,
        ColorDialog
    },
    props: {
        vm: {
            type: StoryWriterObject,
            required: true
        }
    },
    methods: {
        changeColor(color: string): void {
            this.currentColor = color;
        },
        msgResult(result: number): void {
            if(result === SystemMessage.MessageResult.OK) {
                const removeIdx = this.vm.memo.memos.findIndex((x: MemoItem) => x.id === this.currentMemoId);
                if(removeIdx === -1) {
                    Notifier.Send(
                        "存在しないメモを削除しようとしました。",
                        Notifier.Levels.Alert
                    );
                    return;
                }
                this.vm.memo.memos.splice(removeIdx, 1);
            }
        },
        deleteClicked(memo: MemoItem): void {
            this.currentMemoId = memo.id;
            this.message = SystemMessage.Create(
                "削除",
                `このメモ「${memo.caption}」を削除してもいいですか？`,
                SystemMessage.MessageType.Normal,
                true
            );
        },
        colorResult(color: string): void {
            const memoIdx = this.vm.memo.memos.findIndex((x: MemoItem) => x.id === this.currentMemoId);
            this.vm.memo.memos[memoIdx].color = color;
        },
        colorClicked(memo: MemoItem): void {
            this.currentMemoId = memo.id;
            this.color = ColorMessage.Show(ColorMessage.Type.Dark);
        },
        addMemo(): void {
            this.vm.memo.Add();
        },
        itemColorCss(color: string): string {
            return `background-color: ${color};`;
        },
        isItemShow(item: MemoItem): boolean {
            let colorFlag = true;
            if(this.currentColor !== "transparent") {
                const colorIdx = Defs.definedDarkColors.indexOf(item.color);
                const currIdx = Defs.definedLightColors.indexOf(this.currentColor);
                colorFlag = colorIdx === currIdx;
            }

            let textFlag = true;
            if(this.searchText.length > 0 && item.caption.indexOf(this.searchText) === -1) {
                textFlag = false;
            }
            return colorFlag && textFlag;
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
                this.AdjustMemo(recvID, nextID);
                this.dragging = false;
            });
        },
    }
})

export default class MemoView extends Vue {
    vm!: StoryWriterObject;

    currentColor = "transparent";
    currentMemoId = "";
    searchText = "";
    message = new SystemMessage();
    color = new ColorMessage();

    drag = new DragElement(document);
    dragging = false;

    public AdjustMemo(moveeID: string, nextID: string): void {
        const moveeIdx = this.vm.memo.memos.findIndex(x => x.id === moveeID);
        if(nextID === DragElement.NoNextElement) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const movee = this.vm.memo.memos[moveeIdx];
            this.vm.memo.memos.push(movee);
            this.vm.memo.memos.splice(moveeIdx, 1);
            return;
        }
        const nextIdx = this.vm.memo.memos.findIndex(x => x.id === nextID);
        Utils.moveAt(this.vm.memo.memos, moveeIdx, nextIdx > moveeIdx ? nextIdx - 1 : nextIdx);
    }
}
</script>

<template>
    <MessageDialog :message="message" :result="msgResult" />
    <ColorDialog :showTrigger="color" :result="colorResult" />
    <div id="memo">
        <div class="controls">
            <ColorPalette :selectedColor="changeColor" />
        </div>

        <div class="memos">
            <div class="memos__controls">
                <div class="memos__controls__search">
                    <img src="@/assets/dark/search.png" />
                    <input v-model="searchText" type="text" spellcheck="false" placeholder="..." />
                </div>
            </div>
            
            <hr/>

            <div class="memos__texts">
                <div class="memos__texts-item"
                     v-for="memo in vm.memo.memos" :key="memo.id" :id="memo.id"
                     @dragover="itemDragOver(memo.id, $event)"
                     @dragleave="itemDragLeave(memo.id)"
                     @drop="itemOnDrop(memo.id, $event)"
                     v-show="isItemShow(memo)"
                >
                    <p draggable="true" @dragstart="itemDragStart(memo.id, $event)">
                        ―<br/>―<br/>―
                    </p>
                    <div :style="itemColorCss(memo.color)">
                        <span>
                            <img class="selectable" src="@/assets/dark/dispose.png" @click="deleteClicked(memo)" />
                            <img class="selectable" src="@/assets/dark/paint.png" @click="colorClicked(memo)" />
                            <input v-model="memo.caption" type="text" spellcheck="false" placeholder="..." />
                        </span>
                        <hr/>
                        <textarea v-model="memo.text" spellcheck="false" placeholder="..."></textarea>
                    </div>
                </div>
                <img class="selectable" src="@/assets/dark/add.png" @click="addMemo" />
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
@import '@/views/css/base-design.scss';

#memo {
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

    & .memos {
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

        & img {
            user-select: none;
        }

        &__controls {
            margin: 12px 10px;
            &__search {
                display: flex;
                align-items: center;
                & > img {
                    @include square-size(2em);
                    margin: 8px 0;
                }
                & > input {
                    font-size: 1.5em;
                    height: 2em;
                    width: 100%;
                    margin-left: 12px;
                }
            }
        }

        & > hr {
            border: solid 1px $Dim-Border-Color;
            margin: 18px 6px;
        }

        &__texts {
            margin: 20px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            &-item {
                padding: 12px 0;
                display: flex;
                align-items: center;
                & > p {
                    font-size: 21px;
                    font-weight: bold;
                    line-height: 0.4em;
                    width: 31px;
                    margin-right: 7px;
                    cursor: grab;
                    opacity: 0.6;
                    &:hover {
                        opacity: 1;
                    }
                    &:active {
                        cursor: grabbing;
                    }
                }
                & > div {
                    width: 100%;
                    padding: 8px;
                    border: solid 1px $Dim-Border-Color;
                    border-radius: 6px;
                    & > * {
                        margin: 3px 0;
                        width: calc(100% - 8px);
                    }
                    & > span {
                        display: flex;
                        align-items: center;
                        & > img {
                            @include square-size(1.5em);
                            margin-right: 12px;
                        }
                        & > input {
                            width: 100%;
                        }
                    }
                    & > hr {
                        border: solid 1px $Dim-Border-Color;
                        margin: 12px 0;
                    }
                }
            }
            & > img {
                @include square-size(2em);
                margin: 20px auto;
            }
        }
    }
}
</style>