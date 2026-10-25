# Angola Scholar Bridge

Sistema web que publica bolsas de estudo internas e externas para angolanos e oferece mentorias pagas a quem se candidatar.

## Tecnologias

- [TanStack Start](https://tanstack.com/start) (React 19 + TanStack Router, routing por ficheiros em `src/routes/`)
- [Tailwind CSS 4](https://tailwindcss.com) e componentes [shadcn/ui](https://ui.shadcn.com) em `src/components/ui/`
- [Vitest](https://vitest.dev) para testes

## Dados e autenticação (simulação)

Nesta fase não há backend. Utilizadores, sessão, bolsas, mentorias e pagamentos ficam no `localStorage` do browser (chaves `bolsaangola_*`), através da camada em [`src/lib/dados/`](src/lib/dados). Para ligar a uma API real, basta substituir essa camada.

> **Atenção:** isto é apenas uma simulação para desenvolvimento. O `localStorage` não protege as palavras-passe nem controla o acesso no servidor. As permissões são verificadas só no browser.

Na primeira visita são criados dados de demonstração (sem apagar nem duplicar dados existentes). O administrador pode repô-los em **Visão geral → Dados de demonstração**.

### Contas de demonstração

Todas usam a palavra-passe `1234`.

| Perfil        | E-mail                       | Notas                               |
| ------------- | ---------------------------- | ----------------------------------- |
| Administrador | `admin@gmail.com`            | Administrador padrão                |
| Mentor        | `ana.lucas@bolsaangola.ao`   | Activa, 2 clientes                  |
| Mentor        | `pedro.kiala@bolsaangola.ao` | Activo, 1 cliente                   |
| Mentor        | `rosa.manuel@bolsaangola.ao` | Inactiva                            |
| Cliente       | `joana.bento@exemplo.ao`     | Mentoria com mentor atribuído       |
| Cliente       | `carlos.domingos@exemplo.ao` | Mentoria em andamento               |
| Cliente       | `marta.sebastiao@exemplo.ao` | Mentoria concluída                  |
| Cliente       | `nelson.tavares@exemplo.ao`  | Um pedido por pagar e um por validar |

### Fluxo das mentorias

1. O cliente solicita uma mentoria (`aguardando_pagamento`).
2. Regista um pagamento simulado (`pagamento_pendente_validacao`).
3. O administrador valida-o em **Mentorias e pagamentos** (`pago`).
4. O sistema atribui o mentor activo com menos clientes (`mentor_atribuido`). Se não houver nenhum, o pedido fica pago, à espera, e é atribuído quando um mentor for criado ou reactivado.
5. O mentor inicia (`em_andamento`) e conclui (`concluida`) a mentoria.

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
