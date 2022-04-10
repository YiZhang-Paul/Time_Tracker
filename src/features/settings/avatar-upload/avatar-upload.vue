<template>
    <div class="avatar-upload-container">
        <div v-if="!src" class="placeholder" :style="{ 'background-image': `url(${placeholderUrl})` }"></div>

        <cropper v-if="src"
            class="cropper"
            :stencil-component="circleStencil"
            :src="src"
            @change="onAvatarChange($event)">
        </cropper>

        <div class="actions">
            <span>Change Your Avatar</span>
            <input type="file" @change="onAvatarSelect($event.target.files)" accept="image/*" />
        </div>
    </div>
</template>

<script lang="ts">
import { markRaw } from '@vue/reactivity';
import { Options, Vue } from 'vue-class-component';
import { CircleStencil, Cropper } from 'vue-advanced-cropper';

@Options({
    components: {
        Cropper
    },
    emits: [
        'change'
    ]
})
export default class AvatarUpload extends Vue {
    public readonly circleStencil = markRaw(CircleStencil);
    public src = '';
    public mime = '';

    get placeholderUrl(): string {
        return require('../../../assets/images/avatar_placeholder.png');
    }

    public unmounted(): void {
        this.clearImage();
    }

    public onAvatarChange({ canvas }: { canvas: HTMLCanvasElement }): void {
        canvas.toBlob(_ => this.$emit('change', _), this.mime);
    }

    public onAvatarSelect(files: File[]): void {
        if (!files?.[0]) {
            return;
        }

        this.clearImage();
        const image = files[0];
        const reader = new FileReader();

        reader.onload = () => {
            this.src = URL.createObjectURL(image);
            this.mime = image.type;
        };

        reader.readAsArrayBuffer(image);
    }

    private clearImage(): void {
        if (this.src) {
            URL.revokeObjectURL(this.src);
        }
    }
}
</script>

<style lang="scss" scoped>
.avatar-upload-container {
    @import '../../../styles/presets.scss';
    @import '../../../styles/animations.scss';

    @include flex-row(flex-end, center);

    .placeholder, .cropper {
        $dimension: 15vh;

        width: $dimension;
        min-width: $dimension;
        height: $dimension;
        min-height: $dimension;
        @include animate-property(opacity, 0, 1, 0.6s, 0.2s);
    }

    .placeholder {
        background-repeat: no-repeat;
        background-position: center center;
        background-size: contain;
    }

    .actions {
        @include flex-column(flex-start, center);
        margin-left: 3.5vh;

        span {
            margin-bottom: 1vh;
        }
    }
}
</style>
