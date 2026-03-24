<script setup lang="ts">
import { ref, computed } from "vue";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandList,
  CommandItem,
  CommandGroup,
  CommandEmpty,
} from "@/components/ui/command";
import { Check, ChevronsUpDown, X } from "lucide-vue-next";

export interface MultiSelectOption {
  value: string;
  label: string;
}

interface Props {
  options: MultiSelectOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  width?: string;
  maxDisplay?: number;
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: "Selecionar...",
  searchPlaceholder: "Buscar...",
  emptyMessage: "Nenhum resultado",
  width: "w-[240px]",
  maxDisplay: 1,
});

const modelValue = defineModel<string[]>({ default: () => [] });

const open = ref(false);

function toggle(value: string) {
  modelValue.value = modelValue.value.includes(value)
    ? modelValue.value.filter((v) => v !== value)
    : [...modelValue.value, value];
}

function remove(value: string) {
  modelValue.value = modelValue.value.filter((v) => v !== value);
}

function clear() {
  modelValue.value = [];
}

const selectedItems = computed(() =>
  props.options.filter((o) => modelValue.value.includes(o.value)),
);

const displayItems = computed(() =>
  selectedItems.value.slice(0, props.maxDisplay),
);

const remainingCount = computed(() =>
  Math.max(0, selectedItems.value.length - props.maxDisplay),
);
</script>

<template>
  <Popover v-model:open="open">
    <PopoverTrigger as-child>
      <Button
        variant="outline"
        role="combobox"
        class="h-9 justify-between gap-1"
        :class="width"
      >
        <div class="flex items-center gap-1 truncate">
          <template v-if="selectedItems.length">
            <Badge
              v-for="item in displayItems"
              :key="item.value"
              variant="secondary"
              class="text-xs truncate max-w-24"
            >
              {{ item.label }}
            </Badge>
            <span
              v-if="remainingCount > 0"
              class="text-xs text-muted-foreground"
            >
              +{{ remainingCount }}
            </span>
          </template>
          <span v-else class="text-muted-foreground">
            {{ placeholder }}
          </span>
        </div>

        <div class="flex items-center gap-1 shrink-0">
          <X
            v-if="selectedItems.length"
            class="w-4 h-4 opacity-60 hover:opacity-100 cursor-pointer"
            @click.stop="clear"
          />
          <ChevronsUpDown class="w-4 h-4 opacity-60" />
        </div>
      </Button>
    </PopoverTrigger>

    <PopoverContent class="p-0" :class="width">
      <Command>
        <CommandInput :placeholder="searchPlaceholder" />
        <CommandList>
          <CommandEmpty>{{ emptyMessage }}</CommandEmpty>

          <CommandGroup>
            <CommandItem
              v-for="opt in options"
              :key="opt.value"
              :value="opt.value"
              @select="toggle(opt.value)"
            >
              {{ opt.label }}
              <Check
                v-if="modelValue.includes(opt.value)"
                class="ml-auto w-4 h-4"
              />
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </PopoverContent>
  </Popover>
</template>
