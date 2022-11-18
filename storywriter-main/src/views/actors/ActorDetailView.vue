<script lang="ts">
import { ActorDetail } from '@/logics/models/actor-data';
import { Vue, Options } from 'vue-class-component';

@Options({
    props: {
        detail: {
            type: ActorDetail,
            required: true
        }
    }
})

export default class ActorDetailView extends Vue {
    detail!: ActorDetail;
}
</script>

<template>
    <div class="actorDetail">
        <input type="text" spellcheck="false" placeholder="..." v-model="detail.title" />
        <textarea spellcheck="false" placeholder="..." v-model="detail.description"></textarea>
    </div>
</template>

<style lang="scss" scoped>
@import '@/views/css/base-design.scss';

.actorDetail {
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