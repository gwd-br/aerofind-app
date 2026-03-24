<template>
  <Dialog :open="open" @update:open="onOpenChange">
    <DialogContent class="sm:max-w-md" :show-close-button="true">
      <DialogHeader>
        <DialogTitle>Novo acesso</DialogTitle>
        <DialogDescription>
          Preencha os dados do acesso. Ele será vinculado ao local atual.
        </DialogDescription>
      </DialogHeader>
      <form class="flex flex-col gap-4" @submit.prevent="handleSubmit">
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
            {{ submitting ? "Salvando…" : "Criar" }}
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
import { useLocalAcessoService } from "@/services/local-acesso";

const props = defineProps<{
  open: boolean;
  localId: number;
}>();

const emit = defineEmits<{
  (e: "update:open", value: boolean): void;
  (e: "saved"): void;
}>();

const { create } = useLocalAcessoService();
const submitting = ref(false);

const form = reactive({
  nome: "",
  descricao: null as string | null,
  andar: null as string | null,
});
const errors = reactive<{ nome?: string }>({});

watch(
  () => props.open,
  (open) => {
    if (open) {
      form.nome = "";
      form.descricao = null;
      form.andar = null;
      errors.nome = undefined;
    }
  },
);

function onOpenChange(value: boolean) {
  emit("update:open", value);
}

function validate(): boolean {
  errors.nome = !form.nome?.trim() ? "Informe o nome do acesso." : undefined;
  return !errors.nome;
}

async function handleSubmit() {
  if (!validate()) return;
  submitting.value = true;
  try {
    await create(props.localId, {
      nome: form.nome!,
      descricao: form.descricao?.trim() || null,
      andar: form.andar?.trim() || null,
    });
    toast.success("Acesso criado com sucesso.");
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
