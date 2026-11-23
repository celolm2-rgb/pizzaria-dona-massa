# Prompt para o Claude Design — Checkout ("Finalizar pedido")

> **Resultado:** gerado no projeto `02dc2137-ef8c-4ce1-a78a-620ac1883b79` (não no 6036dccf).
> Import:
> ```
> Use the claude_design MCP (https://api.anthropic.com/v1/design/mcp, auth via /design-login) to import this project:
> https://claude.ai/design/p/02dc2137-ef8c-4ce1-a78a-620ac1883b79?file=Checkout.dc.html
>
> Implement: Checkout.dc.html
> ```

Colar no projeto Claude Design "Tela de Cardápio de Pizzas"
(https://claude.ai/design/p/6036dccf-e261-4ed4-a41b-e1751a2451cf), usando o design system
"Dona Massa Design System" (https://claude.ai/design/p/e7eebd99-3f42-41c1-9308-431ca91d321c).
Depois de aprovado, registrar a instrução de import em `design/design-prompt.md` e no
`design/design-system.md`.

---

Crie o arquivo `Checkout.dc.html` neste projeto: a tela de finalizar pedido da Pizzaria Dona Massa,
continuação direta do `Cardapio.dc.html`. Use EXCLUSIVAMENTE o design system "Dona Massa Design
System" (tokens de cor, tipografia, espaçamento, raio e sombra; componentes Button, Card e Badge).
Não crie cor, fonte, sombra ou raio novos. Frame de 1280x720 (mesmo viewport das telas existentes),
tela inteira.

## Ponto de entrada (alteração no Cardapio.dc.html)
No card "Seu pedido", abaixo do Total, adicione um Button primary fullWidth "Finalizar pedido".
Só aparece com itens no pedido. É a única ação primary do card.

## Tela 1 — Finalizar pedido
- Header idêntico ao do Cardápio (fundo --action-primary, wordmark "Pizzaria Dona Massa" em Young
  Serif, tagline). Link de apoio "← Voltar ao cardápio" (Button secondary sm ou link).
- Layout igual ao Cardápio: max-width 1200px, 2 colunas (minmax(0,1fr) 320px, gap 32px).
- Coluna esquerda: Card com título "Quase lá — falta só a gente saber quem é você" (Young Serif,
  --fs-title) e o formulário:
  1. "Seu nome" — campo de texto, obrigatório.
  2. "Telefone (com DDD)" — campo de texto com máscara visual "(11) 98765-4321", obrigatório.
     Texto de ajuda: "A gente só liga se o motoboy se perder."
  3. Checkbox "Quero CPF na nota". Desmarcado por padrão. Marcado → revela o campo
     "CPF" com máscara "000.000.000-00" e ajuda "Usado só para emitir a nota fiscal."
  4. Button primary fullWidth "Confirmar pedido · R$ XX,00" (total do pedido).
- Coluna direita (aside, sticky): resumo do pedido SOMENTE LEITURA — mesmos itens, Subtotal,
  Frete/"Grátis" e Total do card "Seu pedido", sem os controles −/+/×. Link "Alterar pedido"
  volta ao cardápio.

## Componente novo: Input (adicionar ao design system)
Campo de formulário reutilizável, documentado como componente do DS (não inline na tela):
rótulo (Karla, --fs-small, --fw-bold, --text-title) → campo → texto de ajuda ou erro (--fs-caption).
- Campo: fundo --surface-card, borda --border-card, raio --radius-md, padding 12px 14px,
  texto --fs-body --text-body, placeholder --text-muted.
- Estados (mostrar todos lado a lado numa prancha do componente): padrão, hover
  (--border-strong), foco (--focus-ring), erro (borda --danger + mensagem em --danger, fundo da
  mensagem opcional --danger-bg), desabilitado (--surface-inset, --text-muted).
- Checkbox no mesmo estilo: marcado em --action-primary com "✓".

## Estados a desenhar (uma prancha por estado)
1. Vazio — formulário em branco, CPF oculto.
2. Preenchido válido — com "Quero CPF na nota" marcado e CPF preenchido.
3. Erros de validação — nome vazio: "Conta pra gente seu nome."; telefone incompleto:
   "Esse telefone parece incompleto — confere o DDD?"; CPF inválido: "Esse CPF não confere.
   Dá uma olhadinha nos números?". Botão Confirmar continua visível.
4. Confirmação — substitui a tela 1: Card central com Badge success "PEDIDO CONFIRMADO", título
   "Sua pizza já vai pro forno!", número "Pedido #1234", "Chega quentinha em uns 40 minutos.",
   resumo dos itens e Total, e — só se informado — "CPF na nota: ***.456.789-**" (sempre
   mascarado, nunca o CPF completo). Button primary "Voltar para o início".

## Tom e regras de conteúdo
- Português brasileiro, informal-caloroso, "a gente"/"você", sentence case, sem emoji, sem jargão
  de sistema ("Pedido processado com sucesso" é proibido).
- Preços no formato "R$ 52,00". Use os itens/preços do Cardápio (P R$35, M R$45, G R$55; extras
  Calabresa +R$5, Quatro queijos +R$10; frete R$12, grátis a partir de R$100).
- Dados de exemplo SOMENTE fictícios: nome "Ana Exemplo", telefone "(11) 90000-0000",
  CPF de teste "123.456.789-09". Nunca dado real.
- Fora do escopo (não desenhar): endereço/CEP, forma de pagamento, login, responsivo mobile.
