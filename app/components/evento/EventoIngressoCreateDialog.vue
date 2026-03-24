<template>
  <Dialog :open="open" @update:open="onOpenChange">
    <DialogContent class="sm:max-w-lg" :show-close-button="true">
      <DialogHeader>
        <DialogTitle>Novo ingresso</DialogTitle>
        <DialogDescription>
          Preencha os dados do ingresso. Ele será vinculado ao evento atual.
        </DialogDescription>
      </DialogHeader>
      <form class="flex flex-col gap-4" @submit.prevent="handleSubmit">
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div class="flex flex-col gap-2">
            <Label for="dialog-ingresso-barcode">Código / Barcode</Label>
            <Input
              id="dialog-ingresso-barcode"
              v-model.trim="form.barcode"
              placeholder="Opcional"
              :disabled="submitting"
            />
          </div>
          <div class="flex flex-col gap-2">
            <Label for="dialog-ingresso-num_pedido">Nº pedido</Label>
            <Input
              id="dialog-ingresso-num_pedido"
              v-model.trim="form.num_pedido"
              placeholder="Opcional"
              :disabled="submitting"
            />
          </div>
        </div>
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div class="flex flex-col gap-2">
            <Label for="dialog-ingresso-tipo_ingresso">Tipo ingresso</Label>
            <Input
              id="dialog-ingresso-tipo_ingresso"
              v-model.trim="form.tipo_ingresso"
              placeholder="Ex: Inteira, Meia..."
              :disabled="submitting"
            />
          </div>
          <div class="flex flex-col gap-2">
            <Label for="dialog-ingresso-status">Status</Label>
            <Input
              id="dialog-ingresso-status"
              v-model.trim="form.status"
              placeholder="Opcional"
              :disabled="submitting"
            />
          </div>
        </div>
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div class="flex flex-col gap-2">
            <Label for="dialog-ingresso-tipo_entrega">Tipo entrega</Label>
            <Input
              id="dialog-ingresso-tipo_entrega"
              v-model.trim="form.tipo_entrega"
              :disabled="submitting"
            />
          </div>
          <div class="flex flex-col gap-2">
            <Label for="dialog-ingresso-tipo_venda">Tipo venda</Label>
            <Input
              id="dialog-ingresso-tipo_venda"
              v-model.trim="form.tipo_venda"
              :disabled="submitting"
            />
          </div>
        </div>
        <div class="flex flex-col gap-2">
          <Label for="dialog-ingresso-setor">Setor</Label>
          <Select v-model="setoresFkSelectValue" :disabled="submitting">
            <SelectTrigger id="dialog-ingresso-setor">
              <SelectValue placeholder="Selecione o setor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">Nenhum</SelectItem>
              <SelectItem
                v-for="s in setores"
                :key="s.id"
                :value="String(s.id)"
              >
                {{ s.nome_setor ?? `Setor ${s.id}` }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div class="flex flex-col gap-2">
            <Label for="dialog-ingresso-dt_compra">Data compra</Label>
            <Input
              id="dialog-ingresso-dt_compra"
              :model-value="form.dt_compra ?? ''"
              type="date"
              :disabled="submitting"
              @update:model-value="form.dt_compra = ($event as string) || null"
            />
          </div>
          <div class="flex flex-col gap-2">
            <Label for="dialog-ingresso-dt_venda">Data venda</Label>
            <Input
              id="dialog-ingresso-dt_venda"
              :model-value="form.dt_venda ?? ''"
              type="date"
              :disabled="submitting"
              @update:model-value="form.dt_venda = ($event as string) || null"
            />
          </div>
        </div>
        <div class="flex flex-col gap-2">
          <Label for="dialog-ingresso-url_onboarding">URL onboarding</Label>
          <Input
            id="dialog-ingresso-url_onboarding"
            v-model.trim="form.url_onboarding"
            placeholder="Opcional"
            :disabled="submitting"
          />
        </div>
        <div class="flex items-center gap-2">
          <Switch
            id="dialog-ingresso-enviado_acesso"
            :checked="form.enviado_acesso === true"
            @update:checked="(v: boolean) => (form.enviado_acesso = v)"
          />
          <Label for="dialog-ingresso-enviado_acesso">Enviado acesso</Label>
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
              {{ submitting ? "Salvando…" : "Criar" }}
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "vue-sonner";
import { reactive, ref, watch, computed } from "vue";
import type { CreateIngressoDTO } from "@/types/ingresso";
import type { Setor } from "@/types/setor";
import { useIngressoService } from "@/services/ingresso";

const props = defineProps<{
  open: boolean;
  eventoId: number;
  setores: Setor[];
}>();

const emit = defineEmits<{
  (e: "update:open", value: boolean): void;
  (e: "saved"): void;
}>();

const { create } = useIngressoService();
const submitting = ref(false);

const form = reactive<CreateIngressoDTO>({
  barcode: null,
  num_pedido: null,
  tipo_ingresso: null,
  tipo_entrega: null,
  tipo_venda: null,
  status: null,
  setores_fk: null,
  evento_fk: null,
  dt_compra: null,
  dt_venda: null,
  enviado_acesso: false,
  url_onboarding: null,
});

const setoresFkSelectValue = computed({
  get: () => (form.setores_fk != null ? String(form.setores_fk) : "__none__"),
  set: (v: string) => {
    form.setores_fk = v === "__none__" || v === "" ? null : Number(v);
  },
});

watch(
  () => props.open,
  (open) => {
    if (open) {
      form.barcode = null;
      form.num_pedido = null;
      form.tipo_ingresso = null;
      form.tipo_entrega = null;
      form.tipo_venda = null;
      form.status = null;
      form.setores_fk = null;
      form.evento_fk = props.eventoId;
      form.dt_compra = null;
      form.dt_venda = null;
      form.enviado_acesso = false;
      form.url_onboarding = null;
    }
  },
);

function onOpenChange(value: boolean) {
  emit("update:open", value);
}

async function handleSubmit() {
  submitting.value = true;
  try {
    await create({
      ...form,
      evento_fk: props.eventoId,
      barcode: form.barcode?.trim() || null,
      num_pedido: form.num_pedido?.trim() || null,
      tipo_ingresso: form.tipo_ingresso?.trim() || null,
      tipo_entrega: form.tipo_entrega?.trim() || null,
      tipo_venda: form.tipo_venda?.trim() || null,
      status: form.status?.trim() || null,
      setores_fk: form.setores_fk ?? null,
      dt_compra: form.dt_compra || null,
      dt_venda: form.dt_venda || null,
      url_onboarding: form.url_onboarding?.trim() || null,
      enviado_acesso: form.enviado_acesso ?? false,
    });
    toast.success("Ingresso criado com sucesso.");
    emit("update:open", false);
    emit("saved");
  } catch (e) {
    const msg =
      e instanceof Error ? e.message : "Erro ao salvar. Tente novamente.";
    toast.error(msg);
  } finally {
    submitting.value = false;
  }
}
</script>
