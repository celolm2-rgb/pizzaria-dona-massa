import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { CheckoutPage } from '../../../../src/components/checkout/CheckoutPage'
import { ResumoPedido } from '../../../../src/components/checkout/ResumoPedido'
import { itemResumoDe } from '../../../../src/components/checkout/itemResumoDe'
import type { ItemCarrinho } from '../../../../src/domain/carrinho'

const margheritaM: ItemCarrinho = { key: 'margherita-M', nome: 'Margherita da casa', tam: 'M', preco: 45, qty: 1 }
const calabresaG: ItemCarrinho = { key: 'calabresa-G', nome: 'Calabresa da Dona', tam: 'G', preco: 60, qty: 1 }
const margheritaMx2: ItemCarrinho = { ...margheritaM, qty: 2 }

describe('itemResumoDe', () => {
  it('formata via domínio: fatias e total do item', () => {
    expect(itemResumoDe(margheritaM)).toEqual({
      key: 'margherita-M',
      nome: 'Margherita da casa',
      tam: 'M',
      fatias: '6 fatias',
      qty: 1,
      precoTotalFormatado: 'R$ 45,00',
    })
    expect(itemResumoDe(margheritaMx2).precoTotalFormatado).toBe('R$ 90,00')
  })
})

describe('ResumoPedido (aside só leitura)', () => {
  function renderResumo(itens: ItemCarrinho[] = [margheritaM, calabresaG]) {
    const onAlterar = vi.fn()
    render(
      <ResumoPedido
        itens={itens.map(itemResumoDe)}
        subtotalFormatado="R$ 105,00"
        freteFormatado="Grátis"
        freteGratis
        totalFormatado="R$ 105,00"
        onAlterar={onAlterar}
      />,
    )
    return onAlterar
  }

  it('título, itens com "Tamanho X · N fatias", totais com "Grátis"', () => {
    renderResumo()
    expect(screen.getByRole('heading', { level: 2, name: 'Seu pedido' })).toBeInTheDocument()
    expect(screen.getByText('Margherita da casa')).toBeInTheDocument()
    expect(screen.getByText('Tamanho M · 6 fatias')).toBeInTheDocument()
    expect(screen.getByText('Tamanho G · 8 fatias')).toBeInTheDocument()
    expect(screen.getByText('Grátis')).toBeInTheDocument()
    expect(screen.getAllByText('R$ 105,00')).toHaveLength(2)
  })

  it('qty > 1: detalhe com " · N unidades" e total da linha', () => {
    renderResumo([margheritaMx2])
    expect(screen.getByText('Tamanho M · 6 fatias · 2 unidades')).toBeInTheDocument()
    expect(screen.getByText('R$ 90,00')).toBeInTheDocument()
  })

  it('só leitura: sem stepper, "tirar", resumo de pizzas, aviso de frete nem Finalizar', () => {
    renderResumo()
    expect(screen.queryByRole('button', { name: 'Aumentar quantidade' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Diminuir quantidade' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'tirar' })).not.toBeInTheDocument()
    expect(screen.queryByText(/no carrinho/)).not.toBeInTheDocument()
    expect(screen.queryByText(/Faltam|Frete grátis liberado/)).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Finalizar pedido' })).not.toBeInTheDocument()
  })

  it('linha com divisória: borda inferior var(--border-card), padding-bottom sp-3; coluna gap 2px', () => {
    renderResumo()
    const coluna = screen.getByText('Margherita da casa').parentElement as HTMLElement
    const linha = coluna.parentElement as HTMLElement
    expect(coluna).toHaveStyle({ display: 'flex', flexDirection: 'column', gap: '2px' })
    expect(linha.getAttribute('style')).toContain('border-bottom: var(--border-card)')
    expect(linha.getAttribute('style')).toContain('padding-bottom: var(--sp-3)')
    expect(screen.getByText('Tamanho M · 6 fatias')).toHaveStyle({
      fontSize: 'var(--fs-caption)',
      color: 'var(--text-muted)',
    })
  })

  it('"Alterar pedido" é botão com cara de link; hover muda cor e sublinha; clique chama onAlterar', async () => {
    const onAlterar = renderResumo()
    const alterar = screen.getByRole('button', { name: 'Alterar pedido' })
    expect(alterar).toHaveStyle({
      fontSize: 'var(--fs-small)',
      fontWeight: 'var(--fw-bold)',
      color: 'var(--action-primary)',
      textDecoration: 'none',
      lineHeight: 'var(--lh-body)',
    })
    fireEvent.mouseEnter(alterar)
    expect(alterar).toHaveStyle({ color: 'var(--action-primary-hover)', textDecoration: 'underline' })
    await userEvent.click(alterar)
    expect(onAlterar).toHaveBeenCalledTimes(1)
  })
})

const TITULO = 'Quase lá — falta só a gente saber quem é você'
const ERRO_NOME = 'Conta pra gente seu nome.'
const ERRO_TEL_VAZIO = 'A gente precisa de um telefone com DDD.'
const ERRO_TEL_INCOMPLETO = 'Esse telefone parece incompleto — confere o DDD?'
const ERRO_CPF = 'Esse CPF não confere. Dá uma olhadinha nos números?'

function renderCheckout(carrinho: ItemCarrinho[] = [margheritaM]) {
  const onVoltar = vi.fn()
  const onConfirmar = vi.fn()
  const user = userEvent.setup()
  render(<CheckoutPage carrinho={carrinho} onVoltar={onVoltar} onConfirmar={onConfirmar} />)
  return { user, onVoltar, onConfirmar }
}

const confirmar = (total = 'R$ 57,00') => screen.getByRole('button', { name: `Confirmar pedido · ${total}` })
const caixaCPF = () => screen.getByRole('checkbox', { name: 'Quero CPF na nota' })

describe('CheckoutPage — estrutura', () => {
  it('main 1200px; voltar; grid com aside de 320px sticky; título literal', () => {
    renderCheckout()
    const main = screen.getByRole('main')
    expect(main).toHaveStyle({ maxWidth: '1200px', boxSizing: 'border-box' })
    expect(main.getAttribute('style')).toContain('padding: var(--sp-6) var(--sp-8) var(--sp-10)')
    expect(screen.getByRole('heading', { level: 1, name: TITULO })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '← Voltar ao cardápio' })).toBeInTheDocument()
    const aside = screen.getByRole('complementary')
    expect(aside).toHaveStyle({ position: 'sticky' })
    const grade = aside.parentElement as HTMLElement
    expect(grade).toHaveStyle({ display: 'grid', alignItems: 'start' })
    expect(grade.getAttribute('style')).toContain('grid-template-columns: minmax(0, 1fr) 320px')
    expect(grade.getAttribute('style')).toContain('gap: var(--sp-8)')
  })

  it('campos: nome e telefone visíveis; CPF oculto até marcar; checkbox começa desmarcado', () => {
    renderCheckout()
    expect(screen.getByLabelText('Seu nome')).toHaveAttribute('placeholder', 'Como a gente te chama?')
    expect(screen.getByLabelText('Telefone (com DDD)')).toHaveAttribute('placeholder', '(11) 98765-4321')
    expect(screen.getByText('A gente só liga se o motoboy se perder.')).toBeInTheDocument()
    expect(caixaCPF()).toHaveAttribute('aria-checked', 'false')
    expect(screen.queryByLabelText('CPF')).not.toBeInTheDocument()
  })

  it('rótulo do botão com o total: 1 item R$ 57,00; M x2 R$ 102,00; 2 itens R$ 105,00', () => {
    const { unmount } = render(<CheckoutPage carrinho={[margheritaM]} onVoltar={vi.fn()} onConfirmar={vi.fn()} />)
    expect(confirmar('R$ 57,00')).toBeInTheDocument()
    unmount()
    const r2 = render(<CheckoutPage carrinho={[margheritaMx2]} onVoltar={vi.fn()} onConfirmar={vi.fn()} />)
    expect(confirmar('R$ 102,00')).toBeInTheDocument()
    r2.unmount()
    render(<CheckoutPage carrinho={[margheritaM, calabresaG]} onVoltar={vi.fn()} onConfirmar={vi.fn()} />)
    expect(confirmar('R$ 105,00')).toBeInTheDocument()
  })

  it('aside: itens só leitura via ResumoPedido; com qty 2 mostra unidades', () => {
    renderCheckout([margheritaMx2])
    const aside = screen.getByRole('complementary')
    expect(within(aside).getByText('Tamanho M · 6 fatias · 2 unidades')).toBeInTheDocument()
    expect(within(aside).getByText('R$ 12,00')).toBeInTheDocument()
    expect(within(aside).queryByRole('button', { name: 'Aumentar quantidade' })).not.toBeInTheDocument()
    expect(within(aside).queryByRole('button', { name: 'tirar' })).not.toBeInTheDocument()
  })

  it('"← Voltar ao cardápio" e "Alterar pedido" chamam onVoltar', async () => {
    const { user, onVoltar } = renderCheckout()
    await user.click(screen.getByRole('button', { name: '← Voltar ao cardápio' }))
    await user.click(screen.getByRole('button', { name: 'Alterar pedido' }))
    expect(onVoltar).toHaveBeenCalledTimes(2)
  })
})

describe('CheckoutPage — validação e máscaras', () => {
  it('sem erros antes de tentar; confirmar vazio mostra erros de nome e telefone e não confirma', async () => {
    const { user, onConfirmar } = renderCheckout()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    await user.click(confirmar())
    expect(screen.getByText(ERRO_NOME)).toBeInTheDocument()
    expect(screen.getByText(ERRO_TEL_VAZIO)).toBeInTheDocument()
    expect(screen.getAllByRole('alert')).toHaveLength(2)
    expect(onConfirmar).not.toHaveBeenCalled()
  })

  it('depois de tentar, o erro some assim que o campo fica válido (sem novo clique)', async () => {
    const { user } = renderCheckout()
    await user.click(confirmar())
    await user.type(screen.getByLabelText('Seu nome'), 'Ana Exemplo')
    expect(screen.queryByText(ERRO_NOME)).not.toBeInTheDocument()
    expect(screen.getByText(ERRO_TEL_VAZIO)).toBeInTheDocument()
    await user.type(screen.getByLabelText('Telefone (com DDD)'), '119000')
    expect(screen.getByText(ERRO_TEL_INCOMPLETO)).toBeInTheDocument()
  })

  it('máscaras progressivas: telefone e CPF; erro de CPF depois de tentar', async () => {
    const { user } = renderCheckout()
    await user.type(screen.getByLabelText('Telefone (com DDD)'), '11900000000')
    expect(screen.getByLabelText('Telefone (com DDD)')).toHaveValue('(11) 90000-0000')
    await user.click(caixaCPF())
    await user.type(screen.getByLabelText('CPF'), '12345678900')
    expect(screen.getByLabelText('CPF')).toHaveValue('123.456.789-00')
    expect(screen.queryByText(ERRO_CPF)).not.toBeInTheDocument()
    await user.click(confirmar())
    expect(screen.getByText(ERRO_CPF)).toBeInTheDocument()
  })

  it('campo CPF: inputMode numeric, ajuda literal, autocomplete=off; nome e telefone sem o atributo (P-5)', async () => {
    const { user } = renderCheckout()
    await user.click(caixaCPF())
    const cpf = screen.getByLabelText('CPF')
    expect(cpf).toHaveAttribute('autocomplete', 'off')
    expect(cpf).toHaveAttribute('inputmode', 'numeric')
    expect(cpf).toHaveAttribute('placeholder', '000.000.000-00')
    expect(screen.getByText('Usado só para emitir a nota fiscal.')).toBeInTheDocument()
    expect(screen.getByLabelText('Seu nome')).not.toHaveAttribute('autocomplete')
    expect(screen.getByLabelText('Telefone (com DDD)')).not.toHaveAttribute('autocomplete')
  })

  it('P-3: desmarcar some com o erro e descarta o CPF; remarcar mostra o campo vazio', async () => {
    const { user } = renderCheckout()
    await user.click(caixaCPF())
    await user.type(screen.getByLabelText('CPF'), '123')
    await user.click(confirmar())
    expect(screen.getByText(ERRO_CPF)).toBeInTheDocument()
    await user.click(caixaCPF())
    expect(screen.queryByText(ERRO_CPF)).not.toBeInTheDocument()
    expect(screen.queryByLabelText('CPF')).not.toBeInTheDocument()
    await user.click(caixaCPF())
    expect(screen.getByLabelText('CPF')).toHaveValue('')
  })

  it('fluxo válido chama onConfirmar com os valores formatados', async () => {
    const { user, onConfirmar } = renderCheckout()
    await user.type(screen.getByLabelText('Seu nome'), 'Ana Exemplo')
    await user.type(screen.getByLabelText('Telefone (com DDD)'), '11900000000')
    await user.click(caixaCPF())
    await user.type(screen.getByLabelText('CPF'), '12345678909')
    await user.click(confirmar())
    expect(onConfirmar).toHaveBeenCalledTimes(1)
    expect(onConfirmar).toHaveBeenCalledWith({
      nome: 'Ana Exemplo',
      telefone: '(11) 90000-0000',
      querCPF: true,
      cpf: '123.456.789-09',
    })
  })

  it('FR-1: CPF inválido com tentou, desmarcar e confirmar -> confirma sem CPF', async () => {
    const { user, onConfirmar } = renderCheckout()
    await user.type(screen.getByLabelText('Seu nome'), 'Ana Exemplo')
    await user.type(screen.getByLabelText('Telefone (com DDD)'), '11900000000')
    await user.click(caixaCPF())
    await user.type(screen.getByLabelText('CPF'), '12345678900')
    await user.click(confirmar())
    expect(onConfirmar).not.toHaveBeenCalled()
    await user.click(caixaCPF())
    await user.click(confirmar())
    expect(onConfirmar).toHaveBeenCalledWith({ nome: 'Ana Exemplo', telefone: '(11) 90000-0000', querCPF: false, cpf: '' })
  })

  it('FR-3: colar CPF com pontuação e mais de 11 dígitos corta e formata', async () => {
    const { user } = renderCheckout()
    await user.click(caixaCPF())
    await user.click(screen.getByLabelText('CPF'))
    await user.paste('123.456.789-091')
    expect(screen.getByLabelText('CPF')).toHaveValue('123.456.789-09')
  })

  it('FR-4: telefone fixo de 10 dígitos é aceito e confirma', async () => {
    const { user, onConfirmar } = renderCheckout()
    await user.type(screen.getByLabelText('Seu nome'), 'Ana Exemplo')
    await user.type(screen.getByLabelText('Telefone (com DDD)'), '1100000000')
    expect(screen.getByLabelText('Telefone (com DDD)')).toHaveValue('(11) 0000-0000')
    await user.click(confirmar())
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(onConfirmar).toHaveBeenCalledWith({ nome: 'Ana Exemplo', telefone: '(11) 0000-0000', querCPF: false, cpf: '' })
  })

  it('FR-5: nome só com espaços mostra o erro e não confirma', async () => {
    const { user, onConfirmar } = renderCheckout()
    await user.type(screen.getByLabelText('Seu nome'), '   ')
    await user.type(screen.getByLabelText('Telefone (com DDD)'), '11900000000')
    await user.click(confirmar())
    expect(screen.getByText(ERRO_NOME)).toBeInTheDocument()
    expect(onConfirmar).not.toHaveBeenCalled()
  })

  it('o botão confirmar continua visível e habilitado com erros (prompt L61); wrapper ocupa a linha inteira', async () => {
    const { user } = renderCheckout()
    await user.click(confirmar())
    expect(confirmar()).toBeEnabled()
    const wrapperBotao = confirmar().parentElement as HTMLElement
    expect(wrapperBotao.getAttribute('style')).toContain('grid-column: 1 / -1')
    expect(wrapperBotao.getAttribute('style')).toContain('margin-top: var(--sp-2)')
  })

  it('erro em hover no campo: borda danger (cor e borda conferidas)', async () => {
    const { user } = renderCheckout()
    await user.click(confirmar())
    const nome = screen.getByLabelText('Seu nome')
    fireEvent.mouseEnter(nome)
    expect(nome.getAttribute('style')).toContain('border: 1px solid var(--danger)')
    expect(nome).toHaveStyle({ background: 'var(--surface-card)' })
  })
})

describe('CheckoutPage — LGPD (guarda)', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('nenhum argumento de console contém o CPF, com ou sem máscara', async () => {
    const metodos = ['log', 'info', 'warn', 'error', 'debug'] as const
    const espioes = metodos.map((m) => vi.spyOn(console, m).mockImplementation(() => {}))
    const { user, onConfirmar } = renderCheckout()
    await user.type(screen.getByLabelText('Seu nome'), 'Ana Exemplo')
    await user.type(screen.getByLabelText('Telefone (com DDD)'), '11900000000')
    await user.click(caixaCPF())
    await user.type(screen.getByLabelText('CPF'), '12345678909')
    await user.click(confirmar())
    expect(onConfirmar).toHaveBeenCalledTimes(1)
    const argumentos = espioes.flatMap((e) => e.mock.calls.flat().map((a) => String(a)))
    for (const a of argumentos) {
      expect(a).not.toContain('12345678909')
      expect(a).not.toContain('123.456.789-09')
      expect(a).not.toContain('Ana Exemplo')
      expect(a).not.toContain('90000-0000')
    }
  })
})
