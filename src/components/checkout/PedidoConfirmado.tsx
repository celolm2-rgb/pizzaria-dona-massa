import type { ResumoConfirmacao } from '../../domain/pedido'
import { formatarPreco } from '../../domain/moeda'
import { LinhaTotal } from '../pedido/TotaisPedido'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { ItemResumo } from './ItemResumo'
import { itemResumoDe } from './itemResumoDe'

export interface PedidoConfirmadoProps {
  confirmacao: ResumoConfirmacao
  onInicio: () => void
}

export function PedidoConfirmado({ confirmacao, onInicio }: PedidoConfirmadoProps) {
  return (
    <main
      style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: 'var(--sp-8)',
        boxSizing: 'border-box',
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <div style={{ width: '100%', maxWidth: '520px' }}>
        <Card padding="var(--sp-8)">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-5)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 'var(--sp-3)' }}>
              <Badge tone="success">Pedido confirmado</Badge>
              <h1
                style={{
                  margin: 0,
                  fontFamily: 'var(--font-display)',
                  fontWeight: 'var(--fw-regular)',
                  fontSize: 'var(--fs-title)',
                  lineHeight: 'var(--lh-title)',
                  color: 'var(--text-title)',
                }}
              >
                Sua pizza já vai pro forno!
              </h1>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' /* PL-1 */ }}>
                <span
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: 'var(--fs-small)',
                    fontWeight: 'var(--fw-bold)',
                    color: 'var(--text-title)',
                  }}
                >
                  {`Pedido #${confirmacao.numero}`}
                </span>
                <span style={{ fontSize: 'var(--fs-body)', lineHeight: 'var(--lh-body)', color: 'var(--text-body)' }}>
                  Chega quentinha em uns 40 minutos.
                </span>
              </div>
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--sp-3)',
                paddingTop: 'var(--sp-4)',
                borderTop: 'var(--border-card)',
              }}
            >
              {confirmacao.itens.map(itemResumoDe).map(({ key, ...item }) => (
                <ItemResumo key={key} {...item} comDivisoria={false} />
              ))}
              <LinhaTotal totalFormatado={formatarPreco(confirmacao.total)} />
              {confirmacao.cpfMascarado && (
                <span style={{ fontSize: 'var(--fs-small)', color: 'var(--text-muted)' }}>
                  {`CPF na nota: ${confirmacao.cpfMascarado}`}
                </span>
              )}
            </div>
            <Button variant="primary" size="md" fullWidth onClick={onInicio}>
              Voltar para o início
            </Button>
          </div>
        </Card>
      </div>
    </main>
  )
}
