# Angola Scholar Bridge

Sistema web que publica bolsas de estudo internas e externas para angolanos e oferece mentorias pagas a quem se candidatar.

## Tecnologias

- [TanStack Start](https://tanstack.com/start) (React 19 + TanStack Router, routing por ficheiros em `src/routes/`)
- [Tailwind CSS 4](https://tailwindcss.com) e componentes [shadcn/ui](https://ui.shadcn.com) em `src/components/ui/`
- [Vitest](https://vitest.dev) para testes

## Desenvolvimento

Requer Node.js e npm.

```sh
npm install
npm run dev
```

## Scripts

| Comando           | Descrição                         |
| ----------------- | --------------------------------- |
| `npm run dev`     | Servidor de desenvolvimento       |
| `npm run build`   | Build de produção (em `.output/`) |
| `npm run preview` | Pré-visualizar o build            |
| `npm run test`    | Correr os testes                  |
| `npm run lint`    | Verificar o código com ESLint     |
