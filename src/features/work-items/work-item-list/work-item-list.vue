<template>
    <div class="work-item-list-container">
        <interruption-item-list class="interruption-item-list"
            :searchText="searchText"
            @select="$emit('select:interruption', $event)">
        </interruption-item-list>

        <task-item-list class="task-item-list"
            :searchText="searchText"
            @select="$emit('select:task', $event)">
        </task-item-list>
    </div>
</template>

<script lang="ts">
import { Options, Vue, prop } from 'vue-class-component';

import InterruptionItemList from './interruption-item-list/interruption-item-list.vue';
import TaskItemList from './task-item-list/task-item-list.vue';

class WorkItemListProp {
    public searchText = prop<string>({ default: '' });
}

@Options({
    components: {
        InterruptionItemList,
        TaskItemList
    },
    emits: [
        'select:interruption',
        'select:task'
    ]
})
export default class WorkItemList extends Vue.with(WorkItemListProp) { }
</script>

<style lang="scss" scoped>
.work-item-list-container {
    position: relative;

    .interruption-item-list, .task-item-list {
        position: absolute;
        top: 0;
        width: 20%;
        height: 100%;
    }

    .interruption-item-list {
        left: 0;
    }

    .task-item-list {
        right: 0;
    }
}
</style>
