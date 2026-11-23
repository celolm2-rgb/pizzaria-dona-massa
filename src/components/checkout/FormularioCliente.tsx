import type { DadosCliente, ErroCPF, ErroNome, ErroTelefone, ErrosCliente } from '../../domain/cliente'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { Input } from '../ui/Input'

const COPY_ERRO_NOME: Record<ErroNome, string> = { vazio: 'Conta pra gente seu nome.' }
const COPY_ERRO_TELEFONE: Record<ErroTelefone, string> = {
  vazio: 'A gente precisa de um telefone com DDD.',
  incompleto: 'Esse telefone parece incompleto — confere o DDD?',
}
const COPY_ERRO_CPF: Record<ErroCPF, string> = { invalido: 'Esse CPF não confere. Dá uma olhadinha nos números?' }

export interface FormularioClienteProps {
  valores: DadosCliente
  erros: ErrosCliente // já filtrados por `tentou`
  rotuloConfirmar: string
  onNome: (valor: string) => void
  onTelefone: (valor: string) => void
  onQuerCPF: (marcado: boolean) => void
  onCPF: (valor: string) => void
  onConfirmar: () => void
}

export function FormularioCliente({
  valores,
  erros,
  rotuloConfirmar,
  onNome,
  onTelefone,
  onQuerCPF,
  onCPF,
  onConfirmar,
}: FormularioClienteProps) {
  return (
    <Card padding="var(--sp-8)">
      <h1
        style={{
          margin: '0 0 var(--sp-6)',
          fontFamily: 'var(--font-display)',
          fontWeight: 'var(--fw-regular)',
          fontSize: 'var(--fs-title)',
          lineHeight: 'var(--lh-title)',
          color: 'var(--text-title)',
          textWrap: 'pretty',
        }}
      >
        Quase lá — falta só a gente saber quem é você
      </h1>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
          gap: 'var(--sp-5) var(--sp-6)',
          alignItems: 'start',
        }}
      >
        <Input
          id="nome"
          label="Seu nome"
          placeholder="Como a gente te chama?"
          value={valores.nome}
          onChange={onNome}
          error={erros.nome ? COPY_ERRO_NOME[erros.nome] : undefined}
        />
        <Input
          id="telefone"
          label="Telefone (com DDD)"
          placeholder="(11) 98765-4321"
          inputMode="tel"
          value={valores.telefone}
          onChange={onTelefone}
          error={erros.telefone ? COPY_ERRO_TELEFONE[erros.telefone] : undefined}
          help="A gente só liga se o motoboy se perder."
        />
        <div style={{ gridColumn: '1 / -1' }}>
          <Input kind="checkbox" label="Quero CPF na nota" checked={valores.querCPF} onToggle={onQuerCPF} />
        </div>
        {valores.querCPF && (
          <Input
            id="cpf"
            label="CPF"
            placeholder="000.000.000-00"
            inputMode="numeric"
            autoComplete="off"
            value={valores.cpf}
            onChange={onCPF}
            error={erros.cpf ? COPY_ERRO_CPF[erros.cpf] : undefined}
            help="Usado só para emitir a nota fiscal."
          />
        )}
        <div style={{ gridColumn: '1 / -1', marginTop: 'var(--sp-2)' }}>
          <Button variant="primary" size="md" fullWidth onClick={onConfirmar}>
            {rotuloConfirmar}
          </Button>
        </div>
      </div>
    </Card>
  )
}
