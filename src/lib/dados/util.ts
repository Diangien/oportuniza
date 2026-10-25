export function copiar<T>(valor: T): T {
  return JSON.parse(JSON.stringify(valor)) as T;
}

// crypto.randomUUID só existe em contextos seguros (HTTPS ou localhost). Ao
// abrir o projecto pelo IP da rede local, usa-se a alternativa abaixo.
export function gerarId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
  const hex = (n: number) =>
    Array.from({ length: n }, () => Math.floor(Math.random() * 16).toString(16)).join("");
  return `${hex(8)}-${hex(4)}-4${hex(3)}-${"89ab"[Math.floor(Math.random() * 4)]}${hex(3)}-${hex(12)}`;
}

export const agora = () => new Date().toISOString();

export const normalizarEmail = (email: string) => email.trim().toLowerCase();

const FORMATO_DATA = new Intl.DateTimeFormat("pt-PT", { day: "2-digit", month: "short", year: "numeric" });

export function formatarData(iso: string) {
  const data = new Date(iso);
  return Number.isNaN(data.getTime()) ? "—" : FORMATO_DATA.format(data);
}

export const formatarKz = (valor: number) => `${valor.toLocaleString("pt-PT")} Kz`;

const MESES: Record<string, number> = {
  jan: 0, fev: 1, mar: 2, abr: 3, mai: 4, jun: 5, jul: 6, ago: 7, set: 8, out: 9, nov: 10, dez: 11,
};

// Os prazos das bolsas vêm como texto ("15 Dez 2026"). Devolve null se não der.
export function prazoParaData(prazo: string): Date | null {
  const [dia, mes, ano] = prazo.trim().split(/\s+/);
  const indiceMes = MESES[(mes ?? "").slice(0, 3).toLowerCase()];
  if (!dia || indiceMes === undefined || !ano) return null;
  const data = new Date(Number(ano), indiceMes, Number(dia));
  return Number.isNaN(data.getTime()) ? null : data;
}

// Reduz a foto a no máximo 256 px e converte-a em JPEG (data URL), para caber
// no localStorage, que tem um limite de poucos MB por site.
export function redimensionarFoto(ficheiro: File, lado = 256): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!ficheiro.type.startsWith("image/")) return reject(new Error("O ficheiro escolhido não é uma imagem."));
    const url = URL.createObjectURL(ficheiro);
    const imagem = new Image();
    imagem.onload = () => {
      const escala = Math.min(1, lado / Math.max(imagem.width, imagem.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(imagem.width * escala);
      canvas.height = Math.round(imagem.height * escala);
      canvas.getContext("2d")?.drawImage(imagem, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.85));
    };
    imagem.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Não foi possível ler a imagem."));
    };
    imagem.src = url;
  });
}
