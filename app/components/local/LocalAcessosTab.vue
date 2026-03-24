<template>
  <Card>
    <CardHeader
      class="flex flex-row flex-wrap items-start justify-between gap-4 space-y-0 border-b pb-6"
    >
      <div class="space-y-1.5">
        <CardTitle>Acessos</CardTitle>
        <CardDescription>
          Locais de acesso vinculados a este local. Crie, edite ou exclua acessos.
        </CardDescription>
      </div>
      <Button size="sm" @click="openCreateDialog">
        Novo acesso
      </Button>
    </CardHeader>

    <CardContent class="pt-6">
      <div class="space-y-4">
        <p v-if="pending" class="text-muted-foreground text-sm">Carregando acessos...</p>
        <p v-else-if="error" class="text-destructive text-sm">Erro ao carregar acessos.</p>
        <template v-else>
          <p v-if="(acessos?.data?.length ?? 0) === 0" class="text-muted-foreground text-sm">
            Nenhum acesso vinculado a este local.
          </p>
          <template v-else>
            <div class="w-full border rounded-lg border-gray-200">
              <Table class="w-full table-auto">
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Andar</TableHead>
                    <TableHead class="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow v-for="acesso in acessos?.data" :key="acesso.id">
                    <TableCell class="align-middle py-2">
                      <span class="text-sm font-medium">{{ acesso.nome }}</span>
                    </TableCell>
                    <TableCell class="align-middle py-2 text-muted-foreground">
                      <span class="text-sm">{{ acesso.descricao || "—" }}</span>
                    </TableCell>
                    <TableCell class="align-middle py-2 text-muted-foreground">
                      <span class="text-sm">{{ acesso.andar || "—" }}</span>
                    </TableCell>
                    <TableCell class="align-middle py-2 text-right">
                      <div class="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          @click="openEdit(acesso)"
                        >
                          Editar
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          @click="openDeleteConfirm(acesso)"
                        >
                          Excluir
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </template>
        </template>
      </div>
    </CardContent>

    <CardFooter
      v-if="!pending && (acessos?.total ?? 0) > 0"
      class="flex flex-wrap items-center justify-between gap-4 border-t pt-6"
    >
      <UiPagination
        v-model:page="page"
        v-model:perPage="perPage"
        :total="acessos?.total ?? 0"
        :meta="acessos ?? null"
        :per-page-options="[5, 10, 25, 50]"
        :disabled="pending"
      />
    </CardFooter>
  </Card>

  <AlertDialog v-model:open="deleteDialogOpen">
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Excluir acesso</AlertDialogTitle>
        <AlertDialogDescription>
          Tem certeza que deseja excluir o acesso &quot;{{ acessoToDelete?.nome }}&quot;?
          Esta ação não pode ser desfeita.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Cancelar</AlertDialogCancel>
        <AlertDialogAction
          class="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          @click="confirmDelete"
        >
          Excluir
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>

  <LocalAcessoCreateDialog
    :open="createDialogOpen"
    :local-id="localId"
    @update:open="createDialogOpen = $event"
    @saved="onSaved"
  />

  <LocalAcessoEditDialog
    :open="editDialogOpen"
    :acesso="selectedAcesso"
    :local-id="localId"
    @update:open="editDialogOpen = $event"
    @saved="onSaved"
  />
</template>

<script setup lang="ts">
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
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
import type { LocalAcesso } from "@/types/local-acesso";
import type { PaginatedResponse } from "@/types/common";
import { useLocalAcessoService } from "@/services/local-acesso";
import LocalAcessoCreateDialog from "@/components/local/LocalAcessoCreateDialog.vue";
import LocalAcessoEditDialog from "@/components/local/LocalAcessoEditDialog.vue";
import UiPagination from "@/components/ui/pagination/UiPagination.vue";
import { toast } from "vue-sonner";

const props = defineProps<{
  localId: number;
}>();

const { listByLocal, remove } = useLocalAcessoService();
const page = ref(1);
const perPage = ref(10);
const createDialogOpen = ref(false);
const editDialogOpen = ref(false);
const selectedAcesso = ref<LocalAcesso | null>(null);
const deleteDialogOpen = ref(false);
const acessoToDelete = ref<LocalAcesso | null>(null);

function openDeleteConfirm(acesso: LocalAcesso) {
  acessoToDelete.value = acesso;
  deleteDialogOpen.value = true;
}

async function confirmDelete() {
  if (!acessoToDelete.value) return;
  await handleDelete(acessoToDelete.value.id);
  deleteDialogOpen.value = false;
  acessoToDelete.value = null;
}

const {
  data: acessos,
  pending,
  error,
  refresh,
} = await useAsyncData<PaginatedResponse<LocalAcesso>>(
  () => ["local-acessos", props.localId, page.value, perPage.value].join(":"),
  () =>
    listByLocal(props.localId, {
      page: page.value,
      per_page: perPage.value,
    }),
  { watch: [page, perPage, () => props.localId] },
);

function openCreateDialog() {
  createDialogOpen.value = true;
}

function openEdit(acesso: LocalAcesso) {
  selectedAcesso.value = acesso;
  editDialogOpen.value = true;
}

async function handleDelete(id: number) {
  try {
    await remove(id);
    await refresh();
    toast.success("Acesso excluído com sucesso.");
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erro ao excluir acesso.";
    toast.error(msg);
  }
}

function onSaved() {
  refresh();
}
</script>
