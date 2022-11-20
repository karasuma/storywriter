<script lang="ts">
import { Setting } from '@/logics/models/setting';
import { Vue, Options } from 'vue-class-component';

@Options({
    props: {
        setting: {
            type: Setting,
            required: true
        }
    }
})

export default class SettingView extends Vue {
    setting!: Setting;
}
</script>

<template>
    <div id="setting">
        <div class="labels">
            <p>ダークモード</p>
            <p>画像の最大倍率</p>
            <p>画像拡大の大きさ</p>
        </div>
        <div class="controls">
            <input type="checkbox" disabled="true" v-model="setting.Darkmode" />
            <div class="controls__horizontal">
                <input type="range"
                        v-model="setting.ImageMaxExpandRate.current"
                        :min="setting.ImageMaxExpandRate.min"
                        :max="setting.ImageMaxExpandRate.max"
                />
                <p>{{ setting.ImageMaxExpandRate.current }} / {{ setting.ImageMaxExpandRate.max }}</p>
            </div>
            <div class="controls__horizontal">
                <input type="range"
                        v-model="setting.ImageExpandRate.current"
                        :min="setting.ImageExpandRate.min"
                        :max="setting.ImageExpandRate.max"
                />
                <p>{{ setting.ImageExpandRate.current }} / {{ setting.ImageExpandRate.max }}</p>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
@import '@/views/css/base-design.scss';

#setting {
    position: fixed;
    top: $Header-Height;
    bottom: $Footer-Height;
    min-height: calc( 100vh - #{$Header-Height} - #{$Footer-Height} - 2px );
    width: 100%;

    display: flex;
    align-items: flex-start;

    & > * {
        text-align: right;
        & > * {
            margin: 4px 0;
        }
    }

    & .labels {
        margin: 20px 0;
        padding: 0 20px;
        border-right: solid 1px $Dim-Border-Color;
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
        width: 300px;
        & > * {
            user-select: none;
        }
    }

    & .controls {
        margin: 20px 0;
        padding: 0 20px;
        display: flex;
        flex-direction: column;
        width: 100%;
        &__horizontal {
            display: flex;
            align-items: center;
            *:nth-child(1) {
                width: 100%;
            }
            *:nth-child(2) {
                text-align: left;
                width: 100px;
            }
            & > * {
                margin-right: 10px;
            }
        }
    }
}
</style>