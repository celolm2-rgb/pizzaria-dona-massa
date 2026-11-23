# AI_HANDOFF — Pizzaria Dona Massa

> Briefing de ENTRADA. Leia isto PRIMEIRO numa sessão nova, junto de `docs/constitution.md`.
> Comum e estável: o que é o projeto, como começar, arquitetura e ONDE achar o estado.

## O que é
Site fictício da Pizzaria Dona Massa (Home + Cardápio com carrinho/frete + Checkout com CPF na nota) em React/Vite, usado como
laboratório da palestra "Claude Code na prática". Só dados fictícios. `project_id`: `dona-massa`.

## Como uma sessão nova começa
0. **GATE (obrigatório antes de qualquer trabalho):** rodar o "GATE do projeto" de
   `docs/constitution.md` (node/npm, base verde, Playwright, DesignSync se tocar tela, skills de
   método, nenhum `.env` real). Algum falhou → PARAR e reportar.
1. Ler este handoff + `docs/constitution.md` (núcleo em `docs/framework/constitution-core.md`).
2. Sem git e sem issues nesta instalação (D1/D2) — pular a leitura de issues.
3. Ver o trabalho em curso em `docs/wip.md` (se existir; modelo em `docs/wip.example.md`).

## Comandos
`npm test` · `npm run lint` · `npx tsc -b` · `npm run test:e2e` · `npm run screenshot` ·
`npm run gate` (test + lint + typecheck + e2e) · `npm run dev`.

## Arquitetura
- `src/domain/` — regras de negócio, funções puras (`cardapio.ts`, `carrinho.ts`, `moeda.ts`, `cliente.ts`, `pedido.ts`).
- `src/components/ui/` — componentes base do design system (Button, Card, Badge, Input).
- `src/components/home/`, `src/components/cardapio/`, `src/components/checkout/` (+ `src/components/pedido/`, compartilhado) — telas; `App.tsx` navega por `useState`.
- `src/styles/tokens.css` — tokens do design system (única fonte de estilo).
- `tests/unit/` (Vitest), `tests/e2e/` (Playwright).
- `design/` — origem do Claude Design e prompts de import.
- `.claude/agents/` — papéis do pipeline (M-9 adaptado).

## Onde está o estado (NÃO duplicar aqui)
- Features: specs em `docs/superpowers/specs/` (+ `docs/spec-*.md` das telas antigas), planos em
  `docs/superpowers/plans/`. Estado do pipeline = tabela "Assinaturas do pipeline" de cada spec.
- Histórico: sem versionador (D1) — o histórico vive nas specs/planos e no log de decisões.
- Trabalho em curso: `docs/wip.md`.
- Fatos/gotchas do sistema: `docs/fatos.md`.

## Convenções
pt-BR; tom da marca em `design/design-system.md`. ASCII em scripts. Segredo por NOME, nunca valor.
CPF completo nunca em log/console/teste (ver Confidencialidade em `docs/constitution.md`).
