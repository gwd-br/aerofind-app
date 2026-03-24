<template>
  <LayoutUser>
    <div>
      <h1>Eventos</h1>
      {{ props.user }}
    </div>
  </LayoutUser>
</template>
<script setup lang="ts">
import LayoutUser from "./layouts/layout-user.vue";

import type { User } from "@/types/user";

const props = defineProps<{
  user: User;
}>();

definePageMeta({
  title: "Ações do Usuário",
  breadcrumb: [
    { label: "Usuários" },
    // { label: props.user.name },
    { label: "Ações do Usuário" },
  ],
});

const route = useRoute();
const user_id = route.params.user_id as string;
</script>
