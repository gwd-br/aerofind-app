<template>
  <Dialog :open="open" @update:open="onOpenChange">
    <DialogContent class="sm:max-w-md" :show-close-button="true">
      <DialogHeader>
        <DialogTitle>Editar setor</DialogTitle>
        <DialogDescription>
          Altere os dados do setor. As alterações serão salvas ao clicar em
          Salvar.
        </DialogDescription>
      </DialogHeader>
      <form
        v-if="setor"
        class="flex flex-col gap-4"
        @submit.prevent="handleSubmit"
      >
        <div class="flex flex-col gap-2">
          <Label for="dialog-setor-nome_setor">Nome do setor *</Label>
          <Input
            id="dialog-setor-nome_setor"
            v-model.trim="form.nome_setor"
            :disabled="submitting"
            required
          />
          <p v-if="errors.nome_setor" class="text-red-500 text-sm">
            {{ errors.nome_setor }}
          </p>
        </div>
        <div class="flex flex-col gap-2">
          <Label for="dialog-setor-categoria">Categoria</Label>
          <Input
            id="dialog-setor-categoria"
            v-model.trim="form.categoria"
            :disabled="submitting"
          />
        </div>
        <div class="flex flex-col gap-2">
          <Label for="dialog-setor-area">Área</Label>
          <Input
            id="dialog-setor-area"
            v-model.trim="form.area"
            :disabled="submitting"
          />
        </div>
        <div class="flex flex-col gap-2">
          <Label for="dialog-setor-entrada">Entrada</Label>
          <Input
            id="dialog-setor-entrada"
            v-model.trim="form.entrada"
            :disabled="submitting"
          />
        </div>
        <div class="flex flex-col gap-2">
          <Label for="dialog-setor-inventario">Inventário</Label>
          <Input
            id="dialog-setor-inventario"
            v-model.trim="form.inventario"
            :disabled="submitting"
          />
        </div>
        <div class="flex items-center gap-2">
          <Switch
            id="dialog-setor-facial"
            :checked="form.facial"
            @update:checked="(v: boolean) => (form.facial = v)"
          />
          <Label for="dialog-setor-facial">Facial</Label>
        </div>
        <DialogFooter class="gap-2 sm:gap-0">
          <div class="flex justify-between w-full">
            <Button
              type="button"
              variant="outline"
              :disabled="submitting"
              @click="emit('update:open', false)"
            >
              Cancelar
            </Button>
            <Button type="submit" :disabled="submitting">
              {{ submitting ? "Salvando…" : "Salvar" }}
            </Button>
          </div>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "vue-sonner";
import { reactive, ref, watch } from "vue";
import type { Setor, UpdateSetorDTO } from "@/types/setor";
import { useSetorService } from "@/services/setor";

const props = defineProps<{
  open: boolean;
  setor: Setor | null;
  eventoId: number;
}>();

const emit = defineEmits<{
  (e: "update:open", value: boolean): void;
  (e: "saved"): void;
}>();

const { update } = useSetorService();
const submitting = ref(false);

const form = reactive<UpdateSetorDTO>({
  nome_setor: "",
  categoria: null,
  area: null,
  entrada: null,
  inventario: null,
  facial: false,
});
const errors = reactive<{ nome_setor?: string }>({});

watch(
  () => [props.open, props.setor] as const,
  ([open, setor]) => {
    if (open && setor) {
      form.nome_setor = setor.nome_setor ?? "";
      form.categoria = setor.categoria ?? null;
      form.area = setor.area ?? null;
      form.entrada = setor.entrada ?? null;
      form.inventario = setor.inventario ?? null;
      form.facial = setor.facial ?? false;
      errors.nome_setor = undefined;
    }
  },
  { immediate: true },
);

function onOpenChange(value: boolean) {
  emit("update:open", value);
}

function validate(): boolean {
  errors.nome_setor = !form.nome_setor?.trim()
    ? "Informe o nome do setor."
    : undefined;
  return !errors.nome_setor;
}

async function handleSubmit() {
  if (!validate() || !props.setor) return;
  submitting.value = true;
  try {
    await update(props.setor.id, {
      nome_setor: form.nome_setor,
      categoria: form.categoria?.trim() || null,
      area: form.area?.trim() || null,
      entrada: form.entrada?.trim() || null,
      inventario: form.inventario?.trim() || null,
      facial: form.facial ?? false,
    });
    toast.success("Setor atualizado com sucesso.");
    emit("update:open", false);
    emit("saved");
  } catch (e) {
    const msg =
      e instanceof Error ? e.message : "Erro ao salvar. Tente novamente.";
    toast.error(msg);
    errors.nome_setor = msg;
  } finally {
    submitting.value = false;
  }
}
</script>
