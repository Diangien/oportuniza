import { escrever, guardarCopiaCorrompida, ler } from "./armazenamento";
import {
  ADMIN_PADRAO_EMAIL,
  adminPadrao,
  sementeBolsas,
  sementeMentorias,
  sementePagamentos,
  sementeUtilizadores,
} from "./semente";

// Cria os dados de demonstração só quando faltam. Pode correr em cada
// arranque: nunca apaga nem duplica registos que já existam.
export function garantirDados() {
  const utilizadores = ler("utilizadores");
  // Mentorias e pagamentos de exemplo apontam para os utilizadores de exemplo,
  // por isso só fazem sentido se os utilizadores também forem criados agora.
  const novosUtilizadores = utilizadores.estado !== "ok";

  if (utilizadores.estado === "invalido") guardarCopiaCorrompida("utilizadores", utilizadores.bruto);
  if (novosUtilizadores) escrever("utilizadores", sementeUtilizadores());

  const bolsas = ler("bolsas");
  if (bolsas.estado === "invalido") guardarCopiaCorrompida("bolsas", bolsas.bruto);
  if (bolsas.estado !== "ok") escrever("bolsas", sementeBolsas());

  const mentorias = ler("mentorias");
  if (mentorias.estado === "invalido") guardarCopiaCorrompida("mentorias", mentorias.bruto);
  if (mentorias.estado !== "ok") escrever("mentorias", novosUtilizadores ? sementeMentorias() : []);

  const pagamentos = ler("pagamentos");
  if (pagamentos.estado === "invalido") guardarCopiaCorrompida("pagamentos", pagamentos.bruto);
  if (pagamentos.estado !== "ok") escrever("pagamentos", novosUtilizadores ? sementePagamentos() : []);

  // O administrador padrão tem de existir sempre, mas só uma vez.
  if (utilizadores.estado === "ok") {
    const existeAdmin = utilizadores.valor.some((u) => u.email.toLowerCase() === ADMIN_PADRAO_EMAIL);
    if (!existeAdmin) escrever("utilizadores", [...utilizadores.valor, adminPadrao]);
  }

  // Uma sessão ilegível é descartada (o utilizador só tem de voltar a entrar).
  if (ler("sessao").estado === "invalido") escrever("sessao", null);
}

// Só é chamada pelo botão "Repor dados" do administrador, depois de confirmar.
export function escreverDadosDemonstracao() {
  escrever("utilizadores", sementeUtilizadores());
  escrever("bolsas", sementeBolsas());
  escrever("mentorias", sementeMentorias());
  escrever("pagamentos", sementePagamentos());
}
