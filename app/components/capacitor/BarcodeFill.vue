<!-- BarcodeFill.vue -->
<script setup lang="ts">
import { ref } from "vue";
import {
  CapacitorBarcodeScanner,
  CapacitorBarcodeScannerTypeHint,
  CapacitorBarcodeScannerCameraDirection,
  CapacitorBarcodeScannerScanOrientation,
  CapacitorBarcodeScannerAndroidScanningLibrary,
  type CapacitorBarcodeScannerOptions,
  type CapacitorBarcodeScannerScanResult,
} from "@capacitor/barcode-scanner";

import { Button } from "@/components/ui/button";
import { Scan } from "lucide-vue-next";
const props = defineProps<{
  /** nome do campo do form do componente pai que deve ser preenchido */
  target: string;
  /** texto do botão (opcional) */
  label?: string;
  /** desabilitar botão (opcional) */
  disabled?: boolean;
}>();

const emit = defineEmits<{
  /** emitido após leitura bem sucedida */
  (
    e: "scanned",
    payload: {
      field: string;
      value: string;
      format: CapacitorBarcodeScannerTypeHint;
    }
  ): void;
  /** emitido em caso de erro/cancelamento */
  (e: "error", payload: { message: string }): void;
}>();

const scanning = ref(false);
const errorMsg = ref<string | null>(null);

const options: CapacitorBarcodeScannerOptions = {
  // dica: ALL (aceitar todos) → omitir 'hint' ou usar:
  hint: CapacitorBarcodeScannerTypeHint.ALL,
  scanInstructions: "Aponte a câmera para o código",
  scanButton: true,
  scanText: "Ler código",
  cameraDirection: CapacitorBarcodeScannerCameraDirection.BACK,
  scanOrientation: CapacitorBarcodeScannerScanOrientation.ADAPTIVE,
  android: {
    scanningLibrary: CapacitorBarcodeScannerAndroidScanningLibrary.ZXING, // ZXING (todos) ou MLKIT
  },
  web: {
    showCameraSelection: true,
    scannerFPS: 30,
  },
};

async function startScan() {
  if (!props.target) {
    emit("error", { message: "Target do campo não informado." });
    return;
  }
  try {
    errorMsg.value = null;
    scanning.value = true;

    const { ScanResult, format }: CapacitorBarcodeScannerScanResult =
      await CapacitorBarcodeScanner.scanBarcode(options);

    if (ScanResult) {
      emit("scanned", { field: props.target, value: ScanResult, format });
    } else {
      // usuário pode ter cancelado
      emit("error", { message: "Leitura cancelada ou sem resultado." });
    }
  } catch (e: any) {
    const msg = e?.message ?? String(e);
    errorMsg.value = msg;
    emit("error", { message: msg });
  } finally {
    scanning.value = false;
  }
}
</script>

<template>
  <div class="barcode-fill">
    <Button
      size="icon"
      variant="outline"
      :disabled="scanning || disabled"
      @click="startScan"
      type="button"
    >
      <Scan />
      <!-- {{ scanning ? "Escaneando..." : label || "Escanear código" }} -->
    </Button>

    <p v-if="errorMsg" class="error">{{ errorMsg }}</p>
  </div>
</template>
