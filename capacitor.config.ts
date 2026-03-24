import { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.seuprojeto.app",
  appName: "MeuApp",
  webDir: "dist", // 👈 aqui deve ser a pasta gerada pelo build
  bundledWebRuntime: false,
};

export default config;
