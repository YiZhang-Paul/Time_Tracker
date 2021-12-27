import { Store } from 'vuex';

declare module '@vue/runtime-core' {
    interface ComponentCustomProperties {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        $store: Store<any>;
    }
}
