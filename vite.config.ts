import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { nitro } from "nitro/vite";

export default defineConfig({
  plugins: [tsConfigPaths(), tailwindcss(), tanstackStart(), nitro(), viteReact()],
  resolve: { dedupe: ["react", "react-dom"] },
  // As áreas privadas só correm no browser (ssr: false), por isso o Vite só
  // descobre estas dependências quando se abre uma dashboard. Pré-optimizá-las
  // evita que recarregue a página a meio ("optimized dependencies changed")
  // e fique com duas cópias do React ("Invalid hook call").
  optimizeDeps: {
    include: [
      "@radix-ui/react-alert-dialog",
      "@radix-ui/react-avatar",
      "@radix-ui/react-dialog",
      "@radix-ui/react-separator",
      "@radix-ui/react-slot",
      "@radix-ui/react-tooltip",
      "sonner",
      "zod",
    ],
  },
});
