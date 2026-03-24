<script setup lang="ts">
import { ref } from "vue";
import { z } from "zod";

import { useAuthStore } from "@/stores/auth";
import { useZodForm } from "@/composables/useZodForm";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2 } from "lucide-vue-next";

useHead({ title: "Perfil" });

definePageMeta({
  layout: "default",
  title: "Perfil",
  breadcrumb: "Perfil",
});

const auth = useAuthStore();
const { $api } = useNuxtApp();

// --- Formulário de dados básicos (nome e e-mail)
const profileSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("E-mail inválido"),
});

const {
  form: profileForm,
  errors: profileErrors,
  submitting: profileSubmitting,
  validate: validateProfile,
  applyLaravel422: applyLaravel422Profile,
} = useZodForm(
  profileSchema,
  {
    name: auth.user?.name ?? "",
    email: auth.user?.email ?? "",
  },
);

const profileSuccessMessage = ref("");

async function handleProfileSubmit() {
  profileSuccessMessage.value = "";

  if (!validateProfile()) return;

  try {
    profileSubmitting.value = true;
    await $api("auth/settings", {
      method: "POST",
      body: {
        name: profileForm.name,
        email: profileForm.email,
      },
    });

    // Atualiza os dados do usuário logado
    await auth.fetchUser();

    profileSuccessMessage.value = "Dados atualizados com sucesso.";
  } catch (err: any) {
    applyLaravel422Profile(err);
  } finally {
    profileSubmitting.value = false;
  }
}

// --- Formulário de alteração de senha
const passwordSchema = z
  .object({
    current_password: z.string().min(1, "Senha atual é obrigatória"),
    password: z.string().min(6, "Nova senha deve ter ao menos 6 caracteres"),
    password_confirmation: z.string().min(6, "Confirmação é obrigatória"),
  })
  .refine(
    (data) => data.password === data.password_confirmation,
    {
      message: "As senhas não conferem",
      path: ["password_confirmation"],
    },
  );

const {
  form: passwordForm,
  errors: passwordErrors,
  submitting: passwordSubmitting,
  validate: validatePassword,
  applyLaravel422: applyLaravel422Password,
  reset: resetPasswordForm,
} = useZodForm(passwordSchema, {
  current_password: "",
  password: "",
  password_confirmation: "",
});

const passwordSuccessMessage = ref("");

async function handlePasswordSubmit() {
  passwordSuccessMessage.value = "";

  if (!validatePassword()) return;

  try {
    passwordSubmitting.value = true;
    await $api("auth/change-password", {
      method: "POST",
      body: {
        current_password: passwordForm.current_password,
        password: passwordForm.password,
        password_confirmation: passwordForm.password_confirmation,
      },
    });

    passwordSuccessMessage.value = "Senha alterada com sucesso.";
    resetPasswordForm();
  } catch (err: any) {
    applyLaravel422Password(err);
  } finally {
    passwordSubmitting.value = false;
  }
}
</script>

<template>
  <div class="w-full px-8 py-8 space-y-6">
    <div class="w-full flex flex-col gap-1">
      <h1 class="font-bold text-3xl text-gray-800 leading-tight">
        Perfil
      </h1>
      <p class="text-gray-500">
        Gerencie os dados da sua conta e atualize sua senha de acesso.
      </p>
    </div>

    <div class="max-w-3xl space-y-6">
    <!-- Dados do perfil -->
    <Card class="mt-2">
      <CardHeader>
        <CardTitle>Meu perfil</CardTitle>
        <CardDescription>
          Atualize seu nome e e-mail utilizados na sua conta.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form class="space-y-4" @submit.prevent="handleProfileSubmit">
          <Alert v-if="profileErrors.global" variant="destructive">
            <AlertCircle class="w-4 h-4" />
            <AlertTitle>Erro</AlertTitle>
            <AlertDescription>
              {{ profileErrors.global }}
            </AlertDescription>
          </Alert>

          <Alert v-if="profileSuccessMessage" variant="default">
            <CheckCircle2 class="w-4 h-4 text-emerald-500" />
            <AlertTitle>Sucesso</AlertTitle>
            <AlertDescription>
              {{ profileSuccessMessage }}
            </AlertDescription>
          </Alert>

          <div class="grid gap-3">
            <Label for="name">Nome</Label>
            <Input
              id="name"
              v-model="profileForm.name"
              type="text"
              autocomplete="name"
              :disabled="profileSubmitting"
            />
            <p v-if="profileErrors.name" class="text-xs text-destructive">
              {{ profileErrors.name }}
            </p>
          </div>

          <div class="grid gap-3">
            <Label for="email">E-mail</Label>
            <Input
              id="email"
              v-model="profileForm.email"
              type="email"
              autocomplete="email"
              :disabled="profileSubmitting"
            />
            <p v-if="profileErrors.email" class="text-xs text-destructive">
              {{ profileErrors.email }}
            </p>
          </div>

          <Button type="submit" :disabled="profileSubmitting">
            {{ profileSubmitting ? "Salvando..." : "Salvar alterações" }}
          </Button>
        </form>
      </CardContent>
    </Card>

    <!-- Alteração de senha -->
    <Card>
      <CardHeader>
        <CardTitle>Alterar senha</CardTitle>
        <CardDescription>
          Defina uma nova senha segura para acessar sua conta.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form class="space-y-4" @submit.prevent="handlePasswordSubmit">
          <Alert v-if="passwordErrors.global" variant="destructive">
            <AlertCircle class="w-4 h-4" />
            <AlertTitle>Erro</AlertTitle>
            <AlertDescription>
              {{ passwordErrors.global }}
            </AlertDescription>
          </Alert>

          <Alert v-if="passwordSuccessMessage" variant="default">
            <CheckCircle2 class="w-4 h-4 text-emerald-500" />
            <AlertTitle>Sucesso</AlertTitle>
            <AlertDescription>
              {{ passwordSuccessMessage }}
            </AlertDescription>
          </Alert>

          <div class="grid gap-3">
            <Label for="current_password">Senha atual</Label>
            <Input
              id="current_password"
              v-model="passwordForm.current_password"
              type="password"
              autocomplete="current-password"
              :disabled="passwordSubmitting"
            />
            <p
              v-if="passwordErrors.current_password"
              class="text-xs text-destructive"
            >
              {{ passwordErrors.current_password }}
            </p>
          </div>

          <div class="grid gap-3">
            <Label for="password">Nova senha</Label>
            <Input
              id="password"
              v-model="passwordForm.password"
              type="password"
              autocomplete="new-password"
              :disabled="passwordSubmitting"
            />
            <p v-if="passwordErrors.password" class="text-xs text-destructive">
              {{ passwordErrors.password }}
            </p>
          </div>

          <div class="grid gap-3">
            <Label for="password_confirmed">Confirmar nova senha</Label>
            <Input
              id="password_confirmed"
              v-model="passwordForm.password_confirmation"
              type="password"
              autocomplete="new-password"
              :disabled="passwordSubmitting"
            />
            <p
              v-if="passwordErrors.password_confirmation"
              class="text-xs text-destructive"
            >
              {{ passwordErrors.password_confirmation }}
            </p>
          </div>

          <Button
            type="submit"
            variant="outline"
            :disabled="passwordSubmitting"
          >
            {{ passwordSubmitting ? "Alterando..." : "Alterar senha" }}
          </Button>
        </form>
      </CardContent>
    </Card>
    </div>
  </div>
</template>