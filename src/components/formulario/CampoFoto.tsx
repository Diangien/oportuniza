import { Camera, Trash2 } from "lucide-react";
import { useState } from "react";

import { redimensionarFoto } from "@/lib/dados/util";

// Foto de perfil opcional. Devolve a imagem já reduzida (data URL), pronta a
// guardar, ou null quando é removida.
export function CampoFoto({ valor, onChange }: { valor: string | null; onChange: (foto: string | null) => void }) {
  const [nome, setNome] = useState("");
  const [erro, setErro] = useState("");
  const [aCarregar, setACarregar] = useState(false);

  const escolhe = async (ficheiro?: File) => {
    if (!ficheiro) return;
    setErro("");
    if (ficheiro.size > 2 * 1024 * 1024) return setErro("A imagem tem mais de 2 MB.");
    setACarregar(true);
    try {
      onChange(await redimensionarFoto(ficheiro));
      setNome(ficheiro.name);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível usar esta imagem.");
    } finally {
      setACarregar(false);
    }
  };

  const limpa = () => {
    onChange(null);
    setNome("");
  };

  return (
    <div>
      <span className="mb-1.5 flex items-baseline justify-between gap-3 text-sm font-medium">
        Foto de perfil <span className="text-xs font-normal text-muted-foreground">opcional</span>
      </span>
      <div className="mt-1 flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-muted/40 p-4">
        <label className="group relative h-20 w-20 shrink-0 cursor-pointer overflow-hidden rounded-full border-2 border-dashed border-border bg-card transition-colors hover:border-primary focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
          <input
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(e) => {
              void escolhe(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
          {valor ? (
            <img src={valor} alt="Pré-visualização da foto de perfil" className="h-full w-full object-cover" />
          ) : (
            <span className="grid h-full w-full place-items-center text-muted-foreground transition-colors group-hover:text-primary">
              <Camera className="h-5 w-5" />
            </span>
          )}
          <span className="sr-only">{valor ? "Trocar foto de perfil" : "Escolher foto de perfil"}</span>
        </label>
        <div className="min-w-0 text-sm" aria-live="polite">
          <p className="text-muted-foreground">
            {aCarregar ? (
              "A preparar a imagem…"
            ) : nome ? (
              <span className="truncate text-foreground">{nome}</span>
            ) : valor ? (
              "Foto actual."
            ) : (
              "Clique no círculo para carregar uma imagem."
            )}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">JPG ou PNG, até 2 MB.</p>
          {erro && <p className="mt-1 text-xs text-destructive">{erro}</p>}
          {valor && (
            <button
              type="button"
              onClick={limpa}
              className="mt-2 inline-flex items-center gap-1.5 text-xs text-muted-foreground underline-offset-4 hover:text-destructive hover:underline"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Remover foto
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
