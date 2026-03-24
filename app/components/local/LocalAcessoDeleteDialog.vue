<template>
  <Dialog :open="open" @update:open="onOpenChange">
    <DialogContent class="sm:max-w-md" :show-close-button="true">
      <DialogHeader>
        <DialogTitle>Excluir local de acesso</DialogTitle>
        <DialogDescription>
          Tem certeza que deseja excluir o local de acesso &quot;{{ acesso?.nome }}&quot;?
          Esta ação não pode ser desfeita.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter class="gap-2 sm:gap-0">
        <Button
          type="button"
          variant="outline"
          :disabled="submitting"
          @click="emit('update:open', false)"
        >
          Cancelar
        </Button>
        <Button
          type="button"
          variant="destructive"
          class="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          :disabled="submitting"
          @click="handleDelete"
        >
          {{ submitting ? "Excluindo…" : "Excluir" }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "vue-sonner";
import { ref } from "vue";
import type { LocalAcesso } from "@/types/local-acesso";
import { useLocalAcessoService } from "@/services/local-acesso";

const props = defineProps<{
  open: boolean;
  acesso: LocalAcesso | null;
}>();

const emit = defineEmits<{
  (e: "update:open", value: boolean): void;
  (e: "deleted"): void;
}>();

const { remove } = useLocalAcessoService();
const submitting = ref(false);

function onOpenChange(value: boolean) {
  emit("update:open", value);
}

async function handleDelete() {
  if (!props.acesso) return;
  submitting.value = true;
  try {
    await remove(props.acesso.id);
    toast.success("Local de acesso excluído com sucesso.");
    emit("update:open", false);
    emit("deleted");
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erro ao excluir.";
    toast.error(msg);
  } finally {
    submitting.value = false;
  }
}
</script>
