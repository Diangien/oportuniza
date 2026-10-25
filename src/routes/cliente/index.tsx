import { createFileRoute, Link } from "@tanstack/react-router";
import { Bookmark, CalendarClock, GraduationCap, Heart } from "lucide-react";
import { useMemo } from "react";

import { CabecalhoPagina, Cartao, EtiquetaMentoria, Indicador } from "@/components/painel/elementos";
import { Button } from "@/components/ui/button";
import { useCliente } from "@/hooks/use-dados";
import { ESTADOS_MENTORIA } from "@/lib/catalogo";
import { mentoriasDoCliente, obterBolsa, obterPlano, obterUtilizador } from "@/lib/dados/repositorio";
import { prazoParaData } from "@/lib/dados/util";

export const Route = createFileRoute("/cliente/")({ component: VisaoGeralCliente });

function VisaoGeralCliente() {
  const { cliente, dados } = useCliente();

  const resumo = useMemo(() => {
    if (!cliente) return null;
    const mentorias = mentoriasDoCliente(cliente.id, dados).sort((a, b) =>
      b.dataActualizacao.localeCompare(a.dataActualizacao),
    );
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    // Próximo prazo entre as bolsas que o cliente está a acompanhar.
    const proxima = cliente.bolsasAssociadas
      .map((id) => obterBolsa(id, dados))
      .flatMap((b) => {
        const data = b && prazoParaData(b.prazo);
        return b && data && data >= hoje ? [{ bolsa: b, data }] : [];
      })
      .sort((a, b) => a.data.getTime() - b.data.getTime())[0];
    return {
      mentorias,
      activas: mentorias.filter((m) => m.estado !== "concluida").length,
      proxima,
    };
  }, [cliente, dados]);

  if (!cliente || !resumo) return null;
  const ultima = resumo.mentorias[0];

  return (
    <div className="space-y-8">
      <CabecalhoPagina
        titulo={`Olá, ${cliente.nome.split(" ")[0]}`}
        descricao="Acompanhe as suas bolsas e mentorias num só lugar."
        accao={
          <Button asChild>
            <Link to="/bolsas">Explorar bolsas</Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Indicador rotulo="Bolsas favoritas" valor={cliente.bolsasFavoritas.length} icone={Heart} />
        <Indicador rotulo="Bolsas associadas" valor={cliente.bolsasAssociadas.length} icone={Bookmark} />
        <Indicador rotulo="Mentorias activas" valor={resumo.activas} icone={GraduationCap} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Cartao titulo="Próximo prazo">
          {resumo.proxima ? (
            <div className="flex items-start gap-3">
              <CalendarClock aria-hidden className="mt-1 h-5 w-5 shrink-0 text-primary" />
              <div>
                <p className="font-display text-2xl font-semibold text-primary">{resumo.proxima.bolsa.prazo}</p>
                <Link
                  to="/bolsas/$id"
                  params={{ id: resumo.proxima.bolsa.id }}
                  className="mt-1 block font-medium hover:text-primary"
                >
                  {resumo.proxima.bolsa.titulo}
                </Link>
                <p className="text-sm text-muted-foreground">{resumo.proxima.bolsa.entidade}</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Associe bolsas para acompanhar os prazos.{" "}
              <Link to="/cliente/favoritas" className="text-primary hover:underline">
                Ver favoritas
              </Link>
            </p>
          )}
        </Cartao>

        <Cartao titulo="Última mentoria">
          {ultima ? (
            <div className="space-y-2 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium">{obterPlano(ultima.planoId)?.titulo}</p>
                <EtiquetaMentoria estado={ultima.estado} />
              </div>
              <p className="text-muted-foreground">{ESTADOS_MENTORIA[ultima.estado].descricao}</p>
              {ultima.mentorId && (
                <p>
                  Mentor: <strong className="font-medium">{obterUtilizador(ultima.mentorId, dados)?.nome}</strong>
                </p>
              )}
              <Button asChild variant="outline" size="sm" className="mt-2">
                <Link to="/cliente/mentorias">Ver mentorias</Link>
              </Button>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              <p>Ainda não pediu nenhuma mentoria.</p>
              <Button asChild size="sm" className="mt-4">
                <Link to="/cliente/mentorias" search={{ nova: true }}>
                  Solicitar mentoria
                </Link>
              </Button>
            </div>
          )}
        </Cartao>
      </div>
    </div>
  );
}
