<template>
  <Dialog :open="open" @update:open="onOpenChange">
    <DialogContent class="sm:max-w-md" :show-close-button="true">
      <DialogHeader>
        <DialogTitle>
          {{ hasPortador ? "Editar portador" : "Definir portador" }}
        </DialogTitle>
        <DialogDescription>
          Informe os dados do portador que será vinculado a este ingresso.
        </DialogDescription>
      </DialogHeader>

      <form class="flex flex-col gap-4" @submit.prevent="handleSubmit">
        <div class="flex flex-col gap-2">
          <Label for="dialog-portador-nome">Nome do portador</Label>
          <Input
            id="dialog-portador-nome"
            v-model.trim="nome"
            placeholder="Nome completo"
            :disabled="submitting"
            required
          />
        </div>

        <div class="flex flex-col gap-2">
          <Label for="dialog-portador-cpf">CPF</Label>
          <Input
            id="dialog-portador-cpf"
            v-model="cpf"
            placeholder="000.000.000-00"
            :disabled="submitting"
            inputmode="numeric"
            autocomplete="off"
            v-maska="{ mask: '###.###.###-##' }"
          />
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
            <Button type="submit" :disabled="submitting || !ingresso">
              {{ submitting ? "Salvando…" : "Salvar portador" }}
            </Button>
          </div>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Ingresso } from "@/types/ingresso";
import { toast } from "vue-sonner";
import { usePortadorService } from "@/services/portador";
import { vMaska } from "maska/vue";

const props = defineProps<{
  open: boolean;
  ingresso: Ingresso | null;
}>();

const emit = defineEmits<{
  (e: "update:open", value: boolean): void;
  (e: "updated"): void;
}>();

const nome = ref("");
const cpf = ref("");
const submitting = ref(false);

const hasPortador = computed(() => !!props.ingresso?.portador);

const { saveForIngresso } = usePortadorService();

watch(
  () => props.open,
  (value) => {
    if (value) {
      nome.value = props.ingresso?.portador?.nome ?? "";
      cpf.value = props.ingresso?.portador?.cpf ?? "";
    }
  },
);

function onOpenChange(value: boolean) {
  if (!value) {
    emit("update:open", false);
    return;
  }
  emit("update:open", true);
}

async function handleSubmit() {
  if (!props.ingresso) return;

  if (!nome.value.trim()) {
    toast.error("Informe o nome do portador.");
    return;
  }

  submitting.value = true;
  try {
    const rawCpfDigits = cpf.value.replace(/\D/g, "") || null;

    await saveForIngresso(props.ingresso.id, {
      nome: nome.value.trim(),
      cpf: rawCpfDigits,
    });

    toast.success("Portador vinculado ao ingresso com sucesso.");
    emit("update:open", false);
    emit("updated");
  } catch (e) {
    const msg =
      e instanceof Error
        ? e.message
        : "Erro ao salvar portador. Tente novamente.";
    toast.error(msg);
  } finally {
    submitting.value = false;
  }
}
</script>
