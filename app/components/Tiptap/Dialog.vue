<template>
  <Dialog v-model:open="isOpen">
    <DialogContent :class="[maxWidth ?? 'max-w-md']">
      <DialogHeader>
        <DialogTitle>{{ title }}</DialogTitle>
      </DialogHeader>
      <div class="space-y-6">
        <slot />
      </div>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { computed } from "vue";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const props = defineProps<{
  show: boolean;
  title: string;
  maxWidth?: string;
}>();

const emit = defineEmits<{
  (e: "close"): void;
}>();

const isOpen = computed({
  get: () => props.show,
  set: (value: boolean) => {
    if (!value) {
      emit("close");
    }
  },
});
</script>
