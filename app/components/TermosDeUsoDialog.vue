<template>
  <Dialog :open="open" @update:open="onOpenChange">
    <DialogContent class="max-w-2xl max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Termos de Uso</DialogTitle>
        <DialogDescription>
          Regras para utilização da plataforma e acesso aos eventos.
        </DialogDescription>
      </DialogHeader>

      <div class="space-y-4 text-sm text-muted-foreground">
        <p>
          Ao utilizar a plataforma Face Tickets, você concorda em fornecer
          informações verdadeiras, atualizadas e completas, responsabilizando-se
          pelo sigilo de suas credenciais de acesso.
        </p>
        <p>
          Os ingressos são pessoais e intransferíveis, podendo exigir validação de
          identidade por meio de documentos e reconhecimento facial no acesso aos
          eventos.
        </p>
        <p>
          Qualquer tentativa de fraude, uso indevido de ingressos ou violação das
          regras estabelecidas pelo organizador do evento poderá resultar em
          bloqueio de conta e cancelamento de ingressos, sem direito a reembolso.
        </p>
        <p>
          A plataforma poderá sofrer atualizações e manutenções periódicas, podendo
          haver indisponibilidade temporária dos serviços, a qual envidaremos
          esforços razoáveis para minimizar.
        </p>
      </div>

      <DialogFooter class="mt-4">
        <Button type="button" variant="outline" @click="emit('update:open', false)">
          Fechar
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

const props = defineProps<{
  open: boolean;
}>();

const emit = defineEmits<{
  (e: "update:open", value: boolean): void;
}>();

function onOpenChange(value: boolean) {
  emit("update:open", value);
}
</script>

