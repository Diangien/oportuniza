import { useState, type FormEvent } from "react";
import { toast } from "sonner";

import { CampoFoto } from "@/components/formulario/CampoFoto";
import { MensagemErro, propsErro } from "@/components/formulario/MensagemErro";
import { SeletorAreas } from "@/components/formulario/SeletorAreas";
import { Cartao } from "@/components/painel/elementos";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { GRAUS } from "@/lib/catalogo";
import type { Utilizador } from "@/lib/dados/modelos";
import { actualizarUtilizador, alterarSenha, ErroDados } from "@/lib/dados/repositorio";
import { erroDeCampo, esquemaNovaSenha, esquemaPerfil, validar, type ErrosDe } from "@/lib/validacao";

// Perfil do próprio utilizador (qualquer tipo). Cada pessoa só altera os
// seus dados e só vê os campos do seu perfil.
export function FormPerfil({ utilizador }: { utilizador: Utilizador }) {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
      <DadosPessoais key={utilizador.id} utilizador={utilizador} />
      <MudarSenha utilizadorId={utilizador.id} />
    </div>
  );
}

function DadosPessoais({ utilizador }: { utilizador: Utilizador }) {
  const cliente = utilizador.tipo === "cliente" ? utilizador : null;
  const [foto, setFoto] = useState(utilizador.fotoPerfil);
  const [areas, setAreas] = useState(cliente?.areasInteresse ?? []);
  const [erros, setErros] = useState<ErrosDe<typeof esquemaPerfil>>({});

  const aoSubmeter = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const campos = new FormData(e.currentTarget);
    const resultado = validar(esquemaPerfil, {
      nome: campos.get("nome"),
      email: campos.get("email"),
      grauAcademico: (campos.get("grau") as string) || null,
      areasInteresse: areas,
    });
    if (!resultado.ok) return setErros(resultado.erros);
    setErros({});
    try {
      const { nome, email, grauAcademico, areasInteresse } = resultado.dados;
      actualizarUtilizador(utilizador.id, {
        nome,
        email,
        fotoPerfil: foto,
        ...(cliente && { grauAcademico, areasInteresse }),
      });
      toast.success("Perfil actualizado.");
    } catch (erro) {
      if (erro instanceof ErroDados && erro.campo) return setErros(erroDeCampo(erro.campo, erro.message));
      toast.error(erro instanceof Error ? erro.message : "Não foi possível guardar.");
    }
  };

  return (
    <Cartao titulo="Dados pessoais">
      <form onSubmit={aoSubmeter} noValidate className="space-y-5">
        <label className="block text-sm font-medium">
          Nome completo
          <Input name="nome" defaultValue={utilizador.nome} autoComplete="name" className="mt-1.5" {...propsErro("p-nome", erros.nome)} />
          <MensagemErro id="p-nome-erro">{erros.nome}</MensagemErro>
        </label>
        <label className="block text-sm font-medium">
          E-mail
          <Input name="email" type="email" defaultValue={utilizador.email} autoComplete="email" className="mt-1.5" {...propsErro("p-email", erros.email)} />
          <MensagemErro id="p-email-erro">{erros.email}</MensagemErro>
        </label>
        {cliente && (
          <>
            <label className="block text-sm font-medium">
              Grau académico
              <NativeSelect name="grau" defaultValue={cliente.grauAcademico ?? ""} className="mt-1.5">
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
        <CampoFoto valor={foto} onChange={setFoto} />
        <div className="flex justify-end">
          <Button type="submit">Guardar alterações</Button>
        </div>
      </form>
    </Cartao>
  );
}

function MudarSenha({ utilizadorId }: { utilizadorId: string }) {
  const [erros, setErros] = useState<ErrosDe<typeof esquemaNovaSenha>>({});

  const aoSubmeter = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const campos = new FormData(form);
    const resultado = validar(esquemaNovaSenha, {
      senhaActual: campos.get("senhaActual"),
      senha: campos.get("senha"),
      confirmar: campos.get("confirmar"),
    });
    if (!resultado.ok) return setErros(resultado.erros);
    try {
      alterarSenha(utilizadorId, resultado.dados.senhaActual, resultado.dados.senha);
      setErros({});
      form.reset();
      toast.success("Palavra-passe alterada.");
    } catch (erro) {
      if (erro instanceof ErroDados && erro.campo) return setErros(erroDeCampo(erro.campo, erro.message));
      toast.error(erro instanceof Error ? erro.message : "Não foi possível alterar a palavra-passe.");
    }
  };

  const campo = (nome: "senhaActual" | "senha" | "confirmar", rotulo: string, autoComplete: string) => (
    <label className="block text-sm font-medium">
      {rotulo}
      <Input name={nome} type="password" autoComplete={autoComplete} className="mt-1.5" {...propsErro(`s-${nome}`, erros[nome])} />
      <MensagemErro id={`s-${nome}-erro`}>{erros[nome]}</MensagemErro>
    </label>
  );

  return (
    <Cartao titulo="Palavra-passe">
      <form onSubmit={aoSubmeter} noValidate className="space-y-5">
        {campo("senhaActual", "Palavra-passe actual", "current-password")}
        {campo("senha", "Nova palavra-passe", "new-password")}
        {campo("confirmar", "Confirmar nova palavra-passe", "new-password")}
        <Button type="submit" variant="outline" className="w-full">
          Alterar palavra-passe
        </Button>
      </form>
    </Cartao>
  );
}
