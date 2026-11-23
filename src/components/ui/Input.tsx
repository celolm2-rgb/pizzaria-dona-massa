import { useState, type CSSProperties } from 'react'

export type InputMode = 'text' | 'numeric' | 'tel'

interface InputTextoProps {
  kind?: 'text'
  id: string
  label: string
  value: string
  onChange: (valor: string) => void
  placeholder?: string
  help?: string
  error?: string
  disabled?: boolean
  inputMode?: InputMode
  autoComplete?: string // P-5; repassado ao <input> só quando definido
}

interface InputCheckboxProps {
  kind: 'checkbox'
  label: string
  checked: boolean
  onToggle: (checked: boolean) => void
  disabled?: boolean
}

export type InputProps = InputTextoProps | InputCheckboxProps

// Input.dc.html L19. Estilo inline não alcança pseudo-elemento; o React 19 iça e deduplica
// <style> com href + precedence (uma regra por documento, não por instância).
const REGRA_PLACEHOLDER = '.dm-input::placeholder{color:var(--text-muted);opacity:1}'

const wrapper: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
  fontFamily: 'var(--font-body)',
  width: '100%',
}

function InputTexto({
  id,
  label,
  value,
  onChange,
  placeholder,
  help,
  error,
  disabled = false,
  inputMode = 'text',
  autoComplete,
}: InputTextoProps) {
  const [hover, setHover] = useState(false)
  const [foco, setFoco] = useState(false)
  const temErro = Boolean(error)
  const comHover = !disabled && hover
  const comFoco = !disabled && foco
  const mostraAjuda = !temErro && Boolean(help)
  const descricao = temErro ? `${id}-erro` : mostraAjuda ? `${id}-ajuda` : undefined

  const campo: CSSProperties = {
    width: '100%',
    boxSizing: 'border-box',
    margin: 0,
    background: disabled ? 'var(--surface-inset)' : 'var(--surface-card)',
    border: temErro
      ? '1px solid var(--danger)'
      : comHover && !comFoco
        ? '1px solid var(--border-strong)'
        : 'var(--border-card)',
    borderRadius: 'var(--radius-md)',
    padding: '12px 14px',
    fontFamily: 'var(--font-body)',
    fontSize: 'var(--fs-body)',
    lineHeight: 'var(--lh-body)',
    color: disabled ? 'var(--text-muted)' : 'var(--text-body)',
    outline: 'none',
    boxShadow: comFoco ? 'var(--focus-ring)' : 'none',
    cursor: disabled ? 'not-allowed' : 'text',
    transition: 'border-color .15s ease, box-shadow .15s ease, background .15s ease',
  }

  return (
    <div style={wrapper}>
      <style href="dm-input-placeholder" precedence="default">
        {REGRA_PLACEHOLDER}
      </style>
      <label
        htmlFor={id}
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--fs-small)',
          fontWeight: 'var(--fw-bold)',
          color: 'var(--text-title)',
          lineHeight: 'var(--lh-body)',
        }}
      >
        {label}
      </label>
      <input
        id={id}
        className="dm-input"
        type="text"
        value={value}
        placeholder={placeholder}
        inputMode={inputMode}
        autoComplete={autoComplete}
        disabled={disabled}
        aria-invalid={temErro}
        aria-describedby={descricao}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFoco(true)}
        onBlur={() => setFoco(false)}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={campo}
      />
      {temErro && (
        <span
          id={`${id}-erro`}
          role="alert"
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--fs-caption)',
            fontWeight: 'var(--fw-bold)',
            lineHeight: 'var(--lh-body)',
            color: 'var(--danger)',
          }}
        >
          {error}
        </span>
      )}
      {mostraAjuda && (
        <span
          id={`${id}-ajuda`}
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--fs-caption)',
            lineHeight: 'var(--lh-body)',
            color: 'var(--text-muted)',
          }}
        >
          {help}
        </span>
      )}
    </div>
  )
}

function InputCheckbox({ label, checked, onToggle, disabled = false }: InputCheckboxProps) {
  const [hover, setHover] = useState(false)
  const [foco, setFoco] = useState(false)
  const comHover = !disabled && hover
  const comFoco = !disabled && foco

  function alternar() {
    if (disabled) return
    onToggle(!checked)
  }

  const caixa: CSSProperties = {
    width: '22px',
    height: '22px',
    flex: '0 0 auto',
    padding: 0,
    margin: 0,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 'var(--radius-sm)',
    background: disabled ? 'var(--surface-inset)' : checked ? 'var(--action-primary)' : 'var(--surface-card)',
    border: checked && !disabled ? '1px solid var(--action-primary)' : '1px solid var(--border-strong)',
    color: disabled ? 'var(--text-muted)' : 'var(--text-on-primary)',
    fontFamily: 'var(--font-body)',
    fontSize: 'var(--fs-small)',
    fontWeight: 'var(--fw-bold)',
    lineHeight: 1,
    boxShadow: comFoco ? 'var(--focus-ring)' : comHover && !checked ? 'var(--shadow-card)' : 'none',
    outline: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'background .15s ease, box-shadow .15s ease, border-color .15s ease',
  }

  return (
    <div style={wrapper}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <button
          type="button"
          role="checkbox"
          aria-checked={checked}
          aria-label={label}
          disabled={disabled}
          onClick={alternar}
          onFocus={() => setFoco(true)}
          onBlur={() => setFoco(false)}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          style={caixa}
        >
          {checked ? '✓' : ''}
        </button>
        <span
          onClick={alternar}
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--fs-body)',
            color: disabled ? 'var(--text-muted)' : 'var(--text-body)',
            cursor: disabled ? 'not-allowed' : 'pointer',
            userSelect: 'none',
          }}
        >
          {label}
        </span>
      </div>
    </div>
  )
}

export function Input(props: InputProps) {
  return props.kind === 'checkbox' ? <InputCheckbox {...props} /> : <InputTexto {...props} />
}
