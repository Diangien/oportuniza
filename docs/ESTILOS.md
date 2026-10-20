# Guia de estilos — BolsaAngola

Referência para criar páginas novas com o mesmo aspecto das existentes.

O projecto usa **Tailwind CSS 4**. O tema está definido em [`src/styles.css`](../src/styles.css):

- as cores ficam em `:root`;
- os nomes das classes (`bg-primary`, `shadow-card`…) são registados em `@theme inline`.

O estilo é quente e editorial: fundo creme, vermelho como cor principal, títulos com serifa e botões em forma de pílula.

**Regra principal:** use sempre os nomes do tema (`bg-primary`, `text-muted-foreground`…) e os componentes `Button` e `Input`. Nunca escreva códigos de cor directamente nem copie classes de botões e campos à mão.

## 1. Cores

Os códigos hex são aproximados e servem só como referência. No código, use o nome.

| Nome | Cor | Para que serve |
| --- | --- | --- |
| `background` | creme `#fcf8f0` | fundo da página |
| `foreground` | castanho-escuro `#1e130f` | texto normal |
| `card` | branco | cartões, formulários, campos |
| `primary` | vermelho `#be2323` | botões principais, links, destaques, preços, anel de foco |
| `primary-foreground` | creme | texto sobre o vermelho |
| `secondary` | bege `#f1e7d2` | etiqueta "Externa" |
| `accent` | amarelo-dourado `#fcd176` | etiqueta "Interna", decoração |
| `muted` | creme mais escuro `#f4eee1` | secções alternadas, painéis laterais, hover de botões com contorno |
| `muted-foreground` | castanho-acinzentado `#6e605b` | texto secundário, descrições |
| `border` / `input` | bege `#e2dacc` | contornos de cartões e campos |
| `destructive` | vermelho vivo | acções de apagar |
| `ring` | igual a `primary` | contorno de foco (navegação por teclado) |

Também pode usar transparência: `bg-primary/5`, `bg-accent/25`, `hover:border-primary/40`, `bg-muted/40`.

Para adicionar uma cor nova:

1. Defina a variável em `:root`, em formato `oklch`.
2. Registe-a em `@theme inline` como `--color-<nome>: var(--<nome>)`.

> **Tema escuro:** existe um bloco `.dark` com as cores originais do shadcn (azuladas). Nada no site o liga, por isso, na prática, o site só tem tema claro.

## 2. Tipografia

As fontes vêm do Google Fonts, carregadas em [`src/routes/__root.tsx`](../src/routes/__root.tsx).

- **`font-display`** (Fraunces, com serifa) serve para títulos, números grandes e preços. O itálico `<em>` dentro de um título fica bem em `text-primary`.
- **`font-sans`** (Manrope) é a fonte por defeito do texto.
- Só estão carregados os pesos 400, 500 e 600. Use **`font-semibold` no máximo**: não use `font-bold`.

| Elemento | Classes |
| --- | --- |
| Título da página (h1) | `font-display text-4xl font-semibold` |
| Título grande da página inicial | `font-display text-4xl md:text-5xl lg:text-6xl font-semibold leading-tight` |
| Título de secção (h2) | `font-display text-3xl font-semibold` |
| Título de cartão (h3) | `font-display text-xl font-semibold` |
| Pequeno título por cima de outro título | `text-sm font-medium uppercase tracking-widest text-primary` |
| Subtítulo | `mt-2 text-muted-foreground` (`text-lg` na página inicial) |
| Texto de cartão | `text-sm` |
| Nota pequena | `text-xs text-muted-foreground` |
| Link no meio do texto | `text-primary hover:underline` |

## 3. Cantos arredondados e sombra

A base é `--radius: 0.75rem` (12px).

| Classe | Onde |
| --- | --- |
| `rounded-full` | botões, etiquetas, filtros, caixa de pesquisa |
| `rounded-xl` | campos de formulário |
| `rounded-2xl` | cartões, caixas de formulário |
| `rounded-3xl` | painéis grandes (registo) |

A sombra do projecto é **`shadow-card`**, ligeiramente avermelhada. Use-a em painéis em destaque, ou com `hover:shadow-card transition-shadow` em cartões clicáveis.

## 4. Estrutura das páginas

```tsx
import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";

export const Route = createFileRoute("/exemplo")({
  head: () => ({
    meta: [
      { title: "Título — BolsaAngola" },
      { name: "description", content: "…" },
    ],
  }),
  component: Exemplo,
});

function Exemplo() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-5 py-12">
        <h1 className="font-display text-4xl font-semibold">Título</h1>
        <p className="mt-2 text-muted-foreground">Subtítulo</p>
        <div className="mt-8 grid gap-5 md:grid-cols-3">…</div>
      </main>
    </div>
  );
}
```

- **Largura do conteúdo:**
  - `max-w-6xl` nas páginas normais;
  - `max-w-md` em formulários simples (login);
  - `max-w-5xl` em formulários com painel lateral (registo).
- **Margens:** `px-5` nos lados, `py-12` nas páginas e `py-16` nas secções.
- **Secção com fundo diferente:** `border-y border-border bg-muted py-16`, com um `div` `mx-auto max-w-6xl px-5` dentro.
- **Grelhas:** `grid gap-5 md:grid-cols-3`. Em ecrãs pequenos ficam numa só coluna, e as colunas só aparecem a partir de `md:`.
- **Distância entre blocos:** `mt-2` depois do título, `mt-6` a `mt-8` antes da grelha, e `space-y-5`/`space-y-6` dentro de formulários.

## 5. Componentes

### Botão — `Button`

[`src/components/ui/button.tsx`](../src/components/ui/button.tsx) já tem o estilo do projecto: pílula, hover e anel de foco.

```tsx
import { Button } from "@/components/ui/button";

<Button>Reservar</Button>                         // principal (vermelho)
<Button variant="outline">Pedir mentoria</Button> // só com contorno
<Button size="lg">Ver bolsas</Button>             // grande (página inicial, envio de formulário)
<Button type="submit" size="lg" className="w-full">Criar conta</Button>

// Link com aspecto de botão
<Button asChild variant="outline">
  <Link to="/registo">Criar conta</Link>
</Button>
```

| Opção | Valores |
| --- | --- |
| Variantes (`variant`) | `default`, `outline`, `secondary`, `ghost`, `destructive`, `link` |
| Tamanhos (`size`) | `default` (`px-4 py-2`), `sm`, `lg` (`px-6 py-3 text-base`), `icon` |

### Campo — `Input`

[`src/components/ui/input.tsx`](../src/components/ui/input.tsx) usa `rounded-xl`, fundo `card` e, com foco, contorno vermelho e um anel suave (`focus:ring-4 focus:ring-primary/10`).

```tsx
import { Input } from "@/components/ui/input";

<label className="block text-sm font-medium">
  E-mail
  <Input type="email" required placeholder="nome@exemplo.ao" className="mt-1.5" />
</label>
```

- **Caixa de pesquisa:** `<Input className="rounded-full py-2 md:w-64" />`.
- **Campo com ícone à direita** (ex.: mostrar palavra-passe): `className="pr-11"`, com o botão do ícone em `absolute inset-y-0 right-0 grid w-11 place-items-center`.
- **`<select>` nativo:** use as mesmas classes do `Input` mais `appearance-none pr-11`, e um `ChevronDown` em posição absoluta. Veja a constante `campo` em [`registo.tsx`](../src/routes/registo.tsx).

### Cartão

O melhor modelo é o [`BolsaCard.tsx`](../src/components/BolsaCard.tsx).

```tsx
<article className="flex flex-col rounded-2xl border border-border bg-card p-6 transition-shadow hover:shadow-card">
  <h3 className="font-display text-xl font-semibold">Título</h3>
  <p className="text-sm text-muted-foreground">Subtítulo</p>
  <p className="mt-3 flex-1 text-sm">Descrição…</p>
  <div className="mt-5 flex gap-2">
    <Button>Acção</Button>
  </div>
</article>
```

O texto principal leva `flex-1`, para que os botões fiquem alinhados em baixo em todos os cartões da grelha.

### Etiqueta

```tsx
<span className="rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">Interna</span>
<span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">Externa</span>
```

### Botões de filtro (activo ou não)

São usados nos filtros de bolsas e nas áreas de interesse do registo. Use sempre `aria-pressed`.

```tsx
<button
  aria-pressed={activo}
  className={`rounded-full border px-4 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
    activo
      ? "border-primary bg-primary text-primary-foreground"
      : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
  }`}
>
```

### Ícones

Use o `lucide-react`, com tamanho `h-4 w-4` em botões e campos e `h-3.5 w-3.5` dentro de botões de filtro. Dentro de um `Button`, o tamanho já é aplicado automaticamente.

### Decoração

O painel lateral do registo usa círculos desfocados em posição absoluta: `bg-primary/5` e `bg-accent/25`, com `aria-hidden`. Listas numeradas usam `font-display text-primary` com números de dois dígitos (`01`, `02`…).

## 6. Acessibilidade

- Todo o elemento clicável deve mostrar o anel de foco ao navegar com o teclado. O `Button` já o tem; nos botões feitos à mão, use `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`.
- Imagens: `alt` descritivo. Para elementos decorativos, use `aria-hidden`.
- Botões só com ícone precisam de `aria-label`.
- Animações devem respeitar `motion-reduce:` / `motion-safe:` (veja a imagem da página inicial).
