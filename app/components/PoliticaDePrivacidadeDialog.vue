<template>
  <Dialog :open="open" @update:open="onOpenChange">
    <DialogContent class="max-w-2xl max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Política de Privacidade</DialogTitle>
        <DialogDescription>
          Informações sobre como tratamos seus dados pessoais.
        </DialogDescription>
      </DialogHeader>

      <div class="space-y-4 text-sm text-muted-foreground">
        <p>
          Utilizamos seus dados pessoais exclusivamente para fins de autenticação,
          segurança de acesso aos eventos e comunicação relacionada aos serviços
          contratados.
        </p>
        <p>
          Alguns dados, como imagem facial e documentos de identificação, podem ser
          utilizados para validação de identidade e prevenção de fraudes.
        </p>
        <p>
          Seus dados não são compartilhados com terceiros para fins de marketing,
          e somente são tratados por parceiros quando isso for estritamente
          necessário para a prestação do serviço (por exemplo, provedores de
          infraestrutura e processamento).
        </p>
        <p>
          Você pode solicitar informações sobre os dados que mantemos a seu respeito,
          assim como pedir sua atualização ou exclusão, observadas as obrigações
          legais e contratuais.
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

