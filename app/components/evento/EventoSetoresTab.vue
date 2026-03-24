<template>
  <Card>
    <CardHeader
      class="flex flex-row flex-wrap items-start justify-between gap-4 space-y-0 border-b pb-6"
    >
      <div class="space-y-1.5">
        <CardTitle>Setores</CardTitle>
        <CardDescription>
          Setores vinculados a este evento. Crie, edite ou exclua setores.
        </CardDescription>
      </div>
      <Button size="sm" @click="openCreateDialog">
        Novo setor
      </Button>
    </CardHeader>

    <CardContent class="pt-6">
      <div class="space-y-4">
        <p v-if="pending" class="text-muted-foreground text-sm">Carregando setores...</p>
        <p v-else-if="error" class="text-destructive text-sm">Erro ao carregar setores.</p>
        <template v-else>
          <p v-if="(setores?.data?.length ?? 0) === 0" class="text-muted-foreground text-sm">
            Nenhum setor vinculado a este evento.
          </p>
          <template v-else>
            <div class="w-full border rounded-lg border-gray-200">
              <Table class="w-full table-auto">
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Área</TableHead>
                    <TableHead>Entrada</TableHead>
                    <TableHead>Inventário</TableHead>
                    <TableHead>Facial</TableHead>
                    <TableHead>Locais de acesso</TableHead>
                    <TableHead class="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow v-for="setor in setores?.data" :key="setor.id">
                    <TableCell class="align-middle py-2">
                      <span class="text-sm font-medium">{{ setor.nome_setor }}</span>
                    </TableCell>
                    <TableCell class="align-middle py-2 text-muted-foreground">
                      <span class="text-sm">{{ setor.categoria || "—" }}</span>
                    </TableCell>
                    <TableCell class="align-middle py-2 text-muted-foreground">
                      <span class="text-sm">{{ setor.area || "—" }}</span>
                    </TableCell>
                    <TableCell class="align-middle py-2 text-muted-foreground">
                      <span class="text-sm">{{ setor.entrada || "—" }}</span>
                    </TableCell>
                    <TableCell class="align-middle py-2 text-muted-foreground">
                      <span class="text-sm">{{ setor.inventario || "—" }}</span>
                    </TableCell>
                    <TableCell class="align-middle py-2">
                      <Badge :variant="setor.facial ? 'default' : 'secondary'">
                        {{ setor.facial ? "Sim" : "Não" }}
                      </Badge>
                    </TableCell>
                    <TableCell class="align-middle py-2 text-muted-foreground">
                      <span v-if="acessosLoading[setor.id]" class="text-sm">
                        Carregando...
                      </span>
                      <span
                        v-else-if="acessosError[setor.id]"
                        class="text-sm text-destructive"
                      >
                        Erro ao carregar
                      </span>
                      <span
                        v-else-if="(acessosBySetorId[setor.id]?.length ?? 0) === 0"
                        class="text-sm"
                      >
                        —
                      </span>
                      <span v-else class="text-sm">
                        {{
                          acessosBySetorId[setor.id]
                            .map((a) => a.nome || `#${a.id}`)
                            .join(", ")
                        }}
                      </span>
                    </TableCell>
                    <TableCell class="align-middle py-2 text-right">
                      <div class="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          @click="openLocais(setor)"
                        >
                          Locais de Acesso
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger as-child>
                            <Button variant="outline" size="sm" class="gap-1">
                              Ações
                              <ChevronDown class="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem @select="openEdit(setor)">
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              class="text-destructive focus:text-destructive"
                              @select="openDeleteConfirm(setor)"
                            >
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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
      v-if="!pending && (setores?.total ?? 0) > 0"
      class="flex flex-wrap items-center justify-between gap-4 border-t pt-6"
    >
      <UiPagination
        v-model:page="page"
        v-model:perPage="perPage"
        :total="setores?.total ?? 0"
        :meta="setores ?? null"
        :per-page-options="[5, 10, 25, 50]"
        :disabled="pending"
      />
    </CardFooter>
  </Card>

  <AlertDialog v-model:open="deleteDialogOpen">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir setor</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir o setor &quot;{{ setorToDelete?.nome_setor }}&quot;?
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

    <EventoSetorCreateDialog
      :open="createDialogOpen"
      :evento-id="eventoId"
      @update:open="createDialogOpen = $event"
      @saved="onSaved"
    />

    <EventoSetorEditDialog
      :open="editDialogOpen"
      :setor="selectedSetor"
      :evento-id="eventoId"
      @update:open="editDialogOpen = $event"
      @saved="onSaved"
    />

    <EventoSetorLocaisDialog
      :open="locaisDialogOpen"
      :setor="selectedSetorForLocais"
      @update:open="onLocaisDialogOpenChange"
    />
</template>

<script setup lang="ts">
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import type { Setor } from "@/types/setor";
import type { LocalAcesso } from "@/types/local-acesso";
import type { PaginatedResponse } from "@/types/common";
import { useEventoSetorService } from "@/services/evento-setor";
import { useEventoSetorAcessoService } from "@/services/evento-setor-acesso";
import EventoSetorCreateDialog from "@/components/evento/EventoSetorCreateDialog.vue";
import EventoSetorEditDialog from "@/components/evento/EventoSetorEditDialog.vue";
import EventoSetorLocaisDialog from "@/components/evento/EventoSetorLocaisDialog.vue";
import UiPagination from "@/components/ui/pagination/UiPagination.vue";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-vue-next";
import { toast } from "vue-sonner";

const props = defineProps<{
  eventoId: number;
}>();

const { list, remove } = useEventoSetorService();
const { list: listAcessos } = useEventoSetorAcessoService();
const page = ref(1);
const perPage = ref(10);
const createDialogOpen = ref(false);
const editDialogOpen = ref(false);
const selectedSetor = ref<Setor | null>(null);
const locaisDialogOpen = ref(false);
const selectedSetorForLocais = ref<Setor | null>(null);
const deleteDialogOpen = ref(false);
const setorToDelete = ref<Setor | null>(null);
const acessosBySetorId = ref<Record<number, LocalAcesso[]>>({});
const acessosLoading = ref<Record<number, boolean>>({});
const acessosError = ref<Record<number, string | null>>({});

function openDeleteConfirm(setor: Setor) {
  setorToDelete.value = setor;
  deleteDialogOpen.value = true;
}

async function confirmDelete() {
  if (!setorToDelete.value) return;
  await handleDelete(setorToDelete.value.id);
  deleteDialogOpen.value = false;
  setorToDelete.value = null;
}

const {
  data: setores,
  pending,
  error,
  refresh,
} = await useAsyncData<PaginatedResponse<Setor>>(
  () => ["evento-setores", props.eventoId, page.value, perPage.value].join(":"),
  () =>
    list(props.eventoId, {
      page: page.value,
      per_page: perPage.value,
    }),
  { watch: [page, perPage, () => props.eventoId] },
);

watch(
  () => setores.value?.data ?? [],
  async (items) => {
    for (const setor of items) {
      const id = setor.id;
      if (
        id == null ||
        acessosBySetorId.value[id] ||
        acessosLoading.value[id]
      ) {
        continue;
      }

      acessosLoading.value[id] = true;
      acessosError.value[id] = null;
      try {
        const resp = await listAcessos(props.eventoId, id, { per_page: 100 });
        acessosBySetorId.value[id] = resp.data;
      } catch (e) {
        const msg =
          e instanceof Error ? e.message : "Erro ao carregar locais de acesso.";
        acessosError.value[id] = msg;
      } finally {
        acessosLoading.value[id] = false;
      }
    }
  },
  { immediate: true },
);

function openCreateDialog() {
  createDialogOpen.value = true;
}

function openEdit(setor: Setor) {
  selectedSetor.value = setor;
  editDialogOpen.value = true;
}

function openLocais(setor: Setor) {
  selectedSetorForLocais.value = setor;
  locaisDialogOpen.value = true;
}

async function onLocaisDialogOpenChange(open: boolean) {
  locaisDialogOpen.value = open;
  if (!open) {
    acessosBySetorId.value = {};
    await refresh();
  }
}

async function handleDelete(id: number) {
  try {
    await remove(props.eventoId, id);
    await refresh();
    toast.success("Setor excluído com sucesso.");
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erro ao excluir setor.";
    toast.error(msg);
  }
}

function onSaved() {
  refresh();
}
</script>
