<template>
  <Dialog :open="open" @update:open="onOpenChange">
    <DialogContent class="sm:max-w-lg" :show-close-button="true">
      <DialogHeader>
        <DialogTitle>Locais de acesso</DialogTitle>
        <DialogDescription>
          Locais de acesso vinculados ao setor &quot;{{
            setor?.nome_setor
          }}&quot;.
        </DialogDescription>
      </DialogHeader>

      <div class="flex flex-col gap-4">
        <div class="flex justify-end">
          <Button size="sm" :disabled="pending" @click="openCreateDialog">
            Adicionar local
          </Button>
        </div>

        <p v-if="pending" class="text-muted-foreground text-sm">
          Carregando...
        </p>
        <p v-else-if="error" class="text-destructive text-sm">
          Erro ao carregar locais de acesso.
        </p>
        <template v-else>
          <Alert v-if="(acessos?.data?.length ?? 0) === 0" variant="info">
            <AlertTitle>Nenhum local de acesso vinculado</AlertTitle>
            <AlertDescription>
              Nenhum local de acesso vinculado. Clique em Adicionar local para
              vincular.
            </AlertDescription>
          </Alert>
          <div v-else class="border rounded-lg border-gray-200">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead class="w-[100px] text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-for="acesso in acessos?.data" :key="acesso.id">
                  <TableCell class="align-middle py-2">
                    <span class="text-sm">{{
                      acesso.nome ?? `Local #${acesso.id}`
                    }}</span>
                  </TableCell>
                  <TableCell class="align-middle py-2 text-right">
                    <Button
                      variant="destructive"
                      size="sm"
                      :disabled="removingId === acesso.id"
                      @click="confirmRemove(acesso)"
                    >
                      {{ removingId === acesso.id ? "Excluindo…" : "Excluir" }}
                    </Button>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </template>
      </div>

      <AlertDialog v-model:open="deleteDialogOpen">
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Desvincular local de acesso</AlertDialogTitle>
            <AlertDialogDescription>
              Deseja remover o local &quot;{{
                acessoToRemove?.nome ?? `#${acessoToRemove?.id}`
              }}&quot; deste setor? O local continuará existindo; apenas o
              vínculo será removido.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              class="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              :disabled="removingId !== null"
              @click="doRemove"
            >
              Excluir vínculo
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DialogContent>
  </Dialog>

  <EventoSetorLocaisCreateDialog
    :open="createDialogOpen"
    :setor="setor"
    :setor-acessos-ids="setorAcessosIds"
    :evento-id="setor?.eventos_fk ?? 0"
    @update:open="createDialogOpen = $event"
    @saved="onAdded"
  />
</template>

<script setup lang="ts">
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { Setor } from "@/types/setor";
import type { LocalAcesso } from "@/types/local-acesso";
import type { PaginatedResponse } from "@/types/common";
import { useSetorAcessoService } from "@/services/setor-acesso";
import EventoSetorLocaisCreateDialog from "@/components/evento/EventoSetorLocaisCreateDialog.vue";
import { toast } from "vue-sonner";

const props = defineProps<{
  open: boolean;
  setor: Setor | null;
}>();

const emit = defineEmits<{
  (e: "update:open", value: boolean): void;
}>();

const { list, remove } = useSetorAcessoService();
const createDialogOpen = ref(false);
const deleteDialogOpen = ref(false);
const acessoToRemove = ref<LocalAcesso | null>(null);
const removingId = ref<number | null>(null);

const setorId = computed(() => props.setor?.id ?? 0);

const {
  data: acessos,
  pending,
  error,
  refresh,
} = await useAsyncData<PaginatedResponse<LocalAcesso>>(
  () => ["setor-acessos", setorId.value, props.open].join(":"),
  () =>
    setorId.value && props.open
      ? list(setorId.value, { per_page: 100 })
      : Promise.resolve({
          data: [],
          total: 0,
          current_page: 1,
          last_page: 1,
          per_page: 100,
        }),
  { watch: [setorId, () => props.open], immediate: true },
);

const setorAcessosIds = computed(() =>
  (acessos.value?.data ?? []).map((a) => a.id),
);

function onOpenChange(value: boolean) {
  emit("update:open", value);
}

function openCreateDialog() {
  createDialogOpen.value = true;
}

function onAdded() {
  refresh();
}

function confirmRemove(acesso: LocalAcesso) {
  acessoToRemove.value = acesso;
  deleteDialogOpen.value = true;
}

async function doRemove() {
  if (!acessoToRemove.value || !setorId.value) return;
  removingId.value = acessoToRemove.value.id;
  try {
    await remove(setorId.value, acessoToRemove.value.id);
    toast.success("Local de acesso desvinculado.");
    deleteDialogOpen.value = false;
    acessoToRemove.value = null;
    await refresh();
  } catch (e) {
    toast.error(e instanceof Error ? e.message : "Erro ao desvincular.");
  } finally {
    removingId.value = null;
  }
}
</script>
