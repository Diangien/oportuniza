import { useState, type FormEvent } from "react";
import { toast } from "sonner";

import { CampoFoto } from "@/components/formulario/CampoFoto";
import { MensagemErro, propsErro } from "@/components/formulario/MensagemErro";
import { SeletorAreas } from "@/components/formulario/SeletorAreas";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { GRAUS, NOME_TIPO } from "@/lib/catalogo";
import { TIPOS_UTILIZADOR, type TipoUtilizador, type Utilizador } from "@/lib/dados/modelos";
import { actualizarUtilizador, criarUtilizador, ErroDados } from "@/lib/dados/repositorio";
import { erroDeCampo, esquemaUtilizador, validar, type ErrosDe } from "@/lib/validacao";

// Criar (sem `utilizador`) ou editar (com `utilizador`) qualquer conta. Usado
// só na área do administrador: é aqui que nascem mentores e administradores.
export function DialogUtilizador({
  aberto,
  onAbertoChange,
  utilizador,
}: {
  aberto: boolean;
  onAbertoChange: (aberto: boolean) => void;
  utilizador?: Utilizador | undefined;
}) {
  return (
    <Dialog open={aberto} onOpenChange={onAbertoChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-2xl sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">
            {utilizador ? "Editar utilizador" : "Novo utilizador"}
          </DialogTitle>
          <DialogDescription>
            {utilizador
              ? "Altere os dados e guarde. As bolsas, mentorias e clientes associados mantêm-se."
              : "Crie uma conta de cliente, mentor ou administrador."}
          </DialogDescription>
        </DialogHeader>
        {/* key: ao trocar de utilizador, o formulário recomeça com os dados certos. */}
        <FormUtilizador key={utilizador?.id ?? "novo"} utilizador={utilizador} onConcluido={() => onAbertoChange(false)} />
      </DialogContent>
    </Dialog>
  );
}

function FormUtilizador({ utilizador, onConcluido }: { utilizador?: Utilizador | undefined; onConcluido: () => void }) {
  const aEditar = Boolean(utilizador);
  const [tipo, setTipo] = useState<TipoUtilizador>(utilizador?.tipo ?? "cliente");
  const [foto, setFoto] = useState<string | null>(utilizador?.fotoPerfil ?? null);
  const [areas, setAreas] = useState<string[]>(utilizador?.tipo === "cliente" ? utilizador.areasInteresse : []);
  const [ativo, setAtivo] = useState(utilizador?.tipo === "mentor" ? utilizador.ativo : true);
  const [erros, setErros] = useState<ErrosDe<ReturnType<typeof esquemaUtilizador>>>({});

  const aoSubmeter = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const campos = new FormData(e.currentTarget);
    const resultado = validar(esquemaUtilizador(aEditar ? "editar" : "criar"), {
      tipo,
      nome: campos.get("nome"),
      email: campos.get("email"),
      senha: campos.get("senha") ?? "",
      grauAcademico: (campos.get("grau") as string) || null,
      areasInteresse: areas,
      ativo,
    });
    if (!resultado.ok) return setErros(resultado.erros);
    const d = resultado.dados;

    try {
      if (utilizador) {
        actualizarUtilizador(utilizador.id, {
          nome: d.nome,
          email: d.email,
          senha: d.senha || undefined,
          fotoPerfil: foto,
          areasInteresse: d.areasInteresse,
          grauAcademico: d.grauAcademico,
          ativo: d.ativo,
        });
        toast.success("Utilizador actualizado.");
      } else {
        const comum = { nome: d.nome, email: d.email, senha: d.senha, fotoPerfil: foto };
        if (d.tipo === "cliente")
          criarUtilizador({ ...comum, tipo: "cliente", grauAcademico: d.grauAcademico, areasInteresse: d.areasInteresse });
        else if (d.tipo === "mentor") criarUtilizador({ ...comum, tipo: "mentor", ativo: d.ativo });
        else criarUtilizador({ ...comum, tipo: "admin" });
        toast.success(`${NOME_TIPO[d.tipo]} criado. Já pode iniciar sessão com ${d.email}.`);
      }
      onConcluido();
    } catch (erro) {
      if (erro instanceof ErroDados && erro.campo) return setErros(erroDeCampo(erro.campo, erro.message));
      toast.error(erro instanceof Error ? erro.message : "Não foi possível guardar.");
    }
  };

  const etiqueta = "block text-sm font-medium";

  return (
    <form onSubmit={aoSubmeter} noValidate className="space-y-5">
      {aEditar ? (
        <p className="text-sm text-muted-foreground">
          Tipo de conta: <strong className="font-medium text-foreground">{NOME_TIPO[tipo]}</strong>
        </p>
      ) : (
        <label className={etiqueta}>
          Tipo de conta
          <NativeSelect className="mt-1.5" value={tipo} onChange={(e) => setTipo(e.target.value as TipoUtilizador)}>
            {TIPOS_UTILIZADOR.map((t) => (
              <option key={t} value={t}>
                {NOME_TIPO[t]}
              </option>
            ))}
          </NativeSelect>
        </label>
      )}

      <label className={etiqueta}>
        Nome completo
        <Input name="nome" defaultValue={utilizador?.nome} autoComplete="off" className="mt-1.5" {...propsErro("u-nome", erros.nome)} />
        <MensagemErro id="u-nome-erro">{erros.nome}</MensagemErro>
      </label>

      <label className={etiqueta}>
        E-mail
        <Input name="email" type="email" defaultValue={utilizador?.email} autoComplete="off" className="mt-1.5" {...propsErro("u-email", erros.email)} />
        <MensagemErro id="u-email-erro">{erros.email}</MensagemErro>
      </label>

      <label className={etiqueta}>
        {aEditar ? "Nova palavra-passe" : "Palavra-passe"}
        <Input
          name="senha"
          type="password"
          autoComplete="new-password"
          placeholder={aEditar ? "deixe vazio para manter a actual" : "mínimo 4 caracteres"}
          className="mt-1.5"
          {...propsErro("u-senha", erros.senha)}
        />
        <MensagemErro id="u-senha-erro">{erros.senha}</MensagemErro>
      </label>

      {tipo === "cliente" && (
        <>
          <label className={etiqueta}>
            Grau académico
            <NativeSelect
              name="grau"
              className="mt-1.5"
              defaultValue={utilizador?.tipo === "cliente" ? (utilizador.grauAcademico ?? "") : ""}
            >
              <option value="">Sem indicação</option>
              {GRAUS.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </NativeSelect>
          </label>
          <SeletorAreas valor={areas} onChange={setAreas} />
        </>
      )}

      {tipo === "mentor" && (
        <label className="flex items-start gap-3 rounded-xl border border-border p-4 text-sm">
          <input type="checkbox" checked={ativo} onChange={(e) => setAtivo(e.target.checked)} className="mt-0.5 h-4 w-4 accent-primary" />
          <span>
            <span className="font-medium">Mentor activo</span>
            <span className="block text-muted-foreground">Só mentores activos recebem novas mentorias automaticamente.</span>
          </span>
        </label>
      )}

      <CampoFoto valor={foto} onChange={setFoto} />

      <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" onClick={onConcluido}>
          Cancelar
        </Button>
        <Button type="submit">{aEditar ? "Guardar alterações" : "Criar utilizador"}</Button>
      </div>
    </form>
  );
}
