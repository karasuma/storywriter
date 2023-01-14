<script lang="ts">
import { Defs } from '@/logics/models/defs';
import { DictionaryContent } from '@/logics/models/dictionary-data';
import { ItemResource } from '@/logics/models/resource';
import { StoryWriterObject } from '@/logics/models/storywriter-object';
import SystemMessage from '@/logics/utils/SystemMessage';
import { Vue, Options } from 'vue-class-component';
import ResourceBox from '../commons/ResourceBox.vue';
import MessageDialog from '../dialogs/MessageDialog.vue';
import DictionaryWordView from './DictionaryWordView.vue';

@Options({
    components: {
        DictionaryWordView,
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
        editingDict(): DictionaryContent | undefined {
            return this.vm.dict.dictionaries.find((x: DictionaryContent) => x.isEditing);
        },
        isEditing(): boolean {
            return this.editingDict() !== undefined;
        },
        addResource(src: string): void {
            this.editingDict().AddResource(src, Defs.ResourceType.Image);
        },
        removeResource(id: string): void {
            this.editingDict().RemoveResourceFromID(id);
        },
        deleteEditingDict(result: number): void {
            if(result == SystemMessage.MessageResult.OK) {
                this.vm.dict.Remove(this.editingDict().caption);
            }
        },
        deleteClicked(): void {
            const currDict = this.editingDict();
            this.systemMessage = SystemMessage.Create(
                "用語の削除",
                `${currDict.caption} を削除しますか？`,
                SystemMessage.MessageType.Normal,
                true);
        }
    }
})

export default class DictionaryView extends Vue {
    vm!: StoryWriterObject;
    defaultResource = new ItemResource();
    systemMessage = new SystemMessage();
}
</script>

<template>
    <MessageDialog :message="systemMessage" :result="deleteEditingDict" />
    <div id="Dictionary">
        <div class="words">
            <DictionaryWordView :dict="vm.dict" :width="'250px'" />
        </div>

        <div class="page">
            <div v-if="isEditing()" class="page__inner">
                <div class="page__inner__controls">
                    <input type="text" placeholder="..." spellcheck="false" v-model="editingDict().caption" />
                    <img class="selectable" src="@/assets/dark/dispose.png" @click="deleteClicked()" />
                </div>

                <textarea placeholder="..." spellcheck="false" v-model="editingDict().description"></textarea>

                <h2 class="page__inner__resheader">参考資料</h2>
                <div class="page__inner__resources">
                    <div class="page__inner__resources-item"
                         v-for="res in editingDict().resources" :key="res.id" :id="res.id"
                    >
                        <ResourceBox :resource="res" :boxSize="'80px'"
                                     :removeResource="removeResource" :appendResource="addResource"
                                     :setting="vm.setting" />
                    </div>
                    <div class="page__inner__resources-item">
                        <ResourceBox :resource="defaultResource"
                                     :boxSize="'80px'"
                                     :removeResource="removeResource"
                                     :appendResource="addResource"
                                     :setting="vm.setting" />
                    </div>
                </div>
            </div>
            <div v-else class="page__notfound">
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
@import '@/views/css/base-design.scss';

#Dictionary {
    position: fixed;
    top: $Header-Height;
    bottom: $Footer-Height;
    min-height: calc( 100vh - #{$Header-Height} - #{$Footer-Height} - 2px );

    $Words-Width: 250px;
    & .words {
        width: $Words-Width;
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

    & .page {
        width: calc( 100vw - #{$Words-Width} - #{$Menu-Width} - 2vw );
        padding-right: 2vw;
        position: fixed;
        top: 0;
        bottom: 0;
        left: calc( #{$Words-Width} + #{$Menu-Width} );
        margin-top: $Header-Height;
        margin-bottom: $Footer-Height;
        max-height: calc( 100vh - #{$Header-Height} - #{$Footer-Height} - 2px );
        background-color: $Content-BaseColor;
        overflow-y: auto;
        overflow-x: hidden;

        &__inner {
            margin: 2vh 2vw;
            display: flex;
            flex-direction: column;
            justify-content: center;

            &__controls {
                display: flex;
                align-items: center;
                justify-content: space-around;
                width: 100%;
                margin-bottom: 18px;

                & img {
                    @include square-size(32px);
                    margin: 0 8px;
                }

                & input {
                    width: calc(100% - 48px);
                    height: 30px;
                    font-size: 24px;
                    font-weight: bold;
                }
            }

            & textarea {
                height: 12em;
            }

            &__resheader {
                font-weight: bold;
                font-size: 21px;
                margin-top: 30px;
            }

            &__resources {
                margin: 16px 0;
                display: flex;
                flex-direction: row;
                flex-wrap: wrap;
                align-content: flex-start;
                &-item {
                    margin: 6px;
                    @include square-size(80px);
                }
            }
        }
    }
}
</style>