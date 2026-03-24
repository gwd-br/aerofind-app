<template>
  <div class="min-h-screen grid place-items-center p-4">
    <Card class="w-full max-w-md">
      <CardHeader>
        <CardTitle class="text-2xl">Redefinir senha</CardTitle>
        <CardDescription>
          Defina uma nova senha para acessar sua conta.
        </CardDescription>
      </CardHeader>

      <CardContent class="grid gap-4">
        <Alert v-if="errorMsg" variant="destructive">
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>{{ errorMsg }}</AlertDescription>
        </Alert>

        <Alert v-if="success" class="border-green-600/40">
          <AlertTitle>Senha redefinida</AlertTitle>
          <AlertDescription>{{ success }}</AlertDescription>
        </Alert>

        <div class="grid gap-2">
          <Label for="password">Nova senha</Label>
          <Input
            id="password"
            type="password"
            v-model="form.password"
            autocomplete="new-password"
            :disabled="loading"
            required
          />
          <p v-if="formErrors.password" class="text-xs text-destructive">
            {{ formErrors.password }}
          </p>
        </div>

        <div class="grid gap-2">
          <Label for="password_confirmation">Confirmar nova senha</Label>
          <Input
            id="password_confirmation"
            type="password"
            v-model="form.password_confirmation"
            autocomplete="new-password"
            :disabled="loading"
            required
          />
          <p
            v-if="formErrors.password_confirmation"
            class="text-xs text-destructive"
          >
            {{ formErrors.password_confirmation }}
          </p>
        </div>
      </CardContent>

      <CardFooter class="flex flex-col gap-2">
        <Button class="w-full" :disabled="loading" @click="submit">
          {{ loading ? "Redefinindo..." : "Redefinir senha" }}
        </Button>
        <Button
          variant="outline"
          class="w-full"
          :disabled="loading"
          @click="goToLogin"
        >
          Voltar ao login
        </Button>
      </CardFooter>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { z } from "zod";
import { useRoute } from "vue-router";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useZodForm } from "@/composables/useZodForm";
import { useAuthStore } from "@/stores/auth";

definePageMeta({ title: "Redefinir senha", layout: "auth" });

const route = useRoute();
const auth = useAuthStore();

// Token e email vindos pela URL (?token=...&email=...)
const token = computed(() => String(route.query.token || ""));
const email = computed(() => String(route.query.email || ""));

const schema = z
  .object({
    password: z.string().min(6, "Senha deve ter ao menos 6 caracteres"),
    password_confirmation: z
      .string()
      .min(6, "Confirmação de senha é obrigatória"),
  })
  .refine((data) => data.password === data.password_confirmation, {
    path: ["password_confirmation"],
    message: "As senhas não conferem",
  });

const {
  form,
  errors: formErrors,
  submitting: loading,
  validate,
  applyLaravel422,
} = useZodForm(schema, {
  password: "",
  password_confirmation: "",
});

const success = ref("");
const errorMsg = ref("");

const submit = async () => {
  success.value = "";
  errorMsg.value = "";

  if (!token.value || !email.value) {
    errorMsg.value = "Link de redefinição inválido ou expirado.";
    return;
  }

  if (!validate()) return;

  try {
    loading.value = true;
    await auth.resetPassword({
      token: token.value,
      email: email.value,
      password: form.password,
      password_confirmation: form.password_confirmation,
    });

    success.value = "Senha redefinida com sucesso. Você já pode entrar.";
  } catch (err: any) {
    applyLaravel422(err);
    if (!formErrors.value?.global) {
      errorMsg.value =
        err?.response?._data?.message ||
        "Não foi possível redefinir a senha. Tente novamente.";
    } else {
      errorMsg.value = formErrors.value.global;
    }
  } finally {
    loading.value = false;
  }
};

const goToLogin = () => {
  navigateTo("/login");
};
</script>
