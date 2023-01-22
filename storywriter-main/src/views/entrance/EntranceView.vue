<script lang="ts">
import { Information } from '@/logics/models/information';
import { StoryWriterObject } from '@/logics/models/storywriter-object';
import { IpcUtils } from '@/logics/utils/ipc-utils';
import SystemMessage from '@/logics/utils/SystemMessage';
import { Options, Vue } from 'vue-class-component';
import fs from 'fs';
import MessageDialog from '../dialogs/MessageDialog.vue';

@Options({
    components: {
        MessageDialog
    },
    props: {
        vm: {
            type: StoryWriterObject,
            required: true
        }
    },
    methods: {
        printHistory(uri: string): string {
            const file = /[^\\/]+$/u.exec(uri)?.[0] ?? "";
            return `${file.replace(".ysd", "")}  (${uri})`;
        },
        loadClicked(): void {
            IpcUtils.Send(IpcUtils.DefinedIpcChannels.Load);
        },
        async newoneClicked(): Promise<void> {
            IpcUtils.Send(IpcUtils.DefinedIpcChannels.DefaultStoryPath);
        },
        async openFile(path: string): Promise<void> {
            if(!fs.existsSync(path)) {
                this.currentPathIdx = this.vm.information.previousStories.indexOf(path);
                this.alertmsg = SystemMessage.Create(
                    "警告",
                    "ファイルが見つけられませんでした。履歴から削除しますか？",
                    SystemMessage.MessageType.Alert,
                    true
                );
                return;
            }
            this.vm.setting.URI = path;
            await this.vm.Load();
        },
        msgResult(result: number): void {
            if(result === SystemMessage.MessageResult.OK) {
                this.vm.information.previousStories.splice(this.currentPathIdx, 1);
                const json = JSON.stringify(this.vm.information, null, '\t');
                IpcUtils.Send(IpcUtils.DefinedIpcChannels.HomeData, json);
            }
        }
    }
})

export default class EntranceView extends Vue {
    vm!: StoryWriterObject;

    news = new Array<string>();
    alertmsg = new SystemMessage();
    currentPathIdx = "";

    mounted(): void {
        IpcUtils.ReceiveFromRelay(IpcUtils.DefinedIpcChannels.HomeData, (_, arg) => {
            const json = arg as string;
            if(json.length === 0) return; // Because background.ts proceed to save
            const info = JSON.parse(json) as Information;
            this.vm.information.Title = info.Title;
            this.vm.information.Subtitle = info.Subtitle;
            this.vm.information.News.splice(0);
            info.News.forEach(n => this.vm.information.News.push(n));
            this.vm.information.previousStories.splice(0);
            info.previousStories.forEach(s => this.vm.information.previousStories.push(s));
        });
        IpcUtils.Send(IpcUtils.DefinedIpcChannels.HomeData);

        IpcUtils.ReceiveFromRelay(IpcUtils.DefinedIpcChannels.DefaultStoryPath, async (_, arg) => {
            this.vm.setting.URI = arg as string;
            await this.vm.Load(true);
        })
    }
}
</script>

<template>
    <MessageDialog :message="alertmsg" :result="msgResult" />
    <div id="entrance">
        <div class="news">
            <div class="news__caption">
                <p class="news__caption-txt">{{ vm.information.Title }}</p>
                <p class="news__caption-comment">{{ vm.information.Subtitle }}</p>
            </div>
            <div class="news__list">
                <p class="news__list-item" v-for="item in vm.information.News" :key="item">
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
                <p class="history__list-item" v-for="item in vm.information.previousStories" :key="item"
                    @click="openFile(item)">
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
        &__list {
            margin-top: 12px;
            &-item {
                color: $Font-Color;
                line-height: 1.5em;
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