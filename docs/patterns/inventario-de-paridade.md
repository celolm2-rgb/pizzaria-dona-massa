# Padrão: seção "Inventario de paridade" (E-6)

Toda spec de tela com mockup aprovado ganha esta seção, escrita pelo `especificador` a partir das
medidas do mockup (`*.dc.html` via `DesignSync`) e do app no MESMO viewport (1280x720, tela inteira).
Append-only: mudar uma decisão exige nova aprovação do usuário (PO).

## Template

```markdown
## Inventario de paridade

| # | Tela/estado | Elemento | Mockup | App hoje | Token | Decisao |
|---|---|---|---|---|---|---|
| 1 | Checkout/vazio | Titulo do formulario | Young Serif 1.75rem, carvao-900, "Quase la..." | inexistente | --font-display, --fs-title, --text-title | implementa |
```

## Regras
- **Elemento:** nome estável e único — é por ele que `testador` e `revisor-design` casam o achado
  (texto EXATO, nunca aproximado).
- **Mockup:** fonte (família/tamanho/peso), geometria, padding, gap, cor e copy literal.
- **Token:** cor/espaço convertidos para o token semântico de `src/styles/tokens.css`; valor sem
  token → linha com decisão explícita do PO.
- **Decisao:** `implementa` | `corta` | `adia` — sempre com motivo quando não for `implementa`.
- Divergência em linha `implementa` = defeito (volta ao dev). Divergência sem linha = escalar ao PO.
