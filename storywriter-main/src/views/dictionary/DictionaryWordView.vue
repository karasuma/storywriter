<template>
    <InputDialog :inputMessage="inputmsg" :result="addDict" />
    <div id="DictWords" :style="widthCss">
        <div class="search">
            <img src="@/assets/dark/search.png" />
            <input type="text" spellcheck="false" placeholder="..." v-model="searchword" :style="inputCss" />
        </div>

        <div class="word selectable" v-for="d in filteredDicts" :key="d.id" :id="d.id"
            :style="selectedCss(d)" :title="d.caption" @click="setEdit(d)">
            <p class="word__caption">{{ d.caption }}</p>
            <p class="word__description">{{ d.description.length == 0 ? "..." : d.description }}</p>
        </div>

        <div class="add">
            <img class="add__image selectable" @click="addDictClicked()"
                 src="@/assets/dark/add.png" title="用語の追加" />
        </div>
    </div>
</template>

<style lang="scss" scoped>
@import '@/views/css/base-design.scss';

#DictWords {
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

    & .word {
        width: calc( 100% - 3px );
        height: 4em;
        min-height: 4em;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-content: center;
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

        &__caption {
            margin: 2px 6px;
            font-size: 21px;
            font-weight: bold;
            height: 1.3em;
        }
        &__description {
            margin: 2px 6px;
            font-size: 12px;
            width: calc(100% - 22px);
            height: 1.3em;
            opacity: 0.6;
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
        }
    }
}
</style>

<script lang="ts">
import { Dictionaries, DictionaryContent } from '@/logics/models/dictionary-data';
import InputMessage from '@/logics/utils/input-message';
import { Vue, Options } from 'vue-class-component';
import InputDialog from '../dialogs/InputDialog.vue';

@Options({
    components: {
        InputDialog
    },
    props: {
        dict: {
            type: Dictionaries,
            required: true
        },
        width: {
            type: String,
            required: true
        }
    },
    methods: {
        selectedCss(dict: DictionaryContent): string {
            if(dict.isEditing) {
                return "border-left: solid 3px orange; opacity: 1;";
            }
            return "border-left: solid 3px transparent;";
        },
        addDictClicked(): void {
            this.inputmsg = InputMessage.Create("新しい用語の追加");
        },
        addDict(caption: string): void {
            this.dict.Add(caption);
        },
        setEdit(d: DictionaryContent): void {
            this.dict.dictionaries.forEach((x: DictionaryContent) => {
                x.isEditing = false;
            });
            d.isEditing = true;
        }
    },
    computed: {
        widthCss: function(): string {
            return `width: ${this.width};`;
        },
        inputCss: function(): string {
            return `width: ${this.width * 0.4};`;
        },
        filteredDicts: function(): Array<DictionaryContent> {
            const dicts = this.dict.dictionaries;
            if(this.searchword.length == 0) {
                return dicts;
            }
            return dicts.filter((x: DictionaryContent) => x.caption.indexOf(this.searchword) >= 0);
        }
    }
})

export default class DictionaryWordView extends Vue {
    dict!: Dictionaries;
    width!: string;
    searchword = "";
    inputmsg = new InputMessage();
}
</script>