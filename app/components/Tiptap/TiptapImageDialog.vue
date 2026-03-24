<template>
    <Dialog title="Selecionar Imagem" :show="show" @close="closeDialog">
        <div
            v-bind="getRootProps()"
            class="rounded-lg border border-gray-300 p-4"
        >
            <input v-bind="getInputProps()" />

            <!-- Lista de imagens base64 -->
            <div
                v-if="imageListRef.length > 0"
                class="grid grid-cols-3 gap-3 sm:grid-cols-4"
            >
                <button
                    v-for="(image, index) in imageListRef"
                    :key="index"
                    @click="insertImage(image.base64)"
                    type="button"
                    class="rounded-md border border-gray-300 p-1"
                >
                    <img
                        :src="image.base64"
                        alt="Imagem"
                        class="aspect-square object-scale-down object-center"
                    />
                </button>
            </div>

            <!-- Área de drop -->
            <div
                :class="[
                    isDragActive ? 'bg-gray-100' : '',
                    imageListRef.length > 0 ? 'mt-4 ' : '',
                ]"
                class="rounded-lg border border-dashed border-gray-300 px-8 py-12"
            >
                <p
                    v-if="isDragActive"
                    class="text-center text-sm font-medium text-gray-700"
                >
                    Solte os arquivos aqui ...
                </p>
                <p v-else class="text-center text-sm font-medium text-gray-700">
                    Arraste e solte um arquivo de imagem aqui ou clique para
                    selecionar
                </p>
            </div>
        </div>
    </Dialog>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useDropzone } from "vue3-dropzone";
import Dialog from "./Dialog.vue";

defineProps<{ show: boolean }>();
const emit = defineEmits<{
    (e: "close"): void;
    (e: "insert", url: string): void;
}>();

const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: "image/png,image/jpeg",
    multiple: false,
    onDrop: onDropImage,
    noClick: true,
});

// Lista de imagens armazenadas localmente
const imageListRef = ref<{ base64: string }[]>([]);

function closeDialog() {
    emit("close");
}

// Função para converter imagem em base64
function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
    });
}

// Função chamada ao soltar uma imagem
async function onDropImage(acceptedFiles: File[]) {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    const base64 = await fileToBase64(file);

    // Adiciona a imagem convertida na lista
    imageListRef.value.push({ base64 });
}

// Inserir imagem no editor
function insertImage(url: string) {
    emit("insert", url);
    closeDialog();
}
</script>
