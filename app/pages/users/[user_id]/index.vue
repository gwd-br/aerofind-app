<template>
  <LayoutUser :user="user">
    <div class="w-full">
      <h1 class="text-2xl font-semibold">Perfil</h1>
      <p class="text-sm text-muted-foreground">Informações do usuário</p>
    </div>

    <form
      class="flex flex-col gap-2 space-y-4 w-full max-w-3xl"
      @submit.prevent="handleSubmit"
    >
      <div class="flex flex-col gap-2">
        <Label for="name">Nome</Label>
        <Input
          id="name"
          v-model.trim="form.name"
          :disabled="submitting || pending"
        />
        <p v-if="errors.name" class="text-red-500 text-sm">{{ errors.name }}</p>
      </div>

      <div class="flex flex-col gap-2">
        <Label for="email">E-mail</Label>
        <Input
          id="email"
          v-model.trim="form.email"
          :disabled="submitting || pending"
        />
        <p v-if="errors.email" class="text-red-500 text-sm">
          {{ errors.email }}
        </p>
      </div>

      <div class="flex items-center gap-2">
        <Button type="submit" :disabled="isDisabled" :aria-busy="submitting">
          <span v-if="submitting">Salvando…</span>
          <span v-else>Salvar alterações</span>
        </Button>
        <Button
          type="button"
          variant="secondary"
          @click="resetForm"
          :disabled="submitting || pending"
        >
          Reverter
        </Button>
      </div>
    </form>
  </LayoutUser>
</template>

<script setup lang="ts">
import LayoutUser from "./layouts/layout-user.vue";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { reactive, computed, watchEffect, ref } from "vue";
import { useRoute, useAsyncData } from "#app"; // Nuxt 3
import type { User } from "@/types/user";
import { useUserService } from "@/services/user";

// Se você tiver um composable de toast, descomente:
// import { useToast } from "@/composables/useToast";
// const toast = useToast();

const route = useRoute();
const id = route.params.user_id as string;

definePageMeta({
  title: "Usuários",
  breadcrumb: "Usuários",
});

// service
const { get, update } = useUserService(); // garanta que update(id, payload) exista no service

// estado do fetch
const {
  data: user,
  pending,
  error,
  refresh,
} = await useAsyncData<User>(
  () => ["user", id].join(":"),
  () => get(id),
  { immediate: true }
);

// formulário reativo
const form = reactive<Pick<User, "name" | "email">>({
  name: "",
  email: "",
});

// erros simples
const errors = reactive<{ name?: string; email?: string }>({});

// flag de submit
const submitting = ref(false);

// popula o form quando o user chegar/atualizar
watchEffect(() => {
  if (user.value) {
    form.name = user.value.name ?? "";
    form.email = user.value.email ?? "";
  }
});

// validação simples
const emailRegex =
  // RFC5322-lite, suficiente para front
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function validate() {
  errors.name = !form.name ? "Informe o nome." : undefined;
  errors.email = !form.email
    ? "Informe o e-mail."
    : !emailRegex.test(form.email)
    ? "E-mail inválido."
    : undefined;

  return !errors.name && !errors.email;
}

// botão desabilitado?
const isDisabled = computed(
  () =>
    submitting.value ||
    pending.value ||
    !!error.value ||
    !user.value || // ainda carregando dados
    (form.name || "").trim().length === 0 ||
    (form.email || "").trim().length === 0
);

// reset para valores originais
function resetForm() {
  if (!user.value) return;
  form.name = user.value.name ?? "";
  form.email = user.value.email ?? "";
  errors.name = undefined;
  errors.email = undefined;
}

// submit
const handleSubmit = async () => {
  if (!validate() || !user.value) return;

  submitting.value = true;

  // otimista: atualiza localmente e tenta salvar
  const snapshot = { ...user.value };
  user.value.name = form.name;
  user.value.email = form.email;

  try {
    await update(user.value.id ?? id, {
      name: form.name,
      email: form.email,
    });

    // toast?.success("Perfil atualizado com sucesso!");
    // fallback
    console.info("Perfil atualizado com sucesso!");
    await refresh(); // garante dados sincronizados
  } catch (e: any) {
    // rollback
    user.value = snapshot as User;
    // toast?.error(e?.message || "Falha ao atualizar perfil.");
    console.error(e?.message || "Falha ao atualizar perfil.");
  } finally {
    submitting.value = false;
  }
};
</script>
