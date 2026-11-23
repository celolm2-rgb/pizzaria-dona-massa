# Padrão: seção "Assinaturas do pipeline"

Toda spec que percorre o pipeline (M-9 adaptado — `docs/constitution.md`, D2/D3) ganha esta seção no
final. Nasce `em-andamento` com a linha do `especificador` e fecha `fechado` quando todas as linhas
exigidas existem sem `bloqueia`/`refuta` em aberto. Sem lint: a conferência é manual.

## Template

```markdown
## Assinaturas do pipeline
<!-- pipeline: em-andamento -->

| papel | data | evidencia | veredito |
|---|---|---|---|
| especificador | AAAA-MM-DD | caminho da spec | - |
```

## Vocabulário
- **papel:** `especificador`, `revisor-spec`, `planejador`, `revisor (plano)`, `dev`, `testador`,
  `revisor (PR)`, `revisor-design`. Sem `mergeador` (D2).
- **veredito:** `-` (quem produz), `aprova`/`bloqueia` (revisores), `confirma`/`refuta` (testador).
  `bloqueia`/`refuta` exige, mais abaixo, nova linha do mesmo papel sem trava (re-revisão pós-fix).
- **evidência do dev:** sem git (D1) → lista de arquivos tocados + saída do teste vermelho/verde.
- **paridade visual** (evidência do testador, quando a spec tem `## Inventario de paridade`):
  `paridade visual: ok` | `bloqueado (<motivo>)` | `nao se aplica (<motivo>)`.

## Ordem e quem confere o quê
especificador → revisor-spec → planejador → revisor (plano) → dev → (testador ∥ revisor (PR)).
Cada papel confere a linha do anterior antes de agir. Fechamento: a sessão principal confere a tabela
completa (no lugar do mergeador).

## Quem grava
- Quem produz (`especificador`, `planejador`, `dev`) grava a própria linha.
- Revisores e testador não têm escrita: devolvem a linha pronta e a sessão principal a **transcreve
  literalmente** (D3). Transcrever ≠ corrigir.
- Achado volta ao agente que produziu o artefato, retomado com contexto intacto (SendMessage).

## Checklist do brief (entra no brief do planejador e do dev)
- Teste com vermelho real: nada de assert vazio, regex no fonte ou fixture que já satisfaz o teste.
- **Dado pessoal (CPF/telefone/nome) nunca em log, console, URL, erro ou snapshot**; CPF exibido só
  mascarado; só dados fictícios nos testes. A guarda de console/DOM cobre TODOS os dados pessoais
  da feature (CPF, nome, telefone), não só o CPF, e prova dentes com mutação (`console.info(<dado>)`
  derruba o teste). Prova: achado 1 do revisor (PR), Checkout, 2026-10-02 — guarda só do CPF, a
  mutação `console.info(telefone)` sobrevivia.
- Regra de negócio (validação de CPF/telefone, total, frete) só em `src/domain`; componente só exibe.
- Estilo só por tokens e componentes `ui`; componente genérico nasce em `src/components/ui` (E-1/E-5).
- Tela com mockup: comparação no viewport 1280x720, tela inteira dos dois lados (E-6).
- Rodar `npx tsc -b` antes de reportar pronto.
- Valor cru (px, s, hex) só se estiver na lista fechada aprovada pelo PO na spec; o plano não
  prescreve valor fora dela, e o dev lista por grep todo `px`/`s` cru em `src/components/<tela>` e
  confronta com a lista antes de entregar. Prova: C1 do revisor (PR), Cardápio, 2026-10-02 — o
  plano prescreveu borda/transição crua que a própria lista proibia; dois revisores não pegaram.
- Asserts de texto em E2E/unit com match exato (`{ exact: true }` no Playwright) quando a mesma
  palavra aparece em outro elemento. Prova: N2 do revisor (PR), "Grátis" casava "Frete grátis liberado!".
- Papel que lê design recebe o mockup por cópia local no brief (D6), nunca depende de `DesignSync`.
