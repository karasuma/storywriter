<script lang="ts">
import { StoryWriterObject } from '@/logics/models/storywriter-object';
import { Enumerable } from '@/logics/models/utils';
import { IpcUtils } from '@/logics/utils/ipc-utils';
import { Options, Vue } from 'vue-class-component';

@Options({
    props: {
        vm: {
            type: StoryWriterObject,
            required: true
        }
    },
    methods: {
        printHistory(uri: string): string {
            const file = /[^\\/]+$/u.exec(uri)?.[0] ?? "";
            return `${file} (${uri})`;
        },
        loadClicked(): void {
            IpcUtils.Send(IpcUtils.DefinedIpcChannels.Load);
        },
        newoneClicked(): void {
            this.vm.setting.IsTitle = false;
        }
    }
})

export default class EntranceView extends Vue {
    vm!: StoryWriterObject;

    caption = "Storywriter";
    comment = "v1.2.0 renewal!";
    news = new Array<string>();
    histories = new Array<string>();

    mounted(): void {
        for (const _ of Enumerable.Range(30)) {
            this.histories.push("C:\\Projects\\Projects\\Projects\\Private\\Storywriter\\storywriter-main\\src\\assets\\darkTemp\\sample.ysd");
            this.histories.push("C:\\Temp\\test.ysd");   
        }
    }
}
</script>

<template>
    <div id="entrance">
        <div class="news">
            <div class="news__caption">
                <p class="news__caption-txt">{{ caption }}</p>
                <p class="news__caption-comment">{{ comment }}</p>
            </div>
            <div class="news__list">
                <p class="news__list-item" v-for="item in news" :key="item">
                    {{ item }}
                </p>
            </div>
        </div>

        <div class="controls">
            <div class="controls__new" @click="newoneClicked">
                <img src="@/assets/dark/edit.png" />
                <p>新しく書き始める</p>
            </div>
            <div class="controls__load" @click="loadClicked">
                <img src="@/assets/dark/folder.png" />
                <p>途中から書き始める</p>
            </div>
        </div>

        <div class="history">
            <p class="history__caption">この間のお話</p>
            <div class="history__list">
                <p class="history__list-item" v-for="item in histories" :key="item">
                    {{ printHistory(item) }}
                </p>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
@import '@/views/css/base-design.scss';

#entrance {
    position: fixed;
    top: $Header-Height;
    bottom: $Footer-Height;
    min-height: calc( 100vh - #{$Header-Height} - #{$Footer-Height} - 2px );
    width: 100%;
    
    display: flex;
    flex-direction: column;

    * p {
        user-select: none;
        cursor: default;
    }

    & .news {
        margin: 3em auto;
        display: flex;
        flex-direction: column;
        justify-content: center;
        &__caption {
            display: flex;
            align-items: flex-end;
            &-txt {
                font-size: 3em;
            }
            &-comment {
                font-size: 1.3em;
                margin-left: 12px;
                margin-bottom: 4px;
            }
        }
    }

    & .controls {
        margin: 1em 20px;
        display: flex;
        justify-content: center;
        & > * {
            width: 30vw;
            margin: 0 40px;
            padding: 12px;
            display: flex;
            justify-content: center;
            align-items: center;
            border: solid 1px $Border-Color;
            border-radius: 8px;

            & > img {
                @include square-size(32px);
            }
            & > p {
                font-size: 1em;
                margin: 0 12px;
            }
        }
        & *:hover {
            background-color: $Hover-Color;
            cursor: pointer;
        }
    }

    & .history {
        margin: 5em 20px;
        display: flex;
        flex-direction: column;
        &__caption {
            font-size: 1.5em;
        }
        &__list {
            margin-left: 21px;
            display: flex;
            flex-direction: column;
            overflow-y: auto;
            overflow-x: hidden;
            max-height: calc( 100vh - 390px );
            &-item {
                font-size: 1em;
                min-height: 1.3em;
                margin-top: 4px;
                width: fit-content;
                max-width: 90vw;
                border-bottom: solid 1px transparent;
                @include hide-overflow-text;
                &:hover {
                    border-bottom: solid 1px $Font-Color;
                    cursor: pointer;
                }
            }
        }
    }
}
</style>