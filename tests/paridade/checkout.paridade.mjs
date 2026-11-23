// Regua de paridade E-6 -- Checkout "Finalizar pedido com CPF na nota" (testador, 2026-10-02; T10).
// Fonte: docs/superpowers/specs/2026-10-02-checkout-cpf-design.md, "## Inventario de paridade".
// Os .dc.html nao renderizam (faltam support.js/_ds_bundle.js, D6): o lado MOCKUP e a tabela MOCK abaixo,
// medida pelo harness do especificador (markup/estilos literais dos mockups sobre tokens.css, 1280x720) e
// citada no inventario. Seletor PAREADO: cada nome `m` do harness tem o seu localizador no app (localizar()).
// Uso (na raiz do projeto):  node tests/paridade/checkout.paridade.mjs
//   env PARIDADE_PORT (padrao 3100, strictPort) | env PARIDADE_OUT=<dir> salva prints CI/K-V/K-P/K-E/K-$/K-C/I
// Saida: 0 = nenhuma divergencia em linha `implementa`; 1 = divergencia (ou CPF/tel no console); 2 = erro.
// Linhas "nao verificado: hint" (inventario 68-71) e medidas "derivado" sao relatadas, sem reprovar.
// LGPD: so dados ficticios da spec (CPF de teste 123.456.789-09); o relatorio mascara qualquer CPF/telefone.
import path from 'node:path'
import { chromium } from 'playwright'
import { createServer } from 'vite'

const PORT = Number(process.env.PARIDADE_PORT || 3100)
const OUT = process.env.PARIDADE_OUT || ''
const TOL = 0.6
const RX_CPF = /\d{3}\.?\d{3}\.?\d{3}-?\d{2}/
const RX_CPF_G = /\d{3}\.?\d{3}\.?\d{3}-?\d{2}/g
const C = {
  primary: 'rgb(166, 43, 31)', primaryHover: 'rgb(140, 35, 24)', danger: 'rgb(192, 57, 43)',
  soft: 'rgb(227, 208, 175)', strong: 'rgb(160, 141, 126)', title: 'rgb(46, 33, 27)', body: 'rgb(74, 58, 48)',
  muted: 'rgb(107, 90, 78)', card: 'rgb(255, 253, 248)', inset: 'rgb(239, 225, 200)', onPrimary: 'rgb(251, 246, 235)',
  manj700: 'rgb(51, 88, 43)', successBg: 'rgb(222, 234, 216)', molho100: 'rgb(246, 220, 215)', page: 'rgb(246, 237, 220)',
}
const FOCUS_RING = 'rgb(246, 220, 215) 0px 0px 0px 3px, rgb(192, 57, 43) 0px 0px 0px 5px'

const results = []
function chk(linha, estado, desc, actual, expected, tipo = 'implementa') {
  let ok
  if (typeof expected === 'number') ok = Math.abs(parseFloat(actual) - expected) <= TOL
  else if (expected instanceof RegExp) ok = expected.test(String(actual))
  else if (typeof expected === 'function') ok = !!expected(actual)
  else ok = String(actual) === String(expected)
  const exp = typeof expected === 'function' ? expected.toString().replace(/\s+/g, ' ') : String(expected)
  results.push({ linha, estado, desc, actual: String(actual), expected: exp, tipo, ok })
}
const esconde = (s) => String(s).replace(RX_CPF_G, '***CPF/tel***')

// Mockup medido pelo harness do especificador (2026-10-02; spec "Metodo de medicao"), copiado literal.
// [m, x, y, w, h, fonte, font-size, line-height, peso, cor, fundo, borda-topo, sombra]
const MOCK = {
  'K-V': [
    ["wrap",0,0,1280,720,"Karla","16px","24px","400","rgb(74, 58, 48)","rgb(246, 237, 220)","0px rgb(74, 58, 48)","none"],
    ["header",0,0,1280,81.6,"Karla","16px","24px","400","rgb(74, 58, 48)","rgb(166, 43, 31)","0px rgb(74, 58, 48)","none"],
    ["header-in",40,24,1200,33.6,"Karla","16px","24px","400","rgb(74, 58, 48)","rgba(0, 0, 0, 0)","0px rgb(74, 58, 48)","none"],
    ["wordmark",40,24,296.8,33.6,"\"Young Serif\"","28px","33.6px","400","rgb(251, 246, 235)","rgba(0, 0, 0, 0)","0px rgb(251, 246, 235)","none"],
    ["tagline",929.5,35,310.5,21,"Karla","14px","21px","400","rgb(246, 220, 215)","rgba(0, 0, 0, 0)","0px rgb(246, 220, 215)","none"],
    ["main",40,81.6,1200,463.6,"Karla","16px","24px","400","rgb(74, 58, 48)","rgba(0, 0, 0, 0)","0px rgb(74, 58, 48)","none"],
    ["voltar-wrap",72,105.6,1136,34,"Karla","16px","24px","400","rgb(74, 58, 48)","rgba(0, 0, 0, 0)","0px rgb(74, 58, 48)","none"],
    ["voltar",72,105.6,169,34,"Karla","14px","14px","700","rgb(166, 43, 31)","rgba(0, 0, 0, 0)","0px rgb(166, 43, 31)","rgb(166, 43, 31) 0px 0px 0px 2px inset"],
    ["grid",72,159.6,1136,345.6,"Karla","16px","24px","400","rgb(74, 58, 48)","rgba(0, 0, 0, 0)","0px rgb(74, 58, 48)","none"],
    ["form-card",72,159.6,784,340.6,"Karla","16px","24px","400","rgb(74, 58, 48)","rgb(255, 253, 248)","1px rgb(227, 208, 175)","rgba(46, 33, 27, 0.06) 0px 1px 2px 0px, rgba(46, 33, 27, 0.08) 0px 4px 12px 0px"],
    ["titulo",105,192.6,718,33.6,"\"Young Serif\"","28px","33.6px","400","rgb(46, 33, 27)","rgba(0, 0, 0, 0)","0px rgb(46, 33, 27)","none"],
    ["form-grid",105,250.2,718,217,"Karla","16px","24px","400","rgb(74, 58, 48)","rgba(0, 0, 0, 0)","0px rgb(74, 58, 48)","none"],
    ["in-nome",105,250.2,347,77,"Karla","16px","24px","400","rgb(74, 58, 48)","rgba(0, 0, 0, 0)","0px rgb(74, 58, 48)","none"],
    ["in-nome-label",105,250.2,347,21,"Karla","14px","21px","700","rgb(46, 33, 27)","rgba(0, 0, 0, 0)","0px rgb(46, 33, 27)","none"],
    ["in-nome-field",105,277.2,347,50,"Karla","16px","24px","400","rgb(74, 58, 48)","rgb(255, 253, 248)","1px rgb(227, 208, 175)","none"],
    ["in-telefone",476,250.2,347,101,"Karla","16px","24px","400","rgb(74, 58, 48)","rgba(0, 0, 0, 0)","0px rgb(74, 58, 48)","none"],
    ["in-telefone-label",476,250.2,347,21,"Karla","14px","21px","700","rgb(46, 33, 27)","rgba(0, 0, 0, 0)","0px rgb(46, 33, 27)","none"],
    ["in-telefone-field",476,277.2,347,50,"Karla","16px","24px","400","rgb(74, 58, 48)","rgb(255, 253, 248)","1px rgb(227, 208, 175)","none"],
    ["in-telefone-help",476,333.2,347,18,"Karla","12px","18px","400","rgb(107, 90, 78)","rgba(0, 0, 0, 0)","0px rgb(107, 90, 78)","none"],
    ["cb-cell",105,371.2,718,24,"Karla","16px","24px","400","rgb(74, 58, 48)","rgba(0, 0, 0, 0)","0px rgb(74, 58, 48)","none"],
    ["cb",105,371.2,718,24,"Karla","16px","24px","400","rgb(74, 58, 48)","rgba(0, 0, 0, 0)","0px rgb(74, 58, 48)","none"],
    ["cb-row",105,371.2,718,24,"Karla","16px","24px","400","rgb(74, 58, 48)","rgba(0, 0, 0, 0)","0px rgb(74, 58, 48)","none"],
    ["cb-box",105,372.2,22,22,"Karla","14px","14px","700","rgb(251, 246, 235)","rgb(255, 253, 248)","1px rgb(160, 141, 126)","none"],
    ["cb-label",137,371.2,133,24,"Karla","16px","24px","400","rgb(74, 58, 48)","rgba(0, 0, 0, 0)","0px rgb(74, 58, 48)","none"],
    ["confirmar-wrap",105,423.2,718,44,"Karla","16px","24px","400","rgb(74, 58, 48)","rgba(0, 0, 0, 0)","0px rgb(74, 58, 48)","none"],
    ["confirmar",105,423.2,718,44,"Karla","16px","16px","700","rgb(251, 246, 235)","rgb(166, 43, 31)","0px rgb(251, 246, 235)","none"],
    ["aside",888,159.6,320,345.6,"Karla","16px","24px","400","rgb(74, 58, 48)","rgba(0, 0, 0, 0)","0px rgb(74, 58, 48)","none"],
    ["aside-card",888,159.6,320,345.6,"Karla","16px","24px","400","rgb(74, 58, 48)","rgb(255, 253, 248)","1px rgb(227, 208, 175)","rgba(46, 33, 27, 0.06) 0px 1px 2px 0px, rgba(46, 33, 27, 0.08) 0px 4px 12px 0px"],
    ["aside-col",913,184.6,270,295.6,"Karla","16px","24px","400","rgb(74, 58, 48)","rgba(0, 0, 0, 0)","0px rgb(74, 58, 48)","none"],
    ["aside-head",913,184.6,270,25,"Karla","16px","24px","400","rgb(74, 58, 48)","rgba(0, 0, 0, 0)","0px rgb(74, 58, 48)","none"],
    ["aside-titulo",913,184.6,107.8,24,"\"Young Serif\"","20px","24px","400","rgb(46, 33, 27)","rgba(0, 0, 0, 0)","0px rgb(46, 33, 27)","none"],
    ["alterar",1088.6,188.6,94.4,21,"Karla","14px","21px","700","rgb(166, 43, 31)","rgba(0, 0, 0, 0)","0px rgb(166, 43, 31)","none"],
    ["aside-itens",913,229.6,270,126,"Karla","16px","24px","400","rgb(74, 58, 48)","rgba(0, 0, 0, 0)","0px rgb(74, 58, 48)","none"],
    ["aitem0",913,229.6,270,57,"Karla","16px","24px","400","rgb(74, 58, 48)","rgba(0, 0, 0, 0)","0px rgb(74, 58, 48)","none"],
    ["aitem0-nome",913,229.6,188.3,24,"\"Young Serif\"","16px","24px","400","rgb(46, 33, 27)","rgba(0, 0, 0, 0)","0px rgb(46, 33, 27)","none"],
    ["aitem0-sub",913,255.6,188.3,18,"Karla","12px","18px","400","rgb(107, 90, 78)","rgba(0, 0, 0, 0)","0px rgb(107, 90, 78)","none"],
    ["aitem0-total",1113.3,229.6,69.7,24,"\"Young Serif\"","16px","24px","400","rgb(46, 33, 27)","rgba(0, 0, 0, 0)","0px rgb(46, 33, 27)","none"],
    ["aitem1",913,298.6,270,57,"Karla","16px","24px","400","rgb(74, 58, 48)","rgba(0, 0, 0, 0)","0px rgb(74, 58, 48)","none"],
    ["aitem1-nome",913,298.6,186.6,24,"\"Young Serif\"","16px","24px","400","rgb(46, 33, 27)","rgba(0, 0, 0, 0)","0px rgb(46, 33, 27)","none"],
    ["aitem1-sub",913,324.6,186.6,18,"Karla","12px","18px","400","rgb(107, 90, 78)","rgba(0, 0, 0, 0)","0px rgb(107, 90, 78)","none"],
    ["aitem1-total",1111.6,298.6,71.4,24,"\"Young Serif\"","16px","24px","400","rgb(46, 33, 27)","rgba(0, 0, 0, 0)","0px rgb(46, 33, 27)","none"],
    ["aside-valores",913,375.6,270,104.6,"Karla","16px","24px","400","rgb(74, 58, 48)","rgba(0, 0, 0, 0)","0px rgb(74, 58, 48)","none"],
    ["subtotal",913,375.6,270,21,"Karla","14px","21px","400","rgb(74, 58, 48)","rgba(0, 0, 0, 0)","0px rgb(74, 58, 48)","none"],
    ["entrega",913,404.6,270,21,"Karla","14px","21px","400","rgb(74, 58, 48)","rgba(0, 0, 0, 0)","0px rgb(74, 58, 48)","none"],
    ["entrega-val",1142.3,404.6,40.7,21,"Karla","14px","21px","700","rgb(51, 88, 43)","rgba(0, 0, 0, 0)","0px rgb(51, 88, 43)","none"],
    ["atotal",913,433.6,270,46.6,"Karla","16px","24px","400","rgb(74, 58, 48)","rgba(0, 0, 0, 0)","1px rgb(227, 208, 175)","none"],
    ["atotal-rot",913,457.6,43.7,21,"Karla","14px","21px","700","rgb(107, 90, 78)","rgba(0, 0, 0, 0)","0px rgb(107, 90, 78)","none"],
    ["atotal-val",1049,446.6,134,33.6,"\"Young Serif\"","28px","33.6px","400","rgb(46, 33, 27)","rgba(0, 0, 0, 0)","0px rgb(46, 33, 27)","none"],
  ],
  'K-P': [
    ["wrap",0,0,1280,720,"Karla","16px","24px","400","rgb(74, 58, 48)","rgb(246, 237, 220)","0px rgb(74, 58, 48)","none"],
    ["header",0,0,1280,81.6,"Karla","16px","24px","400","rgb(74, 58, 48)","rgb(166, 43, 31)","0px rgb(74, 58, 48)","none"],
    ["header-in",40,24,1200,33.6,"Karla","16px","24px","400","rgb(74, 58, 48)","rgba(0, 0, 0, 0)","0px rgb(74, 58, 48)","none"],
    ["wordmark",40,24,296.8,33.6,"\"Young Serif\"","28px","33.6px","400","rgb(251, 246, 235)","rgba(0, 0, 0, 0)","0px rgb(251, 246, 235)","none"],
    ["tagline",929.5,35,310.5,21,"Karla","14px","21px","400","rgb(246, 220, 215)","rgba(0, 0, 0, 0)","0px rgb(246, 220, 215)","none"],
    ["main",40,81.6,1200,579.6,"Karla","16px","24px","400","rgb(74, 58, 48)","rgba(0, 0, 0, 0)","0px rgb(74, 58, 48)","none"],
    ["voltar-wrap",72,105.6,1136,34,"Karla","16px","24px","400","rgb(74, 58, 48)","rgba(0, 0, 0, 0)","0px rgb(74, 58, 48)","none"],
    ["voltar",72,105.6,169,34,"Karla","14px","14px","700","rgb(166, 43, 31)","rgba(0, 0, 0, 0)","0px rgb(166, 43, 31)","rgb(166, 43, 31) 0px 0px 0px 2px inset"],
    ["grid",72,159.6,1136,461.6,"Karla","16px","24px","400","rgb(74, 58, 48)","rgba(0, 0, 0, 0)","0px rgb(74, 58, 48)","none"],
    ["form-card",72,159.6,784,461.6,"Karla","16px","24px","400","rgb(74, 58, 48)","rgb(255, 253, 248)","1px rgb(227, 208, 175)","rgba(46, 33, 27, 0.06) 0px 1px 2px 0px, rgba(46, 33, 27, 0.08) 0px 4px 12px 0px"],
    ["titulo",105,192.6,718,33.6,"\"Young Serif\"","28px","33.6px","400","rgb(46, 33, 27)","rgba(0, 0, 0, 0)","0px rgb(46, 33, 27)","none"],
    ["form-grid",105,250.2,718,338,"Karla","16px","24px","400","rgb(74, 58, 48)","rgba(0, 0, 0, 0)","0px rgb(74, 58, 48)","none"],
    ["in-nome",105,250.2,347,77,"Karla","16px","24px","400","rgb(74, 58, 48)","rgba(0, 0, 0, 0)","0px rgb(74, 58, 48)","none"],
    ["in-nome-label",105,250.2,347,21,"Karla","14px","21px","700","rgb(46, 33, 27)","rgba(0, 0, 0, 0)","0px rgb(46, 33, 27)","none"],
    ["in-nome-field",105,277.2,347,50,"Karla","16px","24px","400","rgb(74, 58, 48)","rgb(255, 253, 248)","1px rgb(227, 208, 175)","none"],
    ["in-telefone",476,250.2,347,101,"Karla","16px","24px","400","rgb(74, 58, 48)","rgba(0, 0, 0, 0)","0px rgb(74, 58, 48)","none"],
    ["in-telefone-label",476,250.2,347,21,"Karla","14px","21px","700","rgb(46, 33, 27)","rgba(0, 0, 0, 0)","0px rgb(46, 33, 27)","none"],
    ["in-telefone-field",476,277.2,347,50,"Karla","16px","24px","400","rgb(74, 58, 48)","rgb(255, 253, 248)","1px rgb(227, 208, 175)","none"],
    ["in-telefone-help",476,333.2,347,18,"Karla","12px","18px","400","rgb(107, 90, 78)","rgba(0, 0, 0, 0)","0px rgb(107, 90, 78)","none"],
    ["cb-cell",105,371.2,718,24,"Karla","16px","24px","400","rgb(74, 58, 48)","rgba(0, 0, 0, 0)","0px rgb(74, 58, 48)","none"],
    ["cb",105,371.2,718,24,"Karla","16px","24px","400","rgb(74, 58, 48)","rgba(0, 0, 0, 0)","0px rgb(74, 58, 48)","none"],
    ["cb-row",105,371.2,718,24,"Karla","16px","24px","400","rgb(74, 58, 48)","rgba(0, 0, 0, 0)","0px rgb(74, 58, 48)","none"],
    ["cb-box",105,372.2,22,22,"Karla","14px","14px","700","rgb(251, 246, 235)","rgb(166, 43, 31)","1px rgb(166, 43, 31)","none"],
    ["cb-label",137,371.2,133,24,"Karla","16px","24px","400","rgb(74, 58, 48)","rgba(0, 0, 0, 0)","0px rgb(74, 58, 48)","none"],
    ["in-cpf",105,415.2,347,101,"Karla","16px","24px","400","rgb(74, 58, 48)","rgba(0, 0, 0, 0)","0px rgb(74, 58, 48)","none"],
    ["in-cpf-label",105,415.2,347,21,"Karla","14px","21px","700","rgb(46, 33, 27)","rgba(0, 0, 0, 0)","0px rgb(46, 33, 27)","none"],
    ["in-cpf-field",105,442.2,347,50,"Karla","16px","24px","400","rgb(74, 58, 48)","rgb(255, 253, 248)","1px rgb(227, 208, 175)","none"],
    ["in-cpf-help",105,498.2,347,18,"Karla","12px","18px","400","rgb(107, 90, 78)","rgba(0, 0, 0, 0)","0px rgb(107, 90, 78)","none"],
    ["confirmar-wrap",105,544.2,718,44,"Karla","16px","24px","400","rgb(74, 58, 48)","rgba(0, 0, 0, 0)","0px rgb(74, 58, 48)","none"],
    ["confirmar",105,544.2,718,44,"Karla","16px","16px","700","rgb(251, 246, 235)","rgb(166, 43, 31)","0px rgb(251, 246, 235)","none"],
    ["aside",888,159.6,320,345.6,"Karla","16px","24px","400","rgb(74, 58, 48)","rgba(0, 0, 0, 0)","0px rgb(74, 58, 48)","none"],
    ["aside-card",888,159.6,320,345.6,"Karla","16px","24px","400","rgb(74, 58, 48)","rgb(255, 253, 248)","1px rgb(227, 208, 175)","rgba(46, 33, 27, 0.06) 0px 1px 2px 0px, rgba(46, 33, 27, 0.08) 0px 4px 12px 0px"],
    ["aside-col",913,184.6,270,295.6,"Karla","16px","24px","400","rgb(74, 58, 48)","rgba(0, 0, 0, 0)","0px rgb(74, 58, 48)","none"],
    ["aside-head",913,184.6,270,25,"Karla","16px","24px","400","rgb(74, 58, 48)","rgba(0, 0, 0, 0)","0px rgb(74, 58, 48)","none"],
    ["aside-titulo",913,184.6,107.8,24,"\"Young Serif\"","20px","24px","400","rgb(46, 33, 27)","rgba(0, 0, 0, 0)","0px rgb(46, 33, 27)","none"],
    ["alterar",1088.6,188.6,94.4,21,"Karla","14px","21px","700","rgb(166, 43, 31)","rgba(0, 0, 0, 0)","0px rgb(166, 43, 31)","none"],
    ["aside-itens",913,229.6,270,126,"Karla","16px","24px","400","rgb(74, 58, 48)","rgba(0, 0, 0, 0)","0px rgb(74, 58, 48)","none"],
    ["aitem0",913,229.6,270,57,"Karla","16px","24px","400","rgb(74, 58, 48)","rgba(0, 0, 0, 0)","0px rgb(74, 58, 48)","none"],
    ["aitem0-nome",913,229.6,188.3,24,"\"Young Serif\"","16px","24px","400","rgb(46, 33, 27)","rgba(0, 0, 0, 0)","0px rgb(46, 33, 27)","none"],
    ["aitem0-sub",913,255.6,188.3,18,"Karla","12px","18px","400","rgb(107, 90, 78)","rgba(0, 0, 0, 0)","0px rgb(107, 90, 78)","none"],
    ["aitem0-total",1113.3,229.6,69.7,24,"\"Young Serif\"","16px","24px","400","rgb(46, 33, 27)","rgba(0, 0, 0, 0)","0px rgb(46, 33, 27)","none"],
    ["aitem1",913,298.6,270,57,"Karla","16px","24px","400","rgb(74, 58, 48)","rgba(0, 0, 0, 0)","0px rgb(74, 58, 48)","none"],
    ["aitem1-nome",913,298.6,186.6,24,"\"Young Serif\"","16px","24px","400","rgb(46, 33, 27)","rgba(0, 0, 0, 0)","0px rgb(46, 33, 27)","none"],
    ["aitem1-sub",913,324.6,186.6,18,"Karla","12px","18px","400","rgb(107, 90, 78)","rgba(0, 0, 0, 0)","0px rgb(107, 90, 78)","none"],
    ["aitem1-total",1111.6,298.6,71.4,24,"\"Young Serif\"","16px","24px","400","rgb(46, 33, 27)","rgba(0, 0, 0, 0)","0px rgb(46, 33, 27)","none"],
    ["aside-valores",913,375.6,270,104.6,"Karla","16px","24px","400","rgb(74, 58, 48)","rgba(0, 0, 0, 0)","0px rgb(74, 58, 48)","none"],
    ["subtotal",913,375.6,270,21,"Karla","14px","21px","400","rgb(74, 58, 48)","rgba(0, 0, 0, 0)","0px rgb(74, 58, 48)","none"],
    ["entrega",913,404.6,270,21,"Karla","14px","21px","400","rgb(74, 58, 48)","rgba(0, 0, 0, 0)","0px rgb(74, 58, 48)","none"],
    ["entrega-val",1142.3,404.6,40.7,21,"Karla","14px","21px","700","rgb(51, 88, 43)","rgba(0, 0, 0, 0)","0px rgb(51, 88, 43)","none"],
    ["atotal",913,433.6,270,46.6,"Karla","16px","24px","400","rgb(74, 58, 48)","rgba(0, 0, 0, 0)","1px rgb(227, 208, 175)","none"],
    ["atotal-rot",913,457.6,43.7,21,"Karla","14px","21px","700","rgb(107, 90, 78)","rgba(0, 0, 0, 0)","0px rgb(107, 90, 78)","none"],
    ["atotal-val",1049,446.6,134,33.6,"\"Young Serif\"","28px","33.6px","400","rgb(46, 33, 27)","rgba(0, 0, 0, 0)","0px rgb(46, 33, 27)","none"],
  ],
  'K-E': [
    ["wrap",0,0,1280,720,"Karla","16px","24px","400","rgb(74, 58, 48)","rgb(246, 237, 220)","0px rgb(74, 58, 48)","none"],
    ["header",0,0,1280,81.6,"Karla","16px","24px","400","rgb(74, 58, 48)","rgb(166, 43, 31)","0px rgb(74, 58, 48)","none"],
    ["header-in",40,24,1200,33.6,"Karla","16px","24px","400","rgb(74, 58, 48)","rgba(0, 0, 0, 0)","0px rgb(74, 58, 48)","none"],
    ["wordmark",40,24,296.8,33.6,"\"Young Serif\"","28px","33.6px","400","rgb(251, 246, 235)","rgba(0, 0, 0, 0)","0px rgb(251, 246, 235)","none"],
    ["tagline",929.5,35,310.5,21,"Karla","14px","21px","400","rgb(246, 220, 215)","rgba(0, 0, 0, 0)","0px rgb(246, 220, 215)","none"],
    ["main",40,81.6,1200,579.6,"Karla","16px","24px","400","rgb(74, 58, 48)","rgba(0, 0, 0, 0)","0px rgb(74, 58, 48)","none"],
    ["voltar-wrap",72,105.6,1136,34,"Karla","16px","24px","400","rgb(74, 58, 48)","rgba(0, 0, 0, 0)","0px rgb(74, 58, 48)","none"],
    ["voltar",72,105.6,169,34,"Karla","14px","14px","700","rgb(166, 43, 31)","rgba(0, 0, 0, 0)","0px rgb(166, 43, 31)","rgb(166, 43, 31) 0px 0px 0px 2px inset"],
    ["grid",72,159.6,1136,461.6,"Karla","16px","24px","400","rgb(74, 58, 48)","rgba(0, 0, 0, 0)","0px rgb(74, 58, 48)","none"],
    ["form-card",72,159.6,784,461.6,"Karla","16px","24px","400","rgb(74, 58, 48)","rgb(255, 253, 248)","1px rgb(227, 208, 175)","rgba(46, 33, 27, 0.06) 0px 1px 2px 0px, rgba(46, 33, 27, 0.08) 0px 4px 12px 0px"],
    ["titulo",105,192.6,718,33.6,"\"Young Serif\"","28px","33.6px","400","rgb(46, 33, 27)","rgba(0, 0, 0, 0)","0px rgb(46, 33, 27)","none"],
    ["form-grid",105,250.2,718,338,"Karla","16px","24px","400","rgb(74, 58, 48)","rgba(0, 0, 0, 0)","0px rgb(74, 58, 48)","none"],
    ["in-nome",105,250.2,347,101,"Karla","16px","24px","400","rgb(74, 58, 48)","rgba(0, 0, 0, 0)","0px rgb(74, 58, 48)","none"],
    ["in-nome-label",105,250.2,347,21,"Karla","14px","21px","700","rgb(46, 33, 27)","rgba(0, 0, 0, 0)","0px rgb(46, 33, 27)","none"],
    ["in-nome-field",105,277.2,347,50,"Karla","16px","24px","400","rgb(74, 58, 48)","rgb(255, 253, 248)","1px rgb(192, 57, 43)","none"],
    ["in-nome-erro",105,333.2,347,18,"Karla","12px","18px","700","rgb(192, 57, 43)","rgba(0, 0, 0, 0)","0px rgb(192, 57, 43)","none"],
    ["in-telefone",476,250.2,347,101,"Karla","16px","24px","400","rgb(74, 58, 48)","rgba(0, 0, 0, 0)","0px rgb(74, 58, 48)","none"],
    ["in-telefone-label",476,250.2,347,21,"Karla","14px","21px","700","rgb(46, 33, 27)","rgba(0, 0, 0, 0)","0px rgb(46, 33, 27)","none"],
    ["in-telefone-field",476,277.2,347,50,"Karla","16px","24px","400","rgb(74, 58, 48)","rgb(255, 253, 248)","1px rgb(192, 57, 43)","none"],
    ["in-telefone-erro",476,333.2,347,18,"Karla","12px","18px","700","rgb(192, 57, 43)","rgba(0, 0, 0, 0)","0px rgb(192, 57, 43)","none"],
    ["cb-cell",105,371.2,718,24,"Karla","16px","24px","400","rgb(74, 58, 48)","rgba(0, 0, 0, 0)","0px rgb(74, 58, 48)","none"],
    ["cb",105,371.2,718,24,"Karla","16px","24px","400","rgb(74, 58, 48)","rgba(0, 0, 0, 0)","0px rgb(74, 58, 48)","none"],
    ["cb-row",105,371.2,718,24,"Karla","16px","24px","400","rgb(74, 58, 48)","rgba(0, 0, 0, 0)","0px rgb(74, 58, 48)","none"],
    ["cb-box",105,372.2,22,22,"Karla","14px","14px","700","rgb(251, 246, 235)","rgb(166, 43, 31)","1px rgb(166, 43, 31)","none"],
    ["cb-label",137,371.2,133,24,"Karla","16px","24px","400","rgb(74, 58, 48)","rgba(0, 0, 0, 0)","0px rgb(74, 58, 48)","none"],
    ["in-cpf",105,415.2,347,101,"Karla","16px","24px","400","rgb(74, 58, 48)","rgba(0, 0, 0, 0)","0px rgb(74, 58, 48)","none"],
    ["in-cpf-label",105,415.2,347,21,"Karla","14px","21px","700","rgb(46, 33, 27)","rgba(0, 0, 0, 0)","0px rgb(46, 33, 27)","none"],
    ["in-cpf-field",105,442.2,347,50,"Karla","16px","24px","400","rgb(74, 58, 48)","rgb(255, 253, 248)","1px rgb(192, 57, 43)","none"],
    ["in-cpf-erro",105,498.2,347,18,"Karla","12px","18px","700","rgb(192, 57, 43)","rgba(0, 0, 0, 0)","0px rgb(192, 57, 43)","none"],
    ["confirmar-wrap",105,544.2,718,44,"Karla","16px","24px","400","rgb(74, 58, 48)","rgba(0, 0, 0, 0)","0px rgb(74, 58, 48)","none"],
    ["confirmar",105,544.2,718,44,"Karla","16px","16px","700","rgb(251, 246, 235)","rgb(166, 43, 31)","0px rgb(251, 246, 235)","none"],
    ["aside",888,159.6,320,345.6,"Karla","16px","24px","400","rgb(74, 58, 48)","rgba(0, 0, 0, 0)","0px rgb(74, 58, 48)","none"],
    ["aside-card",888,159.6,320,345.6,"Karla","16px","24px","400","rgb(74, 58, 48)","rgb(255, 253, 248)","1px rgb(227, 208, 175)","rgba(46, 33, 27, 0.06) 0px 1px 2px 0px, rgba(46, 33, 27, 0.08) 0px 4px 12px 0px"],
    ["aside-col",913,184.6,270,295.6,"Karla","16px","24px","400","rgb(74, 58, 48)","rgba(0, 0, 0, 0)","0px rgb(74, 58, 48)","none"],
    ["aside-head",913,184.6,270,25,"Karla","16px","24px","400","rgb(74, 58, 48)","rgba(0, 0, 0, 0)","0px rgb(74, 58, 48)","none"],
    ["aside-titulo",913,184.6,107.8,24,"\"Young Serif\"","20px","24px","400","rgb(46, 33, 27)","rgba(0, 0, 0, 0)","0px rgb(46, 33, 27)","none"],
    ["alterar",1088.6,188.6,94.4,21,"Karla","14px","21px","700","rgb(166, 43, 31)","rgba(0, 0, 0, 0)","0px rgb(166, 43, 31)","none"],
    ["aside-itens",913,229.6,270,126,"Karla","16px","24px","400","rgb(74, 58, 48)","rgba(0, 0, 0, 0)","0px rgb(74, 58, 48)","none"],
    ["aitem0",913,229.6,270,57,"Karla","16px","24px","400","rgb(74, 58, 48)","rgba(0, 0, 0, 0)","0px rgb(74, 58, 48)","none"],
    ["aitem0-nome",913,229.6,188.3,24,"\"Young Serif\"","16px","24px","400","rgb(46, 33, 27)","rgba(0, 0, 0, 0)","0px rgb(46, 33, 27)","none"],
    ["aitem0-sub",913,255.6,188.3,18,"Karla","12px","18px","400","rgb(107, 90, 78)","rgba(0, 0, 0, 0)","0px rgb(107, 90, 78)","none"],
    ["aitem0-total",1113.3,229.6,69.7,24,"\"Young Serif\"","16px","24px","400","rgb(46, 33, 27)","rgba(0, 0, 0, 0)","0px rgb(46, 33, 27)","none"],
    ["aitem1",913,298.6,270,57,"Karla","16px","24px","400","rgb(74, 58, 48)","rgba(0, 0, 0, 0)","0px rgb(74, 58, 48)","none"],
    ["aitem1-nome",913,298.6,186.6,24,"\"Young Serif\"","16px","24px","400","rgb(46, 33, 27)","rgba(0, 0, 0, 0)","0px rgb(46, 33, 27)","none"],
    ["aitem1-sub",913,324.6,186.6,18,"Karla","12px","18px","400","rgb(107, 90, 78)","rgba(0, 0, 0, 0)","0px rgb(107, 90, 78)","none"],
    ["aitem1-total",1111.6,298.6,71.4,24,"\"Young Serif\"","16px","24px","400","rgb(46, 33, 27)","rgba(0, 0, 0, 0)","0px rgb(46, 33, 27)","none"],
    ["aside-valores",913,375.6,270,104.6,"Karla","16px","24px","400","rgb(74, 58, 48)","rgba(0, 0, 0, 0)","0px rgb(74, 58, 48)","none"],
    ["subtotal",913,375.6,270,21,"Karla","14px","21px","400","rgb(74, 58, 48)","rgba(0, 0, 0, 0)","0px rgb(74, 58, 48)","none"],
    ["entrega",913,404.6,270,21,"Karla","14px","21px","400","rgb(74, 58, 48)","rgba(0, 0, 0, 0)","0px rgb(74, 58, 48)","none"],
    ["entrega-val",1142.3,404.6,40.7,21,"Karla","14px","21px","700","rgb(51, 88, 43)","rgba(0, 0, 0, 0)","0px rgb(51, 88, 43)","none"],
    ["atotal",913,433.6,270,46.6,"Karla","16px","24px","400","rgb(74, 58, 48)","rgba(0, 0, 0, 0)","1px rgb(227, 208, 175)","none"],
    ["atotal-rot",913,457.6,43.7,21,"Karla","14px","21px","700","rgb(107, 90, 78)","rgba(0, 0, 0, 0)","0px rgb(107, 90, 78)","none"],
    ["atotal-val",1049,446.6,134,33.6,"\"Young Serif\"","28px","33.6px","400","rgb(46, 33, 27)","rgba(0, 0, 0, 0)","0px rgb(46, 33, 27)","none"],
  ],
  'K-C': [
    ["wrap",0,0,1280,720,"Karla","16px","24px","400","rgb(74, 58, 48)","rgb(246, 237, 220)","0px rgb(74, 58, 48)","none"],
    ["header",0,0,1280,81.6,"Karla","16px","24px","400","rgb(74, 58, 48)","rgb(166, 43, 31)","0px rgb(74, 58, 48)","none"],
    ["header-in",40,24,1200,33.6,"Karla","16px","24px","400","rgb(74, 58, 48)","rgba(0, 0, 0, 0)","0px rgb(74, 58, 48)","none"],
    ["wordmark",40,24,296.8,33.6,"\"Young Serif\"","28px","33.6px","400","rgb(251, 246, 235)","rgba(0, 0, 0, 0)","0px rgb(251, 246, 235)","none"],
    ["tagline",929.5,35,310.5,21,"Karla","14px","21px","400","rgb(246, 220, 215)","rgba(0, 0, 0, 0)","0px rgb(246, 220, 215)","none"],
    ["cmain",40,81.6,1200,552,"Karla","16px","24px","400","rgb(74, 58, 48)","rgba(0, 0, 0, 0)","0px rgb(74, 58, 48)","none"],
    ["cwrap",380,113.6,520,488,"Karla","16px","24px","400","rgb(74, 58, 48)","rgba(0, 0, 0, 0)","0px rgb(74, 58, 48)","none"],
    ["ccard",380,113.6,520,488,"Karla","16px","24px","400","rgb(74, 58, 48)","rgb(255, 253, 248)","1px rgb(227, 208, 175)","rgba(46, 33, 27, 0.06) 0px 1px 2px 0px, rgba(46, 33, 27, 0.08) 0px 4px 12px 0px"],
    ["ccol",413,146.6,454,422,"Karla","16px","24px","400","rgb(74, 58, 48)","rgba(0, 0, 0, 0)","0px rgb(74, 58, 48)","none"],
    ["chead",413,146.6,454,129.4,"Karla","16px","24px","400","rgb(74, 58, 48)","rgba(0, 0, 0, 0)","0px rgb(74, 58, 48)","none"],
    ["cbadge",413,146.6,158.4,24.8,"Karla","12px","16.8px","700","rgb(51, 88, 43)","rgb(222, 234, 216)","0px rgb(51, 88, 43)","none"],
    ["ctitulo",413,183.4,369,33.6,"\"Young Serif\"","28px","33.6px","400","rgb(46, 33, 27)","rgba(0, 0, 0, 0)","0px rgb(46, 33, 27)","none"],
    ["cnum-wrap",413,229,274.8,47,"Karla","16px","24px","400","rgb(74, 58, 48)","rgba(0, 0, 0, 0)","0px rgb(74, 58, 48)","none"],
    ["cnum",413,229,274.8,21,"Karla","14px","21px","700","rgb(46, 33, 27)","rgba(0, 0, 0, 0)","0px rgb(46, 33, 27)","none"],
    ["cprazo",413,252,274.8,24,"Karla","16px","24px","400","rgb(74, 58, 48)","rgba(0, 0, 0, 0)","0px rgb(74, 58, 48)","none"],
    ["citens",413,296,454,208.6,"Karla","16px","24px","400","rgb(74, 58, 48)","rgba(0, 0, 0, 0)","1px rgb(227, 208, 175)","none"],
    ["citem0",413,313,454,44,"Karla","16px","24px","400","rgb(74, 58, 48)","rgba(0, 0, 0, 0)","0px rgb(74, 58, 48)","none"],
    ["citem0-nome",413,313,372.3,24,"\"Young Serif\"","16px","24px","400","rgb(46, 33, 27)","rgba(0, 0, 0, 0)","0px rgb(46, 33, 27)","none"],
    ["citem0-sub",413,339,372.3,18,"Karla","12px","18px","400","rgb(107, 90, 78)","rgba(0, 0, 0, 0)","0px rgb(107, 90, 78)","none"],
    ["citem0-total",797.3,313,69.7,24,"\"Young Serif\"","16px","24px","400","rgb(46, 33, 27)","rgba(0, 0, 0, 0)","0px rgb(46, 33, 27)","none"],
    ["citem1",413,369,454,44,"Karla","16px","24px","400","rgb(74, 58, 48)","rgba(0, 0, 0, 0)","0px rgb(74, 58, 48)","none"],
    ["citem1-nome",413,369,370.6,24,"\"Young Serif\"","16px","24px","400","rgb(46, 33, 27)","rgba(0, 0, 0, 0)","0px rgb(46, 33, 27)","none"],
    ["citem1-sub",413,395,370.6,18,"Karla","12px","18px","400","rgb(107, 90, 78)","rgba(0, 0, 0, 0)","0px rgb(107, 90, 78)","none"],
    ["citem1-total",795.6,369,71.4,24,"\"Young Serif\"","16px","24px","400","rgb(46, 33, 27)","rgba(0, 0, 0, 0)","0px rgb(46, 33, 27)","none"],
    ["ctotal",413,425,454,46.6,"Karla","16px","24px","400","rgb(74, 58, 48)","rgba(0, 0, 0, 0)","1px rgb(227, 208, 175)","none"],
    ["ctotal-rot",413,449,43.7,21,"Karla","14px","21px","700","rgb(107, 90, 78)","rgba(0, 0, 0, 0)","0px rgb(107, 90, 78)","none"],
    ["ctotal-val",733,438,134,33.6,"\"Young Serif\"","28px","33.6px","400","rgb(46, 33, 27)","rgba(0, 0, 0, 0)","0px rgb(46, 33, 27)","none"],
    ["ccpf",413,483.6,454,21,"Karla","14px","21px","400","rgb(107, 90, 78)","rgba(0, 0, 0, 0)","0px rgb(107, 90, 78)","none"],
    ["cinicio",413,524.6,454,44,"Karla","16px","16px","700","rgb(251, 246, 235)","rgb(166, 43, 31)","0px rgb(251, 246, 235)","none"],
  ],
  'I': [
    ["in-pnone",24,24,220,77,"Karla","16px","24px","400","rgb(74, 58, 48)","rgba(0, 0, 0, 0)","0px rgb(74, 58, 48)","none"],
    ["in-pnone-label",24,24,220,21,"Karla","14px","21px","700","rgb(46, 33, 27)","rgba(0, 0, 0, 0)","0px rgb(46, 33, 27)","none"],
    ["in-pnone-field",24,51,220,50,"Karla","16px","24px","400","rgb(74, 58, 48)","rgb(255, 253, 248)","1px rgb(227, 208, 175)","none"],
    ["in-phover",268,24,220,77,"Karla","16px","24px","400","rgb(74, 58, 48)","rgba(0, 0, 0, 0)","0px rgb(74, 58, 48)","none"],
    ["in-phover-label",268,24,220,21,"Karla","14px","21px","700","rgb(46, 33, 27)","rgba(0, 0, 0, 0)","0px rgb(46, 33, 27)","none"],
    ["in-phover-field",268,51,220,50,"Karla","16px","24px","400","rgb(74, 58, 48)","rgb(255, 253, 248)","1px rgb(160, 141, 126)","none"],
    ["in-pfocus",512,24,220,77,"Karla","16px","24px","400","rgb(74, 58, 48)","rgba(0, 0, 0, 0)","0px rgb(74, 58, 48)","none"],
    ["in-pfocus-label",512,24,220,21,"Karla","14px","21px","700","rgb(46, 33, 27)","rgba(0, 0, 0, 0)","0px rgb(46, 33, 27)","none"],
    ["in-pfocus-field",512,51,220,50,"Karla","16px","24px","400","rgb(74, 58, 48)","rgb(255, 253, 248)","1px rgb(227, 208, 175)","rgb(246, 220, 215) 0px 0px 0px 3px, rgb(192, 57, 43) 0px 0px 0px 5px"],
    ["in-perro",756,24,220,119,"Karla","16px","24px","400","rgb(74, 58, 48)","rgba(0, 0, 0, 0)","0px rgb(74, 58, 48)","none"],
    ["in-perro-label",756,24,220,21,"Karla","14px","21px","700","rgb(46, 33, 27)","rgba(0, 0, 0, 0)","0px rgb(46, 33, 27)","none"],
    ["in-perro-field",756,51,220,50,"Karla","16px","24px","400","rgb(74, 58, 48)","rgb(255, 253, 248)","1px rgb(192, 57, 43)","none"],
    ["in-perro-erro",756,107,220,36,"Karla","12px","18px","700","rgb(192, 57, 43)","rgba(0, 0, 0, 0)","0px rgb(192, 57, 43)","none"],
    ["in-pdis",1000,24,220,101,"Karla","16px","24px","400","rgb(74, 58, 48)","rgba(0, 0, 0, 0)","0px rgb(74, 58, 48)","none"],
    ["in-pdis-label",1000,24,220,21,"Karla","14px","21px","700","rgb(46, 33, 27)","rgba(0, 0, 0, 0)","0px rgb(46, 33, 27)","none"],
    ["in-pdis-field",1000,51,220,50,"Karla","16px","24px","400","rgb(107, 90, 78)","rgb(239, 225, 200)","1px rgb(227, 208, 175)","none"],
    ["in-pdis-help",1000,107,220,18,"Karla","12px","18px","400","rgb(107, 90, 78)","rgba(0, 0, 0, 0)","0px rgb(107, 90, 78)","none"],
    ["cb0",24,167,220,24,"Karla","16px","24px","400","rgb(74, 58, 48)","rgba(0, 0, 0, 0)","0px rgb(74, 58, 48)","none"],
    ["cb0-row",24,167,220,24,"Karla","16px","24px","400","rgb(74, 58, 48)","rgba(0, 0, 0, 0)","0px rgb(74, 58, 48)","none"],
    ["cb0-box",24,168,22,22,"Karla","14px","14px","700","rgb(251, 246, 235)","rgb(255, 253, 248)","1px rgb(160, 141, 126)","none"],
    ["cb0-label",56,167,133,24,"Karla","16px","24px","400","rgb(74, 58, 48)","rgba(0, 0, 0, 0)","0px rgb(74, 58, 48)","none"],
    ["cb1",24,191,220,24,"Karla","16px","24px","400","rgb(74, 58, 48)","rgba(0, 0, 0, 0)","0px rgb(74, 58, 48)","none"],
    ["cb1-row",24,191,220,24,"Karla","16px","24px","400","rgb(74, 58, 48)","rgba(0, 0, 0, 0)","0px rgb(74, 58, 48)","none"],
    ["cb1-box",24,192,22,22,"Karla","14px","14px","700","rgb(251, 246, 235)","rgb(166, 43, 31)","1px rgb(166, 43, 31)","none"],
    ["cb1-label",56,191,133,24,"Karla","16px","24px","400","rgb(74, 58, 48)","rgba(0, 0, 0, 0)","0px rgb(74, 58, 48)","none"],
    ["cb2",24,215,220,24,"Karla","16px","24px","400","rgb(74, 58, 48)","rgba(0, 0, 0, 0)","0px rgb(74, 58, 48)","none"],
    ["cb2-row",24,215,220,24,"Karla","16px","24px","400","rgb(74, 58, 48)","rgba(0, 0, 0, 0)","0px rgb(74, 58, 48)","none"],
    ["cb2-box",24,216,22,22,"Karla","14px","14px","700","rgb(107, 90, 78)","rgb(239, 225, 200)","1px rgb(160, 141, 126)","none"],
    ["cb2-label",56,215,133,24,"Karla","16px","24px","400","rgb(107, 90, 78)","rgba(0, 0, 0, 0)","0px rgb(107, 90, 78)","none"],
    ["cbh",24,239,220,24,"Karla","16px","24px","400","rgb(74, 58, 48)","rgba(0, 0, 0, 0)","0px rgb(74, 58, 48)","none"],
    ["cbh-row",24,239,220,24,"Karla","16px","24px","400","rgb(74, 58, 48)","rgba(0, 0, 0, 0)","0px rgb(74, 58, 48)","none"],
    ["cbh-box",24,240,22,22,"Karla","14px","14px","700","rgb(251, 246, 235)","rgb(255, 253, 248)","1px rgb(160, 141, 126)","rgba(46, 33, 27, 0.06) 0px 1px 2px 0px, rgba(46, 33, 27, 0.08) 0px 4px 12px 0px"],
    ["cbh-label",56,239,133,24,"Karla","16px","24px","400","rgb(74, 58, 48)","rgba(0, 0, 0, 0)","0px rgb(74, 58, 48)","none"],
    ["cbf",24,263,220,24,"Karla","16px","24px","400","rgb(74, 58, 48)","rgba(0, 0, 0, 0)","0px rgb(74, 58, 48)","none"],
    ["cbf-row",24,263,220,24,"Karla","16px","24px","400","rgb(74, 58, 48)","rgba(0, 0, 0, 0)","0px rgb(74, 58, 48)","none"],
    ["cbf-box",24,264,22,22,"Karla","14px","14px","700","rgb(251, 246, 235)","rgb(255, 253, 248)","1px rgb(160, 141, 126)","rgb(246, 220, 215) 0px 0px 0px 3px, rgb(192, 57, 43) 0px 0px 0px 5px"],
    ["cbf-label",56,263,133,24,"Karla","16px","24px","400","rgb(74, 58, 48)","rgba(0, 0, 0, 0)","0px rgb(74, 58, 48)","none"],
  ],
}

// nome do harness -> linha do inventario
function linhaDe(m) {
  const tab = [
    [/^wrap$/, 5], [/^(header|header-in|wordmark|tagline)$/, 6], [/^main$/, 7], [/^voltar/, 8], [/^grid$/, 9],
    [/^form-card$/, 10], [/^titulo$/, 11], [/^form-grid$/, 12], [/^in-nome-erro$/, 44], [/^in-nome/, 13],
    [/^in-telefone-erro$/, 46], [/^in-telefone/, 14], [/^cb/, 15], [/^in-cpf-erro$/, 47], [/^in-cpf/, 16],
    [/^confirmar/, 18], [/^aside(-card|-col)?$/, 19], [/^aside-(head|titulo)$/, 20], [/^alterar$/, 21],
    [/^(aside-itens|aitem)/, 22], [/^(aside-valores|subtotal|entrega)/, 24], [/^atotal/, 26],
    [/^(cmain|cwrap)$/, 51], [/^(ccard|ccol)$/, 52], [/^chead$/, 53], [/^cbadge$/, 54], [/^ctitulo$/, 55],
    [/^cnum/, 56], [/^cprazo$/, 57], [/^citens$/, 58], [/^citem/, 59], [/^ctotal/, 60], [/^ccpf$/, 61], [/^cinicio$/, 62],
  ]
  for (const [rx, l] of tab) if (rx.test(m)) return l
  return '?'
}
function linhaPrancha(m) {
  if (/^in-pnone/.test(m)) return /label/.test(m) ? 28 : 29
  if (/^in-phover/.test(m)) return 31
  if (/^in-pfocus/.test(m)) return 32
  if (/^in-perro/.test(m)) return 33
  if (/^in-pdis/.test(m)) return 35
  return { cb0: 37, cb1: 38, cb2: 41, cbh: 39, cbf: 40 }[m.split('-')[0]] || '?'
}

// Localizador PAREADO (roda no navegador): nome do harness -> elemento do app; devolve as mesmas medidas do harness.
function localizar(estado) {
  const E = {}
  const put = (k, el) => { if (el) E[k] = el }
  const kids = (el) => (el ? Array.from(el.children) : [])
  const campo = (pref, id) => {
    const f = document.getElementById(id)
    if (!f) return
    put(pref, f.parentElement); put(pref + '-label', document.querySelector('label[for="' + id + '"]')); put(pref + '-field', f)
    put(pref + '-erro', document.getElementById(id + '-erro')); put(pref + '-help', document.getElementById(id + '-ajuda'))
  }
  const item = (k, el) => { if (!el) return; put(k, el); const col = el.children[0]; put(k + '-nome', col && col.children[0]); put(k + '-sub', col && col.children[1]); put(k + '-total', el.children[1]) }
  const total = (k, el) => { if (!el) return; put(k, el); put(k + '-rot', el.children[0]); put(k + '-val', el.children[1]) }
  if (estado === 'I') {
    for (const id of ['pnone', 'phover', 'pfocus', 'perro', 'pdis']) campo('in-' + id, id)
    for (const k of ['cb0', 'cb1', 'cb2', 'cbh', 'cbf']) {
      const w = document.querySelector('[data-slot="' + k + '"] > div')
      const row = w && w.firstElementChild
      put(k, w); put(k + '-row', row); put(k + '-box', row && row.querySelector('[role=checkbox]')); put(k + '-label', row && row.querySelector('span'))
    }
  } else {
    put('wrap', document.querySelector('#root > div'))
    const hd = document.querySelector('header')
    put('header', hd); put('header-in', hd && hd.firstElementChild); put('wordmark', hd && hd.querySelector('button')); put('tagline', hd && hd.querySelector(':scope > div > span'))
    const main = document.querySelector('main')
    if (estado === 'K-C') {
      put('cmain', main); const cw = main && main.firstElementChild; put('cwrap', cw); const cc = cw && cw.firstElementChild; put('ccard', cc)
      const col = cc && cc.firstElementChild; put('ccol', col); const [head, itens, btn] = kids(col)
      put('chead', head); put('cbadge', head && head.querySelector(':scope > span')); put('ctitulo', head && head.querySelector('h1'))
      const nw = head && head.querySelector(':scope > div'); put('cnum-wrap', nw); put('cnum', nw && nw.children[0]); put('cprazo', nw && nw.children[1])
      put('citens', itens)
      const divs = kids(itens).filter((e) => e.tagName === 'DIV')
      divs.slice(0, -1).forEach((el, i) => item('citem' + i, el)); total('ctotal', divs[divs.length - 1])
      put('ccpf', kids(itens).find((e) => e.tagName === 'SPAN')); put('cinicio', btn && btn.tagName === 'BUTTON' ? btn : null)
    } else {
      put('main', main); const [vw, grid] = kids(main); put('voltar-wrap', vw); put('voltar', vw && vw.querySelector('button')); put('grid', grid)
      const [fc, aside] = kids(grid); put('form-card', fc); const h1 = fc && fc.querySelector('h1'); put('titulo', h1)
      const fg = h1 && h1.nextElementSibling; put('form-grid', fg)
      campo('in-nome', 'nome'); campo('in-telefone', 'telefone'); campo('in-cpf', 'cpf')
      const box = fg && fg.querySelector('[role=checkbox]'); const row = box && box.parentElement
      put('cb-box', box); put('cb-row', row); put('cb', row && row.parentElement); put('cb-cell', row && row.parentElement.parentElement); put('cb-label', row && row.querySelector('span'))
      const conf = fg && Array.from(fg.querySelectorAll('button')).find((b) => /^Confirmar pedido/.test(b.textContent))
      put('confirmar', conf); put('confirmar-wrap', conf && conf.parentElement)
      put('aside', aside); const ac = aside && aside.firstElementChild; put('aside-card', ac); const acol = ac && ac.firstElementChild; put('aside-col', acol)
      const [ahead, aitens, avals] = kids(acol)
      put('aside-head', ahead); put('aside-titulo', ahead && ahead.querySelector('h2')); put('alterar', ahead && ahead.querySelector('button'))
      put('aside-itens', aitens); kids(aitens).forEach((el, i) => item('aitem' + i, el))
      put('aside-valores', avals); const [sub, ent, tot] = kids(avals); put('subtotal', sub); put('entrega', ent); put('entrega-val', ent && ent.children[1]); total('atotal', tot)
    }
  }
  const out = {}
  for (const [k, el] of Object.entries(E)) {
    const r = el.getBoundingClientRect(); const c = getComputedStyle(el); const f = (n) => Math.round(n * 10) / 10
    out[k] = { x: f(r.x), y: f(r.y), w: f(r.width), h: f(r.height), ff: c.fontFamily.split(',')[0], fs: c.fontSize, lh: c.lineHeight, fw: c.fontWeight,
      color: c.color, bg: c.backgroundColor, bt: c.borderTopWidth + ' ' + c.borderTopColor, shadow: c.boxShadow, text: el.textContent, tag: el.tagName }
  }
  return out
}

function chkOk(linha, estado, desc, actual, expected, ok, tipo = 'implementa') {
  results.push({ linha, estado, desc, actual: String(actual), expected: String(expected), tipo, ok })
}
// compara cada elemento do harness com o seu par no app: geometria (tolerancia 0.6px) e estilo computado
function comparar(estado, app, linhaFn = linhaDe) {
  for (const [m, x, y, w, h, ff, fs, lh, fw, color, bg, bt, shadow] of MOCK[estado]) {
    const a = app[m]
    const L = linhaFn(m)
    if (!a) { chkOk(L, estado, m + ' existe no app', 'ausente', 'presente', false); continue }
    const geo = [x, y, w, h]
    const ag = [a.x, a.y, a.w, a.h]
    chkOk(L, estado, m + ' x,y,w,h', ag.join(','), geo.join(','), ag.every((v, i) => Math.abs(v - geo[i]) <= TOL))
    const est = (o) => [o.ff, o.fs + '/' + o.lh, o.fw, 'cor ' + o.color, 'fundo ' + o.bg, 'borda ' + o.bt, 'sombra ' + o.shadow].join(' | ')
    const esperado = est({ ff, fs, lh, fw, color, bg, bt, shadow })
    chkOk(L, estado, m + ' estilo', est(a), esperado, est(a) === esperado)
  }
}
async function medir(page, estado) { return page.evaluate(localizar, estado) }
async function css(page, sel, props, pseudo = null) {
  return page.evaluate(([s, ps, pse]) => {
    const el = document.querySelector(s)
    if (!el) return 'ausente'
    const c = getComputedStyle(el, pse)
    return ps.map((p) => c.getPropertyValue(p)).join(' ')
  }, [sel, props, pseudo])
}
const repousa = async (page) => {
  await page.evaluate(() => document.activeElement && document.activeElement.blur && document.activeElement.blur())
  await page.mouse.move(1275, 715)
  await page.waitForTimeout(350)
}
const foto = async (page, nome) => { if (OUT) await page.screenshot({ path: path.join(OUT, 'paridade-checkout-' + nome + '.png'), fullPage: true }) }
const alerts = (page) => page.getByRole('alert').allTextContents()
function hints(estado, app) {
  const H = 'derivado'
  if (app.voltar) chk(68, estado, 'Voltar ao cardapio vs hint 180x36 (nao verificado: hint)', app.voltar.w + 'x' + app.voltar.h, '180x36', H)
  if (app['form-card']) chk(69, estado, 'card do form altura vs hint 440 (nao verificado: hint)', app['form-card'].h, 440, H)
  if (app['aside-card']) chk(69, estado, 'card do aside altura vs hint 320 (nao verificado: hint)', app['aside-card'].h, 320, H)
  if (app.ccard) chk(69, estado, 'card da confirmacao altura vs hint 480 (nao verificado: hint)', app.ccard.h, 480, H)
  if (app['in-nome']) chk(70, estado, 'Input nome altura vs hint 78 (nao verificado: hint)', app['in-nome'].h, 78, H)
  if (app['in-telefone']) chk(70, estado, 'Input telefone altura vs hint 96 (nao verificado: hint)', app['in-telefone'].h, 96, H)
  if (app.confirmar) chk(71, estado, 'Button md altura vs hint 48 (nao verificado: hint)', app.confirmar.h, 48, H)
  if (app.cbadge) chk(71, estado, 'Badge altura vs hint 22 (nao verificado: hint)', app.cbadge.h, 22, H)
}

// CI -- Cardapio com Margherita M + Calabresa G (linhas 1-3 resolvem F1 41-43)
async function medirCI(page) {
  const r = await page.evaluate(() => {
    const card = document.querySelector('aside > div')
    const k = Array.from(card.children)
    const g = (el) => { const b = el.getBoundingClientRect(); const c = getComputedStyle(el); return { tag: el.tagName, text: el.textContent, y: b.y, bottom: b.bottom, w: b.width, h: b.height, bg: c.backgroundColor, fs: c.fontSize, lh: c.lineHeight, color: c.color, ta: c.textAlign, ff: c.fontFamily.split(',')[0] } }
    return { n: k.length, kids: k.map(g), card: g(card) }
  })
  chk(3, 'CI', 'aside card: 6 blocos', r.n, 6)
  chk(3, 'CI', 'ordem cabecalho > itens > somas > aviso > botao > frase', r.kids.map((x) => x.tag).join(' '), 'DIV DIV DIV DIV BUTTON SPAN')
  const [, , , av, bt, fr] = r.kids
  if (bt && fr && av) {
    chk(1, 'CI', 'botao copy/fundo primary', bt.text + ' | ' + bt.bg, 'Finalizar pedido | ' + C.primary)
    chk(1, 'CI', 'botao largura 290 (fullWidth)', bt.w, 290)
    chk(1, 'CI', 'botao altura 44 (derivado do ui/Button md)', bt.h, 44)
    chk(1, 'CI', 'gap 20 aviso -> botao', bt.y - av.bottom, 20)
    chk(2, 'CI', 'frase copy', fr.text, 'Sai do forno e chega quentinha em uns 40 minutos.')
    chk(2, 'CI', 'frase Karla 12px lh 18px --text-muted centro', [fr.ff, fr.fs, fr.lh, fr.color, fr.ta].join(' '), ['Karla', '12px', '18px', C.muted, 'center'].join(' '))
    chk(2, 'CI', 'gap 20 botao -> frase', fr.y - bt.bottom, 20)
  }
  chk(3, 'CI', 'card do aside altura (derivado 633.6)', r.card.h, 633.6, 'derivado')
}

async function extrasForm(page, E, app) {
  chk(11, E, 'titulo copy', app.titulo && app.titulo.text, 'Quase lá — falta só a gente saber quem é você')
  chk(8, E, 'voltar copy/tag', app.voltar && app.voltar.tag + ' ' + app.voltar.text, 'BUTTON ← Voltar ao cardápio')
  chk(13, E, 'nome: label/placeholder/sem ajuda', await page.evaluate(() => { const f = document.getElementById('nome'); return [document.querySelector('label[for=nome]').textContent, f.placeholder, !!document.getElementById('nome-ajuda')].join(' | ') }), 'Seu nome | Como a gente te chama? | false')
  chk(14, E, 'telefone: label/placeholder/inputmode', await page.evaluate(() => { const f = document.getElementById('telefone'); return [document.querySelector('label[for=telefone]').textContent, f.placeholder, f.inputMode].join(' | ') }), 'Telefone (com DDD) | (11) 98765-4321 | tel')
  chk(15, E, 'checkbox: role/aria-label/rotulo/linha inteira', await page.evaluate(() => { const b = document.querySelector('[role=checkbox]'); return [b.tagName, b.getAttribute('aria-label'), b.nextElementSibling.textContent, getComputedStyle(b.closest('[style*="grid-column"]')).gridColumnStart + '/' + getComputedStyle(b.closest('[style*="grid-column"]')).gridColumnEnd].join(' | ') }), 'BUTTON | Quero CPF na nota | Quero CPF na nota | 1/-1')
  chk(9, E, 'grid colunas 784px 320px gap 32 start', await css(page, 'main > div:nth-child(2)', ['grid-template-columns', 'column-gap', 'align-items']), '784px 320px 32px start')
  chk(12, E, 'grid do form 347px 347px gap 20/24 start', await css(page, 'main h1 + div', ['grid-template-columns', 'row-gap', 'column-gap', 'align-items']), '347px 347px 20px 24px start')
  chk(19, E, 'aside sticky top 24px', await css(page, 'aside', ['position', 'top']), 'sticky 24px')
  chk(20, E, 'cabecalho do aside flex baseline space-between gap 12', await css(page, 'aside > div > div > div:first-child', ['display', 'align-items', 'justify-content', 'column-gap']), 'flex baseline space-between 12px')
  chk(21, E, 'Alterar pedido: tag/copy/sem sublinhado', (app.alterar && app.alterar.tag + ' ' + app.alterar.text) + ' ' + await css(page, 'aside h2 + button', ['text-decoration-line']), 'BUTTON Alterar pedido none')
  chk(22, E, 'linha do item: flex gap 12 flex-start pb 12 borda inf 1px --border-soft', await css(page, 'aside > div > div > div:nth-child(2) > div', ['display', 'column-gap', 'align-items', 'padding-bottom', 'border-bottom-width', 'border-bottom-style', 'border-bottom-color']), 'flex 12px flex-start 12px 1px solid ' + C.soft)
  chk(22, E, 'coluna do item gap 2px', await css(page, 'aside > div > div > div:nth-child(2) > div > div', ['row-gap']), '2px')
  chk(22, E, 'lista do aside gap 12', await css(page, 'aside > div > div > div:nth-child(2)', ['row-gap']), '12px')
  chk(26, E, 'total: pt 12, borda sup solid, caixa alta, ls 0.84px', await css(page, 'aside > div > div > div:nth-child(3) > div:nth-child(3)', ['padding-top', 'border-top-style']) + ' ' + await css(page, 'aside > div > div > div:nth-child(3) > div:nth-child(3) > span', ['text-transform', 'letter-spacing']), '12px solid uppercase 0.84px')
  const aus = await page.evaluate(() => { const a = document.querySelector('aside'); const t = a.textContent; return [a.querySelectorAll('button').length, /tirar|pizzas? no carrinho|frete grátis|Faltam|Finalizar pedido|Sai do forno/.test(t)].join(' ') })
  chk(27, E, 'aside so leitura: 1 botao (Alterar) e sem stepper/tirar/resumo/aviso/Finalizar', aus, '1 false')
  chk(18, E, 'Confirmar habilitado, grid-column 1/-1, margin-top 8', await page.evaluate(() => { const b = Array.from(document.querySelectorAll('main button')).find((x) => /^Confirmar pedido/.test(x.textContent)); const w = getComputedStyle(b.parentElement); return [b.disabled, w.gridColumnStart + '/' + w.gridColumnEnd, w.marginTop].join(' ') }), 'false 1/-1 8px')
}

async function extrasInput(page, E, sel) {
  chk(28, E, 'Input: coluna gap 6px largura 100%', await page.evaluate((s) => { const w = document.querySelector(s).parentElement; const c = getComputedStyle(w); return [c.display, c.flexDirection, c.rowGap, w.style.width === '100%'].join(' ') }, sel), 'flex column 6px true')
  chk(29, E, 'campo: border-box, padding 12px 14px, raio 12, outline none', await css(page, sel, ['box-sizing', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left', 'border-top-left-radius', 'outline-style']), 'border-box 12px 14px 12px 14px 12px none')
  chk(30, E, 'placeholder --text-muted opacidade 1', await css(page, sel, ['color', 'opacity'], '::placeholder'), C.muted + ' 1')
  chk(36, E, 'transicao border-color/box-shadow/background .15s ease', await css(page, sel, ['transition-property', 'transition-duration', 'transition-timing-function']), 'border-color, box-shadow, background 0.15s, 0.15s, 0.15s ease, ease, ease')
}

async function extrasKV(page, app) {
  chk(17, 'K-V', 'campo CPF ausente com checkbox desmarcado', await page.locator('#cpf').count(), 0)
  chk(48, 'K-V', 'nenhum erro antes da 1a tentativa', (await alerts(page)).length, 0)
  chk(15, 'K-V', 'checkbox desmarcado sem marca', await page.evaluate(() => { const b = document.querySelector('[role=checkbox]'); return b.getAttribute('aria-checked') + ' [' + b.textContent + ']' }), 'false []')
  chk(37, 'K-V', 'checkbox: linha flex centro gap 10; rotulo cursor pointer, user-select none', await css(page, '[role=checkbox]', ['border-top-left-radius']) + ' ' + await page.evaluate(() => { const b = document.querySelector('[role=checkbox]'); const r = getComputedStyle(b.parentElement); const l = getComputedStyle(b.nextElementSibling); return [r.display, r.alignItems, r.columnGap, l.cursor, l.userSelect].join(' ') }), '8px flex center 10px pointer none')
  chk(18, 'K-V', 'Confirmar copy (2 itens)', app.confirmar && app.confirmar.text, 'Confirmar pedido · R$ 105,00')
  chk(20, 'K-V', '"Seu pedido"', app['aside-titulo'] && app['aside-titulo'].text, 'Seu pedido')
  chk(22, 'K-V', 'itens: nome / detalhe / total', [0, 1].map((i) => [app['aitem' + i + '-nome'], app['aitem' + i + '-sub'], app['aitem' + i + '-total']].map((x) => x && x.text).join(' / ')).join(' ; '), 'Margherita da casa / Tamanho M · 6 fatias / R$ 45,00 ; Calabresa da Dona / Tamanho G · 8 fatias / R$ 60,00')
  chk(24, 'K-V', 'Subtotal / Entrega Gratis', [app.subtotal, app.entrega].map((x) => x && x.text).join(' ; '), 'SubtotalR$ 105,00 ; EntregaGrátis')
  chk(26, 'K-V', 'Total', app.atotal && app.atotal.text, 'TotalR$ 105,00')
  await extrasInput(page, 'K-V', '#nome')
  await page.hover('aside h2 + button'); await page.waitForTimeout(350)
  chk(21, 'K-V', 'Alterar pedido hover: --action-primary-hover + sublinhado', await css(page, 'aside h2 + button', ['color', 'text-decoration-line']), C.primaryHover + ' underline')
  await repousa(page)
}

async function extrasKP(page) {
  const v = await page.evaluate(() => ['nome', 'telefone', 'cpf'].map((id) => { const f = document.getElementById(id); return f ? f.value : 'ausente' }))
  chk(49, 'K-P', 'valores no campo (nome / telefone / CPF de teste completo, P-7)', [v[0], v[1], v[2] === '123.456.789-09' ? 'CPF-TESTE' : esconde(v[2])].join(' / '), 'Ana Exemplo / (11) 90000-0000 / CPF-TESTE')
  chk(38, 'K-P', 'checkbox marcado com ✓', await page.evaluate(() => { const b = document.querySelector('[role=checkbox]'); return b.getAttribute('aria-checked') + ' ' + b.textContent }), 'true ✓')
  chk(16, 'K-P', 'CPF: label/placeholder/inputmode/ajuda/autocomplete off (P-5)', await page.evaluate(() => { const f = document.getElementById('cpf'); return [document.querySelector('label[for=cpf]').textContent, f.placeholder, f.inputMode, (document.getElementById('cpf-ajuda') || {}).textContent, f.getAttribute('autocomplete')].join(' | ') }), 'CPF | 000.000.000-00 | numeric | Usado só para emitir a nota fiscal. | off')
  chk(16, 'K-P', 'nome e telefone sem autocomplete (P-5)', await page.evaluate(() => [document.getElementById('nome').getAttribute('autocomplete'), document.getElementById('telefone').getAttribute('autocomplete')].map(String).join(' ')), 'null null')
  chk(16, 'K-P', 'CPF na coluna 1 (x = nome.x)', await page.evaluate(() => document.getElementById('cpf').getBoundingClientRect().x === document.getElementById('nome').getBoundingClientRect().x), 'true')
  chk(48, 'K-P', 'sem erros', (await alerts(page)).length, 0)
}

async function extrasKE(page) {
  chk(48, 'K-E', 'erros so depois da tentativa: 3 alertas, copy literal', (await alerts(page)).join(' | '), 'Conta pra gente seu nome. | Esse telefone parece incompleto — confere o DDD? | Esse CPF não confere. Dá uma olhadinha nos números?')
  chk(33, 'K-E', 'aria-invalid nos 3 campos; ajuda some com erro', await page.evaluate(() => ['nome', 'telefone', 'cpf'].map((id) => document.getElementById(id).getAttribute('aria-invalid')).join(',') + ' ' + !!document.getElementById('telefone-ajuda') + ' ' + !!document.getElementById('cpf-ajuda')), 'true,true,true false false')
  chk(18, 'K-E', 'Confirmar visivel e habilitado com erros', await page.evaluate(() => Array.from(document.querySelectorAll('main button')).find((x) => /^Confirmar pedido/.test(x.textContent)).disabled), 'false')
  chk(33, 'K-E', 'erro com hover: borda --danger prevalece', (await page.hover('#nome'), await page.waitForTimeout(350), await css(page, '#nome', ['border-top-color'])), C.danger)
  await page.focus('#telefone'); await page.waitForTimeout(350)
  chk(33, 'K-E', 'erro com foco: borda --danger + anel de foco', await css(page, '#telefone', ['border-top-color', 'box-shadow']), C.danger + ' ' + FOCUS_RING)
  await repousa(page)
}

async function extrasKdin(page, app) {
  chk(23, 'K-$', 'detalhe com unidades / total da linha', [app['aitem0-sub'], app['aitem0-total']].map((x) => x && x.text).join(' / '), 'Tamanho M · 6 fatias · 2 unidades / R$ 90,00')
  chk(23, 'K-$', '1 linha de item', app.aitem1 ? '2+' : '1', '1')
  chk(25, 'K-$', 'Subtotal / Entrega paga / Total', [app.subtotal, app.entrega, app.atotal].map((x) => x && x.text).join(' ; '), 'SubtotalR$ 90,00 ; EntregaR$ 12,00 ; TotalR$ 102,00')
  chk(25, 'K-$', 'Entrega paga sem estilo extra (--text-body 400)', app['entrega-val'] && app['entrega-val'].color + ' ' + app['entrega-val'].fw, C.body + ' 400')
  chk(18, 'K-$', 'Confirmar copy', app.confirmar && app.confirmar.text, 'Confirmar pedido · R$ 102,00')
  chk(23, 'K-$', 'detalhe com unidades: altura/linhas (relato)', app['aitem0-sub'] && app['aitem0-sub'].h + 'px (' + Math.round(app['aitem0-sub'].h / 18) + ' linha(s))', () => true, 'derivado')
}

async function extrasKC(page, app) {
  chk(54, 'K-C', 'Badge success "Pedido confirmado" caixa alta', app.cbadge && app.cbadge.text + ' ' + await css(page, 'main > div > div > div > div > span', ['text-transform']), 'Pedido confirmado uppercase')
  chk(55, 'K-C', 'titulo', app.ctitulo && app.ctitulo.text, 'Sua pizza já vai pro forno!')
  chk(56, 'K-C', 'numero sequencial #1234 (1o pedido, P-1) / coluna gap 2px', (app.cnum && app.cnum.text) + ' ' + await css(page, 'main > div > div > div > div > div', ['row-gap']), 'Pedido #1234 2px')
  chk(57, 'K-C', 'prazo', app.cprazo && app.cprazo.text, 'Chega quentinha em uns 40 minutos.')
  chk(59, 'K-C', 'itens: nome / detalhe / total', [0, 1].map((i) => [app['citem' + i + '-nome'], app['citem' + i + '-sub'], app['citem' + i + '-total']].map((x) => x && x.text).join(' / ')).join(' ; '), 'Margherita da casa / Tamanho M · 6 fatias / R$ 45,00 ; Calabresa da Dona / Tamanho G · 8 fatias / R$ 60,00')
  chk(59, 'K-C', 'item sem padding-bottom nem borda', await css(page, 'main > div > div > div > div:nth-child(2) > div', ['padding-bottom', 'border-bottom-width']), '0px 0px')
  chk(60, 'K-C', 'Total', app.ctotal && app.ctotal.text, 'TotalR$ 105,00')
  chk(61, 'K-C', 'CPF na nota mascarado', app.ccpf && app.ccpf.text, 'CPF na nota: ***.456.789-**')
  chk(62, 'K-C', 'botao Voltar para o inicio', app.cinicio && app.cinicio.text, 'Voltar para o início')
  chk(51, 'K-C', 'main max 1200 padding 32 flex center; conteudo max 520', await css(page, 'main', ['max-width', 'padding-top', 'padding-left', 'display', 'justify-content']) + ' ' + await css(page, 'main > div', ['max-width']), '1200px 32px 32px flex center 520px')
  chk(52, 'K-C', 'card coluna gap 20', await css(page, 'main > div > div > div', ['flex-direction', 'row-gap']), 'column 20px')
  chk(53, 'K-C', 'cabeca coluna flex-start gap 12', await css(page, 'main > div > div > div > div', ['flex-direction', 'align-items', 'row-gap']), 'column flex-start 12px')
  chk(58, 'K-C', 'bloco de itens gap 12 pt 16 borda sup 1px solid --border-soft', await css(page, 'main > div > div > div > div:nth-child(2)', ['row-gap', 'padding-top', 'border-top-width', 'border-top-style', 'border-top-color']), '12px 16px 1px solid ' + C.soft)
  chk(63, 'K-C', 'confirmacao substitui form + aside; header fica', await page.evaluate(() => [!!document.querySelector('header'), !!document.querySelector('aside'), !!document.getElementById('nome'), document.querySelectorAll('main').length].join(' ')), 'true false false 1')
  const lgpd = await page.evaluate((src) => { const rx = new RegExp(src); const h = document.documentElement.outerHTML; return [rx.test(h), h.includes('Ana Exemplo'), h.includes('90000-0000'), localStorage.length + sessionStorage.length, document.cookie === ''].join(' ') }, RX_CPF.source)
  chk(61, 'K-C', 'LGPD: DOM sem CPF/telefone completo nem nome; storage 0; sem cookie', lgpd, 'false false false 0 true')
}

// Prancha I: monta o ui/Input real numa pagina virtual (nada no codigo de produto), mesmo leiaute do harness
const ENTRADA_PRANCHA = [
  "import { createElement as h, useState } from 'react'",
  "import { createRoot } from 'react-dom/client'",
  "import '/src/styles/tokens.css'",
  "import { Input } from '/src/components/ui/Input.tsx'",
  "function T(p) { const [v, setV] = useState(p.v || ''); return h(Input, { id: p.id, label: p.label, placeholder: p.ph, value: v, onChange: setV, help: p.help, error: p.error, disabled: p.disabled }) }",
  "function K(p) { const [c, setC] = useState(!!p.checked); return h(Input, { kind: 'checkbox', label: 'Quero CPF na nota', checked: c, onToggle: setC, disabled: p.disabled }) }",
  "const col = (k, ch) => h('div', { key: k, style: { width: '220px' } }, ch)",
  "const ph = 'Como a gente te chama?'",
].join('\n')
const ENTRADA_RENDER = [
  "createRoot(document.getElementById('root')).render(h('div', { style: { display: 'flex', gap: '24px', flexWrap: 'wrap', padding: '24px' } },",
  "  col('a', h(T, { id: 'pnone', label: 'Seu nome', ph })), col('b', h(T, { id: 'phover', label: 'Seu nome', ph })),",
  "  col('c', h(T, { id: 'pfocus', label: 'Seu nome', ph, v: 'Ana Exemplo' })),",
  "  col('d', h(T, { id: 'perro', label: 'Telefone (com DDD)', v: '(11) 9000', error: 'Esse telefone parece incompleto — confere o DDD?' })),",
  "  col('e', h(T, { id: 'pdis', label: 'CPF', v: '123.456.789-09', disabled: true, help: 'Usado só para emitir a nota fiscal.' })),",
  "  col('f', ['cb0', 'cb1', 'cb2', 'cbh', 'cbf'].map((k) => h('div', { key: k, 'data-slot': k }, h(K, { checked: k === 'cb1', disabled: k === 'cb2' }))))))",
].join('\n')
const VID = 'virtual:paridade-input'
const VID_R = String.fromCharCode(0) + VID
const pluginPrancha = {
  name: 'paridade-prancha-input',
  resolveId(id) { return id === VID ? VID_R : null },
  load(id) { return id === VID_R ? ENTRADA_PRANCHA + '\n' + ENTRADA_RENDER : null },
  configureServer(server) {
    server.middlewares.use('/__paridade/input.html', async (req, res) => {
      const html = await server.transformIndexHtml('/__paridade/input.html', '<!doctype html><html><head><meta charset="utf-8"></head><body><div id="root"></div><script type="module" src="/@id/' + VID + '"></script></body></html>')
      res.setHeader('Content-Type', 'text/html'); res.end(html)
    })
  },
}

async function medirPrancha(page) {
  await page.goto('http://localhost:' + PORT + '/__paridade/input.html', { waitUntil: 'networkidle' })
  await page.locator('#pnone').waitFor()
  await page.evaluate(() => document.fonts.ready)
  await page.mouse.move(1275, 715); await page.waitForTimeout(350)
  const base = await medir(page, 'I')
  await page.focus('#pfocus'); await page.hover('#phover'); await page.waitForTimeout(350)
  const pf = await medir(page, 'I')
  await page.focus('[data-slot="cbf"] [role=checkbox]'); await page.hover('[data-slot="cbh"] [role=checkbox]'); await page.waitForTimeout(350)
  const cbs = await medir(page, 'I')
  for (const k of Object.keys(base)) {
    if (/^in-(phover|pfocus)/.test(k)) base[k] = pf[k]
    if (/^(cbh|cbf)/.test(k)) base[k] = cbs[k]
  }
  comparar('I', base, linhaPrancha)
  await page.mouse.move(1275, 715)
  await extrasInput(page, 'I', '#pnone')
  chk(35, 'I', 'desabilitado: cursor not-allowed, disabled, sem hover', (await page.hover('#pdis', { force: true }), await page.waitForTimeout(350), await css(page, '#pdis', ['cursor', 'border-top-color'])) + ' ' + await page.evaluate(() => document.getElementById('pdis').disabled), 'not-allowed ' + C.soft + ' true')
  await page.hover('[data-slot="cb1"] [role=checkbox]'); await page.waitForTimeout(350)
  chk(39, 'I', 'checkbox marcado + hover: sem sombra, borda inalterada', await css(page, '[data-slot="cb1"] [role=checkbox]', ['box-shadow', 'border-top-color']), 'none ' + C.primary)
  await page.mouse.move(1275, 715)
  await page.click('[data-slot="cb2"] span', { force: true })
  chk(41, 'I', 'checkbox desabilitado: nao alterna, cursor not-allowed', await page.evaluate(() => { const b = document.querySelector('[data-slot="cb2"] [role=checkbox]'); return b.getAttribute('aria-checked') + ' ' + getComputedStyle(b).cursor + ' ' + getComputedStyle(b.nextElementSibling).cursor }), 'false not-allowed not-allowed')
  await page.click('[data-slot="cb0"] span')
  chk(42, 'I', 'clicar no rotulo alterna; role checkbox + aria-label', await page.evaluate(() => { const b = document.querySelector('[data-slot="cb0"] [role=checkbox]'); return [b.tagName, b.getAttribute('aria-checked'), b.getAttribute('aria-label')].join(' ') }), 'BUTTON true Quero CPF na nota')
  chk(38, 'I', 'marca do checkbox: ✓ Karla 14px 700 lh 1 --text-on-primary', await page.evaluate(() => { const b = document.querySelector('[data-slot="cb1"] [role=checkbox]'); const c = getComputedStyle(b); return [b.textContent, c.fontFamily.split(',')[0], c.fontSize, c.fontWeight, c.lineHeight, c.color].join(' ') }), '✓ Karla 14px 700 14px ' + C.onPrimary)
  chk(36, 'I', 'checkbox: transicao .15s', await css(page, '[data-slot="cb0"] [role=checkbox]', ['transition-duration']), '0.15s, 0.15s, 0.15s')
  chk(30, 'I', 'placeholder: regra unica no documento (5 Inputs)', await page.evaluate(() => Array.from(document.querySelectorAll('style')).filter((s) => s.textContent.includes('.dm-input::placeholder')).length), '1')
  await page.mouse.move(1275, 715); await page.evaluate(() => document.activeElement && document.activeElement.blur())
  await foto(page, 'I')
}

async function main() {
  const server = await createServer({ server: { port: PORT, strictPort: true }, logLevel: 'silent', plugins: [pluginPrancha] })
  await server.listen()
  const browser = await chromium.launch()
  const consoleMsgs = []
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 720 } })
    page.on('console', (msg) => consoleMsgs.push('[' + msg.type() + '] ' + msg.text()))
    page.on('pageerror', (err) => consoleMsgs.push('[pageerror] ' + err.message))
    await page.goto('http://localhost:' + PORT + '/', { waitUntil: 'networkidle' })
    await page.evaluate(() => document.fonts.ready)
    chk('-', 'ambiente', 'fontes Young Serif + Karla carregadas', await page.evaluate(() => document.fonts.check('16px "Young Serif"') + ' ' + document.fonts.check('16px Karla')), 'true true')
    const url0 = page.url()
    const card = (n) => page.locator('main div').filter({ has: page.getByRole('heading', { name: n }) }).filter({ has: page.getByRole('button', { name: 'Adicionar', exact: true }) }).last()
    const add = async (n, tam) => { if (tam) await card(n).getByRole('button', { name: new RegExp('^' + tam) }).click(); await card(n).getByRole('button', { name: 'Adicionar', exact: true }).click() }
    const finalizar = async () => { await page.getByRole('button', { name: 'Finalizar pedido' }).click(); await page.getByRole('heading', { name: /^Quase lá/ }).waitFor() }

    await page.getByRole('button', { name: 'Ver o cardápio' }).click()
    await add('Margherita da casa'); await add('Calabresa da Dona', 'G')
    await repousa(page)
    await medirCI(page); await foto(page, 'CI')

    await finalizar(); await repousa(page)
    let app = await medir(page, 'K-V')
    comparar('K-V', app); hints('K-V', app); await extrasForm(page, 'K-V', app); await extrasKV(page, app)
    await foto(page, 'K-V')

    await page.getByLabel('Telefone (com DDD)').pressSequentially('119000')
    await page.getByRole('checkbox', { name: 'Quero CPF na nota' }).click()
    await page.getByLabel('CPF', { exact: true }).pressSequentially('12345678900')
    await page.getByRole('button', { name: /^Confirmar pedido/ }).click()
    await repousa(page)
    app = await medir(page, 'K-E')
    comparar('K-E', app); await extrasForm(page, 'K-E', app); await extrasKE(page)
    await foto(page, 'K-E')

    await page.getByRole('button', { name: /Voltar ao card/ }).click()
    await finalizar()
    await page.getByLabel('Seu nome').fill('Ana Exemplo')
    await page.getByLabel('Telefone (com DDD)').pressSequentially('11900000000')
    await page.getByRole('checkbox', { name: 'Quero CPF na nota' }).click()
    await page.getByLabel('CPF', { exact: true }).pressSequentially('12345678909')
    await repousa(page)
    app = await medir(page, 'K-P')
    comparar('K-P', app); hints('K-P', app); await extrasForm(page, 'K-P', app); await extrasKP(page)
    await foto(page, 'K-P')

    await page.getByRole('button', { name: /^Confirmar pedido/ }).click()
    await page.getByText('Sua pizza já vai pro forno!').waitFor()
    await repousa(page)
    app = await medir(page, 'K-C')
    comparar('K-C', app); hints('K-C', app); await extrasKC(page, app)
    await foto(page, 'K-C')

    await page.getByRole('button', { name: 'Voltar para o início' }).click()
    chk(62, 'K-C', 'Voltar para o inicio -> Home (P-2)', await page.getByRole('button', { name: 'Ver o cardápio' }).count(), 1)
    await page.getByRole('button', { name: 'Ver o cardápio' }).click()
    chk(63, 'CV', 'carrinho esvaziou ao confirmar', await page.getByRole('complementary').getByText('Nenhuma pizza ainda').count(), 1)
    await add('Margherita da casa'); await add('Margherita da casa')
    await finalizar(); await repousa(page)
    app = await medir(page, 'K-$')
    await extrasKdin(page, app)
    await foto(page, 'K-$')
    chk(4, 'K-$', 'URL nunca mudou (sem window.location)', page.url(), url0)
    chk(64, 'K-$', 'nada persiste (localStorage/sessionStorage vazios)', await page.evaluate(() => localStorage.length + ' ' + sessionStorage.length), '0 0')

    await medirPrancha(page)
  } finally {
    await browser.close()
    await server.close()
  }

  const comCpf = consoleMsgs.filter((s) => RX_CPF.test(s))
  console.log('console do navegador: ' + consoleMsgs.length + ' mensagem(ns); com padrao de CPF/telefone: ' + comCpf.length)
  for (const s of consoleMsgs) console.log('  ' + esconde(s))
  const falhas = results.filter((x) => !x.ok && x.tipo === 'implementa')
  const der = results.filter((x) => x.tipo === 'derivado')
  const okImpl = results.filter((x) => x.ok && x.tipo === 'implementa').length
  console.log('\nverificacoes: ' + results.length + ' | implementa ok: ' + okImpl + ' | divergencias implementa: ' + falhas.length + ' | derivado/nao verificado: ' + der.length)
  console.log('\n-- derivado / nao verificado (relato, nao reprova)')
  for (const x of der) console.log('  [' + (x.ok ? 'bate' : 'DIFERE') + '] L' + x.linha + ' ' + x.estado + ' ' + x.desc + ': app=' + esconde(x.actual) + ' | inventario=' + esconde(x.expected))
  if (falhas.length) {
    console.log('\n-- DIVERGENCIAS (linhas implementa)')
    for (const x of falhas) console.log('  L' + x.linha + ' ' + x.estado + ' ' + x.desc + ': app=' + esconde(x.actual) + ' | inventario=' + esconde(x.expected))
  }
  if (comCpf.length) console.log('\nCPF/telefone no console do navegador: FALHA')
  process.exit(falhas.length || comCpf.length ? 1 : 0)
}

main().catch((e) => { console.error(esconde(e && e.stack ? e.stack : e)); process.exit(2) })
