# Memória de fatos — Dona Massa

> Só o que é verdade sobre o sistema e NÃO se deriva do código. Datado.

- **2026-10-01** — O repo central `cq1-developer/ai-working-framework` é privado: `curl` no
  `raw.githubusercontent.com` dá 404; buscar com
  `gh api repos/cq1-developer/ai-working-framework/contents/<arquivo>?ref=main -H "Accept: application/vnd.github.raw"`.
- **2026-10-01** — `npm run screenshot` sobe o próprio Vite na porta 3101 (strictPort) e usa o
  viewport padrão do Playwright (1280x720); o E2E usa a 3100 com `reuseExistingServer` — se outro
  app ocupar a porta, o Playwright o reutiliza e testa o app errado (aconteceu com o
  `pizzaria-dona-massa-template` na antiga 5173; ver D5).
- **2026-10-02** — Régua de paridade do Cardápio: `node tests/paridade/cardapio.paridade.mjs`
  (porta 3100 por padrão, `PARIDADE_PORT`; `PARIDADE_OUT=<dir>` salva prints V/P/G). Exit 0 ok,
  1 divergência, 2 erro. As 15 linhas `[DIFERE] nao verificado: hint` (Badge 24.8 vs 22, Button 44
  vs 48) são hints do editor do Claude Design, não medidas — esperadas.
- **2026-10-02** — Ferramentas de MCP (`DesignSync`) não chegam a subagentes; ver D6.
- **2026-10-01** — Frete: R$12, grátis a partir de R$100 — o protótipo do Claude Design usa R$8, mas
  vale a instrução do usuário (ver `docs/spec-cardapio.md`).
- **2026-10-02** — Régua do checkout: `node tests/paridade/checkout.paridade.mjs` (porta 3100,
  `PARIDADE_OUT=<dir>`); a prancha I monta o `ui/Input` numa página virtual servida por plugin da
  própria régua. O print `paridade-checkout-I.png` é tirado depois das interações (clique/blur), então
  não serve como evidência visual da prancha — as medidas da régua continuam válidas.
- **2026-10-02** — O carrinho mora em `App.tsx` (estado React em memória) desde a Feature 2; o
  `CardapioPage` recebe `carrinho`/`onCarrinhoChange`.

