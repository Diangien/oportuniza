import { createFileRoute } from "@tanstack/react-router";

import { PaginaPerfil } from "@/components/painel/PaginaPerfil";

export const Route = createFileRoute("/mentor/perfil")({ component: PaginaPerfil });
