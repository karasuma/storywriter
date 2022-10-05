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
    & * {
        margin: 8px 0;
    }
    & input {
        width: 100%;
    }
}
</style>