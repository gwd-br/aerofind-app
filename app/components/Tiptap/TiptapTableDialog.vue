<template>
    <Dialog title="Tambah Tabel" :show="show" @close="closeDialog">
        <form @submit.prevent="onSubmit">
            <div class="flex flex-col space-y-5">
                <div class="flex flex-row space-x-5">
                    <InputContainer class="w-full flex-1">
                        <Label for="input-table-columns">Colunas</Label>
                        <Input
                            v-model="inputColumnsRef"
                            id="input-table-columns"
                            required
                            type="number"
                            min="1"
                            class="w-full"
                        />
                    </InputContainer>
                    <InputContainer class="w-full flex-1">
                        <Label for="input-table-rows">Linhas</Label>
                        <Input
                            v-model="inputRowsRef"
                            id="input-table-rows"
                            required
                            type="number"
                            min="1"
                            class="w-full"
                        />
                    </InputContainer>
                </div>
                <div class="flex flex-row items-center space-x-3">
                    <Switch
                        id="input-table-header"
                        v-model="inputWithHeaderRef"
                    />
                    <ShadcnLabel
                        for="input-table-header"
                        class="select-none text-sm text-gray-600 cursor-pointer"
                    >
                        Adicionar Cabeçalho
                    </ShadcnLabel>
                </div>
                <div class="flex flex-row justify-end space-x-3">
                    <button
                        type="button"
                        class="rounded-md px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-100"
                        @click="closeDialog"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        class="rounded-md bg-blue-700 px-4 py-3 text-sm font-medium text-white hover:bg-opacity-80"
                    >
                        Adicionar
                    </button>
                </div>
            </div>
        </form>
    </Dialog>
</template>

<script setup lang="ts">
import { ref } from "vue";
import Dialog from "./Dialog.vue";
import type Table from "@/models/table";
import InputContainer from "./InputContainer.vue";
import Label from "./Label.vue";
import Input from "./Input.vue";
import { Switch } from "@/components/ui/switch";
import { Label as ShadcnLabel } from "@/components/ui/label";

defineProps<{
    show: boolean;
}>();

const emit = defineEmits<{
    (e: "close"): void;
    (e: "insert", table: Table): void;
}>();

const inputColumnsRef = ref<number>(3);
const inputRowsRef = ref<number>(3);
const inputWithHeaderRef = ref<boolean>(true);

function closeDialog() {
    emit("close");
}

function onSubmit() {
    emit("insert", {
        rows: inputRowsRef.value,
        columns: inputColumnsRef.value,
        withHeader: inputWithHeaderRef.value,
    });
    closeDialog();
}
</script>
