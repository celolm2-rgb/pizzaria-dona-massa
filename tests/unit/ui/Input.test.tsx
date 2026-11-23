import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Input } from '../../../src/components/ui/Input'

const estilo = (el: HTMLElement) => el.getAttribute('style') ?? ''

describe('Input — texto', () => {
  it('rótulo liga ao campo; placeholder, inputMode e ajuda; sem erro', () => {
    render(
      <Input
        id="telefone"
        label="Telefone (com DDD)"
        value=""
        onChange={vi.fn()}
        placeholder="(11) 98765-4321"
        inputMode="tel"
        help="A gente só liga se o motoboy se perder."
      />,
    )
    const campo = screen.getByLabelText('Telefone (com DDD)')
    expect(campo).toHaveAttribute('type', 'text')
    expect(campo).toHaveAttribute('placeholder', '(11) 98765-4321')
    expect(campo).toHaveAttribute('inputmode', 'tel')
    expect(campo).toHaveAttribute('aria-invalid', 'false')
    expect(campo).toHaveAttribute('aria-describedby', 'telefone-ajuda')
    expect(screen.getByText('A gente só liga se o motoboy se perder.')).toHaveStyle({
      fontSize: 'var(--fs-caption)',
      lineHeight: 'var(--lh-body)',
      color: 'var(--text-muted)',
    })
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('é controlado: digitar chama onChange com o valor', async () => {
    const onChange = vi.fn()
    render(<Input id="nome" label="Seu nome" value="" onChange={onChange} />)
    await userEvent.type(screen.getByLabelText('Seu nome'), 'A')
    expect(onChange).toHaveBeenCalledWith('A')
  })

  it('com erro: role=alert com a copy, a ajuda some, aria-invalid=true', () => {
    render(
      <Input id="nome" label="Seu nome" value="" onChange={vi.fn()} help="Ajuda qualquer" error="Conta pra gente seu nome." />,
    )
    const alerta = screen.getByRole('alert')
    expect(alerta).toHaveTextContent('Conta pra gente seu nome.')
    expect(alerta).toHaveStyle({
      fontSize: 'var(--fs-caption)',
      fontWeight: 'var(--fw-bold)',
      lineHeight: 'var(--lh-body)',
      color: 'var(--danger)',
    })
    expect(screen.queryByText('Ajuda qualquer')).not.toBeInTheDocument()
    const campo = screen.getByLabelText('Seu nome')
    expect(campo).toHaveAttribute('aria-invalid', 'true')
    expect(campo).toHaveAttribute('aria-describedby', 'nome-erro')
  })

  it('estrutura: coluna gap 6px; rótulo small/bold/title/lh-body', () => {
    render(<Input id="nome" label="Seu nome" value="" onChange={vi.fn()} />)
    const rotulo = screen.getByText('Seu nome')
    expect(rotulo.tagName).toBe('LABEL')
    expect(rotulo).toHaveStyle({
      fontSize: 'var(--fs-small)',
      fontWeight: 'var(--fw-bold)',
      color: 'var(--text-title)',
      lineHeight: 'var(--lh-body)',
    })
    expect(rotulo.parentElement).toHaveStyle({ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' })
  })

  it('padrão: borda var(--border-card), fundo surface-card, sem sombra, padding 12px 14px', () => {
    render(<Input id="nome" label="Seu nome" value="" onChange={vi.fn()} />)
    const campo = screen.getByLabelText('Seu nome')
    expect(estilo(campo)).toContain('border: var(--border-card)')
    expect(estilo(campo)).toContain('border-radius: var(--radius-md)')
    expect(campo).toHaveStyle({
      background: 'var(--surface-card)',
      color: 'var(--text-body)',
      boxShadow: 'none',
      padding: '12px 14px',
      fontSize: 'var(--fs-body)',
      lineHeight: 'var(--lh-body)',
    })
    expect(estilo(campo)).toContain('transition: border-color .15s ease, box-shadow .15s ease, background .15s ease')
  })

  it('hover sem foco: borda 1px solid var(--border-strong)', () => {
    render(<Input id="nome" label="Seu nome" value="" onChange={vi.fn()} />)
    const campo = screen.getByLabelText('Seu nome')
    fireEvent.mouseEnter(campo)
    expect(estilo(campo)).toContain('border: 1px solid var(--border-strong)')
    fireEvent.mouseLeave(campo)
    expect(estilo(campo)).toContain('border: var(--border-card)')
  })

  it('foco (mesmo com hover): focus-ring e a borda continua var(--border-card)', () => {
    render(<Input id="nome" label="Seu nome" value="" onChange={vi.fn()} />)
    const campo = screen.getByLabelText('Seu nome')
    fireEvent.mouseEnter(campo)
    fireEvent.focus(campo)
    expect(campo).toHaveStyle({ boxShadow: 'var(--focus-ring)' })
    expect(estilo(campo)).toContain('border: var(--border-card)')
    expect(estilo(campo)).not.toContain('var(--border-strong)')
  })

  it('erro prevalece sobre hover e foco: borda 1px solid var(--danger)', () => {
    render(<Input id="nome" label="Seu nome" value="" onChange={vi.fn()} error="Conta pra gente seu nome." />)
    const campo = screen.getByLabelText('Seu nome')
    expect(estilo(campo)).toContain('border: 1px solid var(--danger)')
    fireEvent.mouseEnter(campo)
    fireEvent.focus(campo)
    expect(estilo(campo)).toContain('border: 1px solid var(--danger)')
  })

  it('desabilitado: fundo surface-inset, texto muted, not-allowed, sem hover nem foco', () => {
    render(<Input id="cpf" label="CPF" value="123.456.789-09" onChange={vi.fn()} disabled />)
    const campo = screen.getByLabelText('CPF')
    expect(campo).toBeDisabled()
    fireEvent.mouseEnter(campo)
    fireEvent.focus(campo)
    expect(campo).toHaveStyle({
      background: 'var(--surface-inset)',
      color: 'var(--text-muted)',
      cursor: 'not-allowed',
      boxShadow: 'none',
    })
    expect(estilo(campo)).toContain('border: var(--border-card)')
  })

  it('autoComplete="off" vira atributo; sem a prop, o atributo não existe (P-5)', () => {
    render(
      <>
        <Input id="cpf" label="CPF" value="" onChange={vi.fn()} autoComplete="off" />
        <Input id="nome" label="Seu nome" value="" onChange={vi.fn()} />
      </>,
    )
    expect(screen.getByLabelText('CPF')).toHaveAttribute('autocomplete', 'off')
    expect(screen.getByLabelText('Seu nome')).not.toHaveAttribute('autocomplete')
  })

  it('placeholder: com 2 Inputs, 1 única regra .dm-input::placeholder no documento; o campo tem a classe', () => {
    render(
      <>
        <Input id="nome" label="Seu nome" value="" onChange={vi.fn()} placeholder="Como a gente te chama?" />
        <Input id="telefone" label="Telefone (com DDD)" value="" onChange={vi.fn()} />
      </>,
    )
    const regras = [...document.querySelectorAll('style')].filter((s) =>
      (s.textContent ?? '').includes('.dm-input::placeholder'),
    )
    expect(regras).toHaveLength(1)
    expect(regras[0].textContent).toContain('color:var(--text-muted)')
    expect(regras[0].textContent).toContain('opacity:1')
    expect(screen.getByLabelText('Seu nome')).toHaveClass('dm-input')
    expect(screen.getByLabelText('Telefone (com DDD)')).toHaveClass('dm-input')
  })
})

describe('Input — checkbox', () => {
  it('desmarcado: aria-checked=false, sem marca, 22x22, fundo surface-card, borda border-strong; linha gap 10px', () => {
    render(<Input kind="checkbox" label="Quero CPF na nota" checked={false} onToggle={vi.fn()} />)
    const caixa = screen.getByRole('checkbox', { name: 'Quero CPF na nota' })
    expect(caixa).toHaveAttribute('aria-checked', 'false')
    expect(caixa.textContent).toBe('') // toHaveTextContent('') casaria qualquer texto (assert vazio)
    expect(caixa).toHaveStyle({ width: '22px', height: '22px', background: 'var(--surface-card)' })
    expect(estilo(caixa)).toContain('border: 1px solid var(--border-strong)')
    expect(estilo(caixa)).toContain('border-radius: var(--radius-sm)')
    expect(caixa.parentElement).toHaveStyle({ display: 'flex', alignItems: 'center', gap: '10px' })
    expect(screen.getByText('Quero CPF na nota')).toHaveStyle({
      fontSize: 'var(--fs-body)',
      color: 'var(--text-body)',
      cursor: 'pointer',
      userSelect: 'none',
    })
  })

  it('clicar na caixa e clicar no rótulo chamam onToggle(true)', async () => {
    const onToggle = vi.fn()
    render(<Input kind="checkbox" label="Quero CPF na nota" checked={false} onToggle={onToggle} />)
    await userEvent.click(screen.getByRole('checkbox', { name: 'Quero CPF na nota' }))
    await userEvent.click(screen.getByText('Quero CPF na nota'))
    expect(onToggle).toHaveBeenNthCalledWith(1, true)
    expect(onToggle).toHaveBeenNthCalledWith(2, true)
  })

  it('marcado: aria-checked=true, ✓, fundo e borda action-primary; clicar chama onToggle(false)', async () => {
    const onToggle = vi.fn()
    render(<Input kind="checkbox" label="Quero CPF na nota" checked onToggle={onToggle} />)
    const caixa = screen.getByRole('checkbox', { name: 'Quero CPF na nota' })
    expect(caixa).toHaveAttribute('aria-checked', 'true')
    expect(caixa).toHaveTextContent('✓')
    expect(caixa).toHaveStyle({
      background: 'var(--action-primary)',
      color: 'var(--text-on-primary)',
      fontSize: 'var(--fs-small)',
      fontWeight: 'var(--fw-bold)',
      lineHeight: '1',
    })
    expect(estilo(caixa)).toContain('border: 1px solid var(--action-primary)')
    await userEvent.click(caixa)
    expect(onToggle).toHaveBeenCalledWith(false)
  })

  it('hover: shadow-card só desmarcado; foco: focus-ring', () => {
    const { unmount } = render(<Input kind="checkbox" label="Quero CPF na nota" checked={false} onToggle={vi.fn()} />)
    const desmarcada = screen.getByRole('checkbox', { name: 'Quero CPF na nota' })
    fireEvent.mouseEnter(desmarcada)
    expect(desmarcada).toHaveStyle({ boxShadow: 'var(--shadow-card)' })
    expect(estilo(desmarcada)).toContain('border: 1px solid var(--border-strong)')
    fireEvent.focus(desmarcada)
    expect(desmarcada).toHaveStyle({ boxShadow: 'var(--focus-ring)' })
    unmount()

    render(<Input kind="checkbox" label="Quero CPF na nota" checked onToggle={vi.fn()} />)
    const marcada = screen.getByRole('checkbox', { name: 'Quero CPF na nota' })
    fireEvent.mouseEnter(marcada)
    expect(marcada).toHaveStyle({ boxShadow: 'none' })
  })

  it('desabilitado: não chama onToggle (caixa nem rótulo); fundo inset; rótulo muted', async () => {
    const onToggle = vi.fn()
    render(<Input kind="checkbox" label="Quero CPF na nota" checked={false} onToggle={onToggle} disabled />)
    const caixa = screen.getByRole('checkbox', { name: 'Quero CPF na nota' })
    await userEvent.click(caixa)
    await userEvent.click(screen.getByText('Quero CPF na nota'))
    expect(onToggle).not.toHaveBeenCalled()
    expect(caixa).toHaveStyle({ background: 'var(--surface-inset)', color: 'var(--text-muted)', cursor: 'not-allowed' })
    expect(screen.getByText('Quero CPF na nota')).toHaveStyle({ color: 'var(--text-muted)', cursor: 'not-allowed' })
  })
})
