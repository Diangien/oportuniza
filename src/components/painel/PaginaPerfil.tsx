import { CabecalhoPagina } from "@/components/painel/elementos";
import { FormPerfil } from "@/components/painel/FormPerfil";
import { useSessao } from "@/hooks/use-dados";

// Página "Perfil", igual nas três áreas (admin, mentor e cliente).
export function PaginaPerfil() {
  const { utilizador } = useSessao();
  if (!utilizador) return null;
  return (
    <div className="space-y-6">
      <CabecalhoPagina titulo="Perfil" descricao="Os seus dados de acesso e de contacto." />
      <FormPerfil utilizador={utilizador} />
    </div>
  );
}
