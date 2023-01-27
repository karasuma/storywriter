<script lang="ts">
import { WorldDescription } from '@/logics/models/world-data';
import { Vue, Options } from 'vue-class-component';
import AutoResizeTextarea from '../dialogs/AutoResizeTextarea.vue';

@Options({
    components: {
        AutoResizeTextarea
    },
    props: {
        detail: {
            type: WorldDescription,
            required: true
        }
    }
})

export default class WorldDetailView extends Vue {
    detail!: WorldDescription;
}
</script>

<template>
    <div class="details">
        <input type="text" spellcheck="false" placeholder="..." v-model="detail.title" />
        <!-- <textarea spellcheck="false" v-model="detail.text"></textarea> -->
        <AutoResizeTextarea :value="detail.text" @input="detail.text = $event" />
    </div>
</template>

<style lang="scss" scoped>
@import '@/views/css/base-design.scss';

.details {
    border: solid 1px $Dim-Border-Color;
    border-radius: 8px;
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    & * {
        margin: 4px 8px;
        width: 90%;
    }
}
</style>