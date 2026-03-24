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
    <!-- <Button @click="refresh">Adicionar usuário</Button> -->
    <!-- <CreateEmpresa @created="refresh" /> -->
  </div>
  <div>
    <div class="w-full px-8">
      <div
        class="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0"
      >
        <aside class="lg:w-1/5">
          <nav class="flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1">
            <NuxtLink
              v-for="item in sidebarNavItems"
              :key="item.title"
              :to="item.href"
            >
              <Button
                variant="ghost"
                :class="
                  cn(
                    'w-full text-left justify-start',
                    $route.path === `${item.href}` && 'bg-muted hover:bg-muted',
                  )
                "
              >
                {{ item.title }}
              </Button>
            </NuxtLink>
          </nav>
        </aside>
        <div class="flex-1 lg:w-full">
          <div class="space-y-6">
            <slot :user="user" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircle } from "lucide-vue-next";
import { MagnifyingGlassIcon } from "@heroicons/vue/24/solid";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// import moment from "moment" // use só se realmente precisar
import type { User } from "@/types/user";
import type { PaginatedResponse } from "@/types/common";
import { useUserService } from "@/services/user";

// const props = defineProps<{
//   user: User;
// }>();

const route = useRoute();
const user_id = route.params.user_id as string;

definePageMeta({
  title: "Usuários",
  breadcrumb: "Usuários", // simples
});

const sidebarNavItems: { title: string; href: string }[] = [
  {
    title: "Profile",
    href: `/users/${user_id}`,
  },
  {
    title: "Ações",
    href: `/users/${user_id}/acoes`,
  },
];

const { get } = useUserService();

const {
  data: user,
  pending,
  error,
} = await useAsyncData<User>(
  () => ["user", user_id].join(":") as string,
  () => get(user_id),
);
</script>
