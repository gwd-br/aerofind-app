<template>
  <Dialog :open="open" @update:open="onOpenChange">
    <DialogContent class="sm:max-w-md" :show-close-button="true">
      <DialogHeader>
        <DialogTitle>Editar acesso</DialogTitle>
        <DialogDescription>
          Altere os dados do acesso. As alterações serão salvas ao clicar em Salvar.
        </DialogDescription>
      </DialogHeader>
      <form v-if="acesso" class="flex flex-col gap-4" @submit.prevent="handleSubmit">
        <div class="flex flex-col gap-2">
          <Label for="dialog-acesso-nome">Nome *</Label>
          <Input
            id="dialog-acesso-nome"
            v-model.trim="form.nome"
            :disabled="submitting"
            required
          />
          <p v-if="errors.nome" class="text-red-500 text-sm">{{ errors.nome }}</p>
        </div>
        <div class="flex flex-col gap-2">
          <Label for="dialog-acesso-descricao">Descrição</Label>
          <Input
            id="dialog-acesso-descricao"
            v-model.trim="form.descricao"
            :disabled="submitting"
          />
        </div>
        <div class="flex flex-col gap-2">
          <Label for="dialog-acesso-andar">Andar</Label>
          <Input
            id="dialog-acesso-andar"
            v-model.trim="form.andar"
            :disabled="submitting"
          />
        </div>
        <DialogFooter class="gap-2 sm:gap-0">
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
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
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
import type { LocalAcesso, UpdateLocalAcessoDTO } from "@/types/local-acesso";
import { useLocalAcessoService } from "@/services/local-acesso";

const props = defineProps<{
  open: boolean;
  acesso: LocalAcesso | null;
  localId: number;
}>();

const emit = defineEmits<{
  (e: "update:open", value: boolean): void;
  (e: "saved"): void;
}>();

const { update } = useLocalAcessoService();
const submitting = ref(false);

const form = reactive<UpdateLocalAcessoDTO>({
  nome: "",
  descricao: null,
  andar: null,
});
const errors = reactive<{ nome?: string }>({});

watch(
  () => [props.open, props.acesso] as const,
  ([open, acesso]) => {
    if (open && acesso) {
      form.nome = acesso.nome ?? "";
      form.descricao = acesso.descricao ?? null;
      form.andar = acesso.andar ?? null;
      errors.nome = undefined;
    }
  },
  { immediate: true },
);

function onOpenChange(value: boolean) {
  emit("update:open", value);
}

function validate(): boolean {
  errors.nome = !form.nome?.trim() ? "Informe o nome do acesso." : undefined;
  return !errors.nome;
}

async function handleSubmit() {
  if (!validate() || !props.acesso) return;
  submitting.value = true;
  try {
    await update(props.acesso.id, {
      nome: form.nome,
      descricao: form.descricao?.trim() || null,
      andar: form.andar?.trim() || null,
    });
    toast.success("Acesso atualizado com sucesso.");
    emit("update:open", false);
    emit("saved");
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erro ao salvar. Tente novamente.";
    toast.error(msg);
    errors.nome = msg;
  } finally {
    submitting.value = false;
  }
}
</script>
