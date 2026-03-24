<template>
  <div class="w-full p-4 flex justify-between items-center">
    <div class="w-full p-4 flex justify-between items-center">
      <div>
        <h2 class="font-bold text-3xl text-gray-800 leading-tight">Usuários</h2>
        <p class="text-gray-500">Lista de usuários cadastrados.</p>
      </div>
    </div>
  </div>
  <div class="w-full px-8 pb-4 flex justify-between items-center gap-2">
    <div class="relative min-w-96">
      <div
        class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"
      >
        <MagnifyingGlassIcon class="w-4 h-4 text-gray-500 dark:text-gray-400" />
      </div>

      <Input
        type="text"
        v-model="search"
        class="pl-10"
        placeholder="Pesquisar usuário..."
        required=""
      />
    </div>
    <!-- <Button @click="refresh">Adicionar usuário</Button> -->
    <!-- <CreateEmpresa @created="refresh" /> -->
  </div>
  <div>
    <div class="w-full px-8">
      <div v-if="pending">Carregando...</div>
      <Alert v-else-if="error" variant="destructive">
        <AlertCircle class="w-4 h-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription> Erro ao carregar usuários. </AlertDescription>
      </Alert>
      <div v-else class="w-full border rounded-lg border-gray-200">
        <Table class="w-full table-auto whitespace-normal">
          <TableHeader>
            <TableRow>
              <TableHead>Usuário</TableHead>

              <!-- <TableHead>Eventos</TableHead> -->
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="user in users?.data" :key="user.id">
              <TableCell class="w-full">
                <div class="flex flex-col w-full p-3">
                  <div class="flex justify-between w-full">
                    <div>
                      <p class="text-sm font-bold">
                        {{ user.name }}
                      </p>
                      <p class="text-xs text-gray-500">
                        {{ user.email || "Não informado" }}
                      </p>
                    </div>
                    <!-- Exemplo: botões ou ações à direita -->
                  </div>
                </div>
              </TableCell>
              <!-- <TableCell class="w-full">
                <div class="flex flex-col w-full p-3 gap-2">
                  <Badge
                    v-for="evento in user.eventos"
                    :key="evento.id"
                    variant="outline"
                    >{{ evento.nome }}</Badge
                  >
                </div>
              </TableCell> -->
              <TableCell class="w-full flex justify-end gap-2">
                <NuxtLink :to="`/users/${user.id}`">
                  <Button variant="outline">Configurações</Button>
                </NuxtLink>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
      <UiPagination
        v-model:page="page"
        v-model:perPage="perPage"
        :total="total"
        :disabled="pending"
      />
    </div>
  </div>
</template>
<script setup lang="ts">
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircle } from "lucide-vue-next";
import { MagnifyingGlassIcon } from "@heroicons/vue/24/solid";
import UiPagination from "@/components/ui/pagination/UiPagination.vue";
import { Badge } from "@/components/ui/badge";

// import moment from "moment" // use só se realmente precisar
import type { User } from "@/types/user";
import type { PaginatedResponse } from "@/types/common";
import { useUserService } from "@/services/user";

useHead({ title: "Usuários" });

definePageMeta({
  title: "Usuários",
  breadcrumb: "Usuários", // simples
});

const route = useRoute();
const router = useRouter();
const { list } = useUserService();

// estado
const page = ref<number>(Number(route.query.page || 1));
const perPage = ref<number>(Number(route.query.per_page || 10));
const search = ref<string>((route.query.search as string) || "");

// busca usando o service (SSR-friendly se você usa proxy /api)
const {
  data: users,
  pending,
  error,
  refresh,
} = await useAsyncData<PaginatedResponse<User>>(
  () => ["users", page.value, perPage.value, search.value].join(":"),
  () =>
    list({ page: page.value, per_page: perPage.value, search: search.value }),
  { watch: [page, perPage, search] }
);

// derivados seguros (evita undefined)
const total = computed(() => users.value?.total ?? 0);

// se a busca reduzir o total e a página atual não existir, volta pra 1
watch(users, (res) => {
  if (!res) return;
  if (page.value > (res.last_page ?? 1)) {
    page.value = 1; // dispara nova execução do useAsyncData
  }
});

// sincroniza URL com estado
watch([page, perPage, search], ([p, per, q]) => {
  router.replace({
    query: {
      ...route.query,
      page: p,
      per_page: per,
      search: q || undefined,
    },
  });
});
</script>
