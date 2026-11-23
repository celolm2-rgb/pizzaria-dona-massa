// Regua de paridade E-6 -- Cardapio redesenhado (testador, 2026-10-02).
// Ajuste 2026-10-02 (spec do checkout, T10): estados P e G exigem 6 blocos + botao Finalizar + frase; V segue 2 blocos/naoTem.
// Fonte: docs/superpowers/specs/2026-10-01-cardapio-redesign-design.md, "## Inventario de paridade".
// O mockup (02dc2137/Cardapio.dc.html) nao renderiza (faltam support.js/_ds_bundle.js): a regua mede o
// APP contra os valores do inventario, que vem do fonte do mockup.
// Uso (na raiz do projeto):  node tests/paridade/cardapio.paridade.mjs
//   env PARIDADE_PORT (padrao 3100, strictPort)  |  env PARIDADE_OUT=<dir> salva prints V/P/G (opcional)
// Saida: 0 = nenhuma divergencia em linha `implementa`; 1 = divergencia; 2 = erro de execucao.
// Linhas/medidas "derivado" ou "nao verificado" sao medidas e relatadas, sem reprovar.
import path from 'node:path'
import { chromium } from 'playwright'
import { createServer } from 'vite'

const PORT = Number(process.env.PARIDADE_PORT || 3100)
const OUT = process.env.PARIDADE_OUT || ''
const TOL = 0.6

// tokens -> rgb (src/styles/tokens.css)
const C = {
  molho600: 'rgb(166, 43, 31)', molho100: 'rgb(246, 220, 215)',
  massa50: 'rgb(251, 246, 235)', massa100: 'rgb(246, 237, 220)', massa200: 'rgb(239, 225, 200)',
  massa300: 'rgb(227, 208, 175)', crosta600: 'rgb(192, 127, 40)', crosta100: 'rgb(245, 228, 200)',
  manj700: 'rgb(51, 88, 43)', manj100: 'rgb(222, 234, 216)',
  carvao900: 'rgb(46, 33, 27)', carvao700: 'rgb(74, 58, 48)', carvao500: 'rgb(107, 90, 78)', carvao300: 'rgb(160, 141, 126)',
  branco: 'rgb(255, 253, 248)',
}
const YOUNG = /Young Serif/
const KARLA = /^"?Karla/

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

async function m(loc) {
  return loc.evaluate((el) => {
    const c = getComputedStyle(el)
    const r = el.getBoundingClientRect()
    const p = (k) => c.getPropertyValue(k)
    return {
      tag: el.tagName, text: el.textContent, inline: el.getAttribute('style') || '',
      inlineMarginTop: el.style.marginTop, inlineMaxWidth: el.style.maxWidth,
      x: r.x, y: r.y, w: r.width, h: r.height, right: r.right, bottom: r.bottom,
      children: el.children.length,
      fontFamily: c.fontFamily, fontSize: c.fontSize, fontWeight: c.fontWeight, lineHeight: c.lineHeight,
      color: c.color, bg: c.backgroundColor, display: c.display, flexDirection: c.flexDirection,
      alignItems: c.alignItems, justifyContent: c.justifyContent, rowGap: c.rowGap, columnGap: c.columnGap,
      flexWrap: c.flexWrap, maxWidth: c.maxWidth, minWidth: c.minWidth, textAlign: c.textAlign,
      textTransform: c.textTransform, letterSpacing: c.letterSpacing, textDecoration: c.textDecorationLine,
      position: c.position, top: c.top, gtc: c.gridTemplateColumns, overflow: c.overflow, objectFit: c.objectFit,
      pt: c.paddingTop, pr: c.paddingRight, pb: c.paddingBottom, pl: c.paddingLeft,
      mt: c.marginTop, mb: c.marginBottom, ml: c.marginLeft,
      btw: c.borderTopWidth, bts: c.borderTopStyle, btc: c.borderTopColor,
      bbw: c.borderBottomWidth, bbs: c.borderBottomStyle, bbc: c.borderBottomColor,
      radius: c.borderTopLeftRadius, shadow: c.boxShadow, transition: c.transitionDuration,
      textWrap: p('text-wrap') || p('text-wrap-style') || '',
      hasStrong: !!el.querySelector('strong,b'),
    }
  })
}

async function medirComum(page, E) {
  const header = page.locator('header')
  const inner = header.locator(':scope > div')
  const word = header.locator('button')
  const tag = inner.locator(':scope > span')
  const [h, i, w, t] = await Promise.all([m(header), m(inner), m(word), m(tag)])
  chk(1, E, 'header padding', `${h.pt} ${h.pr} ${h.pb} ${h.pl}`, '24px 32px 24px 32px')
  chk(1, E, 'header fundo --action-primary', h.bg, C.molho600)
  chk(1, E, 'interno max-width', i.maxWidth, '1200px')
  chk(1, E, 'interno flex row baseline space-between wrap', `${i.display} ${i.flexDirection} ${i.alignItems} ${i.justifyContent} ${i.flexWrap}`, 'flex row baseline space-between wrap')
  chk(1, E, 'interno gap', i.columnGap, 24)
  chk(1, E, 'interno x (derivado 40)', i.x, 40, 'derivado')
  chk(2, E, 'header altura (derivado ~81.6)', h.h, 81.6, 'derivado')
  chk(3, E, 'wordmark e <button>', w.tag, 'BUTTON')
  chk(3, E, 'wordmark Young Serif', w.fontFamily, YOUNG)
  chk(3, E, 'wordmark 400 28px lh 33.6px', `${w.fontWeight} ${w.fontSize} ${w.lineHeight}`, '400 28px 33.6px')
  chk(3, E, 'wordmark cor --text-on-primary', w.color, C.massa50)
  chk(4, E, 'tagline copy', t.text, 'Aberto hoje até 23h · entrega em uns 40 minutos')
  chk(4, E, 'tagline 14px --molho-100', `${t.fontSize} ${t.color}`, `14px ${C.molho100}`)
  chk(4, E, 'tagline Karla', t.fontFamily, KARLA)
  chk(4, E, 'tagline a direita (right = interno.right)', t.right, i.right)
  chk(4, E, 'tagline na mesma linha do wordmark', t.y < w.bottom && t.bottom > w.y, true)

  const main = page.locator('main')
  const h1 = main.locator(':scope > h1')
  const intro = main.locator(':scope > p')
  const cols = main.locator(':scope > div')
  const [mn, a, b, co] = await Promise.all([m(main), m(h1), m(intro), m(cols)])
  chk(47, E, 'main max-width 1200 / padding 40 32 64', `${mn.maxWidth} ${mn.pt} ${mn.pr} ${mn.pb} ${mn.pl}`, '1200px 40px 32px 64px 32px')
  chk(47, E, 'main sem grid', mn.display, 'block')
  chk(47, E, 'main usa tokens --sp-10/--sp-8/--sp-16', mn.inline, /var\(--sp-10\) var\(--sp-8\) var\(--sp-16\)/)
  chk(5, E, 'h1 copy', a.text, 'Nossas pizzas')
  chk(5, E, 'h1 Young Serif', a.fontFamily, YOUNG)
  chk(5, E, 'h1 400 40px lh 44px', `${a.fontWeight} ${a.fontSize} ${a.lineHeight}`, '400 40px 44px')
  chk(5, E, 'h1 cor --text-title', a.color, C.carvao900)
  chk(5, E, 'h1 margin 0 0 8px', `${a.mt} ${a.mb}`, '0px 8px')
  chk(5, E, 'h1 largura total do main (w1200)', a.w, 1200)
  chk(5, E, 'h1 acima das colunas', a.bottom <= co.y, true)
  chk(6, E, 'intro copy', b.text, 'Massa de fermentação natural, assada no forno a lenha. Escolha o tamanho e a gente já começa a abrir a massa.')
  chk(6, E, 'intro 16px lh 24px --text-muted', `${b.fontSize} ${b.lineHeight} ${b.color}`, `16px 24px ${C.carvao500}`)
  chk(6, E, 'intro margin-bottom 32', b.mb, 32)
  chk(6, E, 'intro max-width 52ch (inline)', b.inlineMaxWidth, '52ch')
  chk(6, E, 'intro text-wrap pretty', b.textWrap, /pretty/)
  chk(6, E, 'intro largura/linhas medidas', `w${b.w.toFixed(1)} h${b.h.toFixed(1)} (${Math.round(b.h / 24)} linhas)`, () => true, 'derivado')
  chk(7, E, 'colunas minmax(0,1fr) 340px', co.gtc, /^[\d.]+px 340px$/)
  chk(7, E, 'colunas gap 32 / align-items start', `${co.columnGap} ${co.alignItems}`, '32px start')
  chk(7, E, 'colunas computadas (derivado 828px 340px)', co.gtc, '828px 340px', 'derivado')

  const grid = cols.locator(':scope > div')
  const g = await m(grid)
  chk(8, E, 'grid pizzas gap 24', `${g.rowGap} ${g.columnGap}`, '24px 24px')
  chk(8, E, 'grid pizzas sem align-items (stretch/normal)', g.alignItems, /^(normal|stretch)$/)
  chk(8, E, 'grid pizzas colunas (derivado 402px 402px)', g.gtc, '402px 402px', 'derivado')
  const cards = grid.locator(':scope > div')
  chk(8, E, '3 cards', await cards.count(), 3)
  const c0 = await m(cards.nth(0)); const c1 = await m(cards.nth(1)); const c2 = await m(cards.nth(2))
  chk(8, E, 'cards da 1a linha com mesma altura (stretch)', Math.abs(c0.h - c1.h) < 0.6, true)
  chk(8, E, '2 + 1 cards (3o card na 2a linha)', c2.y > c0.bottom, true, 'derivado')
  chk(8, E, 'cards x,y,wxh (relato)', [c0, c1, c2].map((c) => `${c.x},${c.y.toFixed(0)},${c.w}x${c.h.toFixed(1)}`).join(' | '), () => true, 'derivado')

  const nomes = ['Margherita da casa', 'Calabresa da Dona', 'Quatro queijos']
  const ingr = [
    'Molho de tomate fresco, muçarela de búfala e manjericão colhido na hora.',
    'Calabresa artesanal fatiada fina, cebola roxa e um toque de orégano.',
    'Muçarela, provolone, parmesão e gorgonzola derretidos juntos.',
  ]
  const selos = [['Mais pedida', C.crosta100, C.crosta600, 13], null, ['Da casa', C.manj100, C.manj700, 15]]
  for (let k = 0; k < 3; k++) {
    const card = cards.nth(k)
    const cd = [c0, c1, c2][k]
    const tagK = `card ${k + 1}`
    chk(9, E, `${tagK} fundo/raio/borda`, `${cd.bg} ${cd.radius} ${cd.btw} ${cd.btc}`, `${C.branco} 16px 1px ${C.massa300}`)
    chk(9, E, `${tagK} sombra --shadow-card`, cd.shadow, /rgba\(46, 33, 27, 0\.06\) 0px 1px 2px 0px, rgba\(46, 33, 27, 0\.08\) 0px 4px 12px 0px/)
    chk(9, E, `${tagK} padding 24 / coluna gap 16`, `${cd.pt} ${cd.pr} ${cd.pb} ${cd.pl} ${cd.display} ${cd.flexDirection} ${cd.rowGap}`, '24px 24px 24px 24px flex column 16px')
    const foto = await m(card.locator(':scope > div').nth(0))
    const img = await m(card.locator('img'))
    chk(10, E, `${tagK} foto altura 180 / --surface-inset / raio 12 / overflow hidden`, `${foto.h} ${foto.bg} ${foto.radius} ${foto.overflow}`, `180 ${C.massa200} 12px hidden`)
    chk(10, E, `${tagK} foto dentro do padding (x = card.x+25)`, foto.x, cd.x + 25)
    chk(10, E, `${tagK} foto largura = card - 50`, foto.w, cd.w - 50)
    chk(10, E, `${tagK} img cover 100%`, `${img.objectFit} ${Math.round(img.w)}x${Math.round(img.h)}`, `cover ${Math.round(foto.w)}x180`)
    const bloco = card.locator(':scope > div').nth(1)
    const row = await m(bloco.locator(':scope > div'))
    const h2 = await m(bloco.locator('h2'))
    chk(11, E, `${tagK} linha nome+selo flex space-between flex-start gap 12`, `${row.display} ${row.justifyContent} ${row.alignItems} ${row.columnGap}`, 'flex space-between flex-start 12px')
    chk(12, E, `${tagK} nome copy`, h2.text, nomes[k])
    chk(12, E, `${tagK} nome Young Serif 400 20px lh 24px --text-title`, `${YOUNG.test(h2.fontFamily)} ${h2.fontWeight} ${h2.fontSize} ${h2.lineHeight} ${h2.color}`, `true 400 20px 24px ${C.carvao900}`)
    const badgeLoc = bloco.locator(':scope > div > span')
    const nb = await badgeLoc.count()
    if (selos[k]) {
      const [txt, bg, cor, linha] = selos[k]
      chk(linha, E, `${tagK} selo existe`, nb, 1)
      if (nb) {
        const bd = await m(badgeLoc)
        chk(linha, E, `${tagK} selo texto/tom`, `${bd.text} ${bd.bg} ${bd.color}`, `${txt} ${bg} ${cor}`)
        chk(11, E, `${tagK} selo a DIREITA do nome`, bd.x >= h2.right && Math.abs(bd.right - row.right) < 0.6, true)
        chk(11, E, `${tagK} selo alinhado ao topo (flex-start)`, bd.y, row.y)
        chk(11, E, `${tagK} selo altura (nao verificado: hint 22px)`, bd.h, 22, 'derivado')
      }
    } else {
      chk(14, E, `${tagK} sem selo`, nb, 0)
    }
    const ing = await m(bloco.locator('p'))
    chk(16, E, `${tagK} ingredientes copy`, ing.text, ingr[k])
    chk(16, E, `${tagK} ingredientes 14px lh 21px --text-muted pretty`, `${ing.fontSize} ${ing.lineHeight} ${ing.color} ${/pretty/.test(ing.textWrap)}`, `14px 21px ${C.carvao500} true`)
    chk(16, E, `${tagK} gap 8 nome -> ingredientes`, ing.y - row.bottom, 8)

    const tb = card.locator(':scope > div').nth(2)
    const rot = await m(tb.locator(':scope > span'))
    const lista = await m(tb.locator(':scope > div'))
    chk(17, E, `${tagK} rotulo copy "Tamanho"`, rot.text, 'Tamanho')
    chk(17, E, `${tagK} rotulo 12px 700 caps ls 0.72px --text-muted`, `${rot.fontSize} ${rot.fontWeight} ${rot.textTransform} ${rot.letterSpacing} ${rot.color}`, `12px 700 uppercase 0.72px ${C.carvao500}`)
    chk(17, E, `${tagK} gap 8 rotulo -> lista`, lista.y - rot.bottom, 8)
    chk(18, E, `${tagK} lista grid gap 8`, `${lista.display} ${lista.rowGap}`, 'grid 8px')
    const pills = tb.locator('button')
    chk(18, E, `${tagK} 3 pilulas`, await pills.count(), 3)
    const ps = [await m(pills.nth(0)), await m(pills.nth(1)), await m(pills.nth(2))]
    for (const [idx, sel] of [[0, false], [1, true], [2, false]]) {
      const pp = ps[idx]
      const nm = `${tagK} pilula ${'PMG'[idx]}`
      chk(18, E, `${nm} flex space-between gap 12 w100%`, `${pp.display} ${pp.justifyContent} ${pp.columnGap} ${Math.round(pp.w)}`, `flex space-between 12px ${Math.round(lista.w)}`)
      chk(18, E, `${nm} padding 10px 16px`, `${pp.pt} ${pp.pr} ${pp.pb} ${pp.pl}`, '10px 16px 10px 16px')
      chk(18, E, `${nm} raio pill`, pp.radius, '999px')
      chk(18, E, `${nm} fonte Karla, line-height normal`, `${KARLA.test(pp.fontFamily)} ${pp.lineHeight}`, 'true normal')
      chk(18, E, `${nm} transition .15s`, pp.transition, /0\.15s/)
      if (sel) {
        chk(19, E, `${nm} (selecionada) fundo --massa-50 / borda 2px --action-primary`, `${pp.bg} ${pp.btw} ${pp.btc}`, `${C.massa50} 2px ${C.molho600}`)
        chk(19, E, `${nm} (selecionada) anel 0 0 0 3px --molho-100`, pp.shadow, `${C.molho100} 0px 0px 0px 3px`)
        chk(19, E, `${nm} (selecionada) altura 47`, pp.h, 47)
      } else {
        chk(18, E, `${nm} fundo --surface-card / borda 1px --border-soft`, `${pp.bg} ${pp.btw} ${pp.btc}`, `${C.branco} 1px ${C.massa300}`)
        chk(18, E, `${nm} altura 45`, pp.h, 45)
      }
      chk(20, E, `${nm} 2 filhos (sem dot)`, pp.children, 2)
      const pill = pills.nth(idx)
      const letra = await m(pill.locator(':scope > span > span').nth(0))
      const fat = await m(pill.locator(':scope > span > span').nth(1))
      const inn = await m(pill.locator(':scope > span').nth(0))
      const preco = await m(pill.locator(':scope > span').nth(1))
      chk(20, E, `${nm} letra Young Serif 16px --text-title`, `${YOUNG.test(letra.fontFamily)} ${letra.fontSize} ${letra.color} ${letra.text}`, `true 16px ${C.carvao900} ${'PMG'[idx]}`)
      chk(20, E, `${nm} fatias 14px --text-muted`, `${fat.fontSize} ${fat.color} ${fat.text}`, `14px ${C.carvao500} ${['4 fatias', '6 fatias', '8 fatias'][idx]}`)
      chk(20, E, `${nm} gap 12 interno`, inn.columnGap, 12)
      chk(20, E, `${nm} preco Young Serif 16px --text-title`, `${YOUNG.test(preco.fontFamily)} ${preco.fontSize} ${preco.color}`, `true 16px ${C.carvao900}`)
    }
    const res = card.locator(':scope > div').nth(3)
    const rs = await m(res)
    const rsT = await m(res.locator('span').nth(0))
    const rsP = await m(res.locator('span').nth(1))
    chk(21, E, `${tagK} resumo flex baseline space-between gap 12 margin-top auto`, `${rs.display} ${rs.alignItems} ${rs.justifyContent} ${rs.columnGap} ${rs.inlineMarginTop}`, 'flex baseline space-between 12px auto')
    chk(21, E, `${tagK} resumo texto 14px muted`, `${rsT.text} | ${rsT.fontSize} ${rsT.color}`, `Tamanho M · 6 fatias | 14px ${C.carvao500}`)
    chk(21, E, `${tagK} preco atual Young Serif 20px --text-title`, `${rsP.text} ${YOUNG.test(rsP.fontFamily)} ${rsP.fontSize} ${rsP.color}`, `${['R$ 45,00', 'R$ 50,00', 'R$ 55,00'][k]} true 20px ${C.carvao900}`)
    const btn = await m(card.locator(':scope > button'))
    chk(22, E, `${tagK} botao "Adicionar" primary fullWidth`, `${btn.text} ${btn.bg} ${Math.round(btn.w)}`, `Adicionar ${C.molho600} ${Math.round(cd.w - 50)}`)
    chk(22, E, `${tagK} botao altura (nao verificado: hint 48px)`, btn.h, 48, 'derivado')
  }

  const aside = cols.locator(':scope > aside')
  const as = await m(aside)
  const ac = await m(aside.locator(':scope > div'))
  chk(23, E, 'aside sticky top 24', `${as.position} ${as.top}`, 'sticky 24px')
  chk(23, E, 'aside card fundo/raio/borda/padding/gap', `${ac.bg} ${ac.radius} ${ac.btw} ${ac.btc} ${ac.pt} ${ac.pl} ${ac.flexDirection} ${ac.rowGap}`, `${C.branco} 16px 1px ${C.massa300} 24px 24px column 20px`)
  chk(23, E, 'aside card sombra', ac.shadow, /rgba\(46, 33, 27, 0\.06\) 0px 1px 2px 0px/)
  chk(7, E, 'aside x900 w340 (derivado)', `${as.x} ${as.w}`, '900 340', 'derivado')
  chk(7, E, 'aside largura 340', as.w, 340)
  const cab = aside.locator(':scope > div > div').nth(0)
  const ti = await m(cab.locator('h2'))
  const rc = await m(cab.locator('span'))
  chk(24, E, '"Seu pedido" Young Serif 400 20px lh 24 --text-title', `${ti.text} ${YOUNG.test(ti.fontFamily)} ${ti.fontWeight} ${ti.fontSize} ${ti.lineHeight} ${ti.color}`, `Seu pedido true 400 20px 24px ${C.carvao900}`)
  chk(25, E, 'resumo 14px --text-muted / gap 4', `${rc.fontSize} ${rc.color} ${Math.round(rc.y - ti.bottom)}`, `14px ${C.carvao500} 4`)
  return { aside, cab, rc, ac, cards }
}

async function medirHome(page) {
  const fav = page.locator('#favoritas .home-grid-3 > a')
  const homeIngr = [
    'Molho de tomate fresco, muçarela de búfala e manjericão colhido na hora.',
    'Calabresa artesanal fatiada fina, cebola roxa e um toque de orégano.',
    'Muçarela, provolone, parmesão e gorgonzola derretidos juntos.',
  ]
  const homeSelos = [['Mais pedida', C.crosta600, 48], [null, null, 49], ['Da casa', C.manj700, 50]]
  chk(48, 'Home', '3 cards em Favoritas', await fav.count(), 3)
  for (let k = 0; k < 3; k++) {
    const card = fav.nth(k)
    const [txt, cor, linha] = homeSelos[k]
    const antes = await card.locator('h3').evaluate((h) => {
      const s = h.previousElementSibling
      return s ? `${s.textContent} ${getComputedStyle(s).color}` : 'none'
    })
    chk(linha, 'Home', `fav ${k + 1} selo`, antes, txt ? `${txt} ${cor}` : 'none')
    chk(51, 'Home', `fav ${k + 1} ingredientes`, await card.locator('p').first().textContent(), homeIngr[k])
  }
  const geo = await page.evaluate(() => [...document.querySelectorAll('#favoritas .home-grid-3 > a')]
    .map((a) => { const r = a.getBoundingClientRect(); return `${Math.round(r.x)},${Math.round(r.y)},${Math.round(r.width)}x${Math.round(r.height)}` }).join(' | '))
  chk(51, 'Home', 'geometria dos cards de Favoritas (relato)', geo, () => true, 'derivado')
}

const naoTem = async (page, E) => {
  chk(42, E, '"Finalizar pedido" ausente (adia)', await page.getByText('Finalizar pedido').count(), 0)
  chk(43, E, '"Sai do forno..." ausente (adia)', await page.getByText(/Sai do forno/).count(), 0)
}
// Spec 2026-10-02-checkout-cpf (T10): com itens, o botao e a frase passam a existir (linhas 1-3 da spec do checkout).
const tem = async (page, E) => {
  chk(42, E, '"Finalizar pedido" presente (spec checkout, linha 1)', await page.getByRole('button', { name: 'Finalizar pedido' }).count(), 1)
  chk(43, E, '"Sai do forno..." presente (spec checkout, linha 2)', await page.getByText('Sai do forno e chega quentinha em uns 40 minutos.', { exact: true }).count(), 1)
}
const repousa = async (page) => { await page.mouse.move(1275, 715); await page.waitForTimeout(350) }

async function medirVazio(page) {
  const wr = await m(page.locator('#root > div'))
  chk(46, 'V', 'wrapper fundo/fonte/cor computados', `${wr.bg} ${KARLA.test(wr.fontFamily)} ${wr.color}`, `${C.massa100} true ${C.carvao700}`)
  chk(46, 'V', 'wrapper declara os 3 tokens + min-height 100vh', wr.inline, (s) => /min-height: 100vh/.test(s) && /var\(--surface-page\)/.test(s) && /var\(--font-body\)/.test(s) && /var\(--text-body\)/.test(s))
  const r = await medirComum(page, 'V')
  chk(25, 'V', 'resumo "Nenhuma pizza ainda"', r.rc.text, 'Nenhuma pizza ainda')
  chk(41, 'V', 'aside card: 2 blocos (cabecalho, vazio)', r.ac.children, 2)
  const vz = await m(r.aside.locator(':scope > div > p'))
  chk(26, 'V', 'vazio copy', vz.text, 'Seu carrinho ainda está vazio. Escolha um sabor e a gente já acende o forno.')
  chk(26, 'V', 'vazio 14px lh 21 muted padding 24 0 centro', `${vz.fontSize} ${vz.lineHeight} ${vz.color} ${vz.pt} ${vz.pr} ${vz.pb} ${vz.pl} ${vz.textAlign}`, `14px 21px ${C.carvao500} 24px 0px 24px 0px center`)
  const pills0 = r.cards.nth(0).locator(':scope > div').nth(2).locator('button')
  await pills0.nth(0).hover(); await page.waitForTimeout(350)
  let hp = await m(pills0.nth(0))
  chk(18, 'V', 'pilula P hover: fundo --surface-raised / borda --border-strong', `${hp.bg} ${hp.btw} ${hp.btc}`, `${C.massa50} 1px ${C.carvao300}`)
  await pills0.nth(1).hover(); await page.waitForTimeout(350)
  hp = await m(pills0.nth(1))
  chk(19, 'V', 'pilula M selecionada sem hover (fundo/borda/anel inalterados)', `${hp.bg} ${hp.btw} ${hp.btc} ${hp.shadow}`, `${C.massa50} 2px ${C.molho600} ${C.molho100} 0px 0px 0px 3px`)
  await repousa(page)
  await naoTem(page, 'V')
  return r
}

async function medirItens(page, E, qtd, totalLinha, subtotal, entrega, total, aviso) {
  const r = await medirComum(page, E)
  chk(25, E, 'resumo do carrinho', r.rc.text, qtd === 1 ? '1 pizza no carrinho' : `${qtd} pizzas no carrinho`)
  chk(41, E, 'aside card: 6 blocos (cabecalho, itens, somas, aviso, botao, frase) -- spec checkout T10', r.ac.children, 6)
  const blocos = r.aside.locator(':scope > div > div')
  const lista = await m(blocos.nth(1))
  chk(27, E, 'lista coluna gap 12', `${lista.flexDirection} ${lista.rowGap}`, 'column 12px')
  const rowL = blocos.nth(1).locator(':scope > div').nth(0)
  const row = await m(rowL)
  chk(28, E, 'linha flex gap 12 flex-start pb 12 borda inf 1px --border-soft', `${row.display} ${row.columnGap} ${row.alignItems} ${row.pb} ${row.bbw} ${row.bbs} ${row.bbc}`, `flex 12px flex-start 12px 1px solid ${C.massa300}`)
  const colL = rowL.locator(':scope > div')
  const col = await m(colL)
  const nome = await m(colL.locator(':scope > span').nth(0))
  const det = await m(colL.locator(':scope > span').nth(1))
  chk(29, E, 'nome do item Young Serif 16 --text-title', `${nome.text} ${YOUNG.test(nome.fontFamily)} ${nome.fontSize} ${nome.color}`, `Margherita da casa true 16px ${C.carvao900}`)
  chk(29, E, 'coluna gap 2px', `${col.rowGap} ${Math.round(det.y - nome.bottom)}`, '2px 2')
  chk(30, E, 'detalhe copy 12px muted', `${det.text} | ${det.fontSize} ${det.color}`, `Tamanho M · 6 fatias · R$ 45,00 cada | 12px ${C.carvao500}`)
  const stepRowL = colL.locator(':scope > div')
  const stepRow = await m(stepRowL)
  chk(31, E, 'linha do stepper margin-top 8 gap 8', `${stepRow.mt} ${stepRow.columnGap}`, '8px 8px')
  const btns = stepRowL.locator('button')
  for (const [ix, nm] of [[0, '-'], [1, '+']]) {
    const s = await m(btns.nth(ix))
    chk(31, E, `stepper ${nm} 28x28 pill borda 1px soft fundo card --text-title Karla 16 lh 16`, `${s.w}x${s.h} ${s.radius} ${s.btw} ${s.btc} ${s.bg} ${s.color} ${KARLA.test(s.fontFamily)} ${s.fontSize} ${s.lineHeight}`, `28x28 999px 1px ${C.massa300} ${C.branco} ${C.carvao900} true 16px 16px`)
  }
  await btns.nth(0).hover(); await page.waitForTimeout(350)
  const sh = await m(btns.nth(0))
  chk(31, E, 'stepper hover fundo --surface-raised borda --border-strong', `${sh.bg} ${sh.btc}`, `${C.massa50} ${C.carvao300}`)
  await repousa(page)
  const q = await m(stepRowL.locator(':scope > span'))
  chk(32, E, 'quantidade Karla 14 700 --text-title min-width 14 centro', `${q.text} ${KARLA.test(q.fontFamily)} ${q.fontSize} ${q.fontWeight} ${q.color} ${q.minWidth} ${q.textAlign}`, `${qtd} true 14px 700 ${C.carvao900} 14px center`)
  const tirar = await m(btns.nth(2))
  chk(33, E, '"tirar" copy, ml 8, Karla 12 muted sublinhado', `${tirar.text} ${tirar.ml} ${KARLA.test(tirar.fontFamily)} ${tirar.fontSize} ${tirar.color} ${tirar.textDecoration}`, `tirar 8px true 12px ${C.carvao500} underline`)
  chk(33, E, '"tirar" altura 14 (line-height normal)', tirar.h, 14)
  await btns.nth(2).hover(); await page.waitForTimeout(350)
  chk(33, E, '"tirar" hover --action-primary', (await m(btns.nth(2))).color, C.molho600)
  await repousa(page)
  const tl = await m(rowL.locator(':scope > span'))
  chk(34, E, 'total da linha Young Serif 16 --text-title a direita', `${tl.text} ${YOUNG.test(tl.fontFamily)} ${tl.fontSize} ${tl.color} ${Math.abs(tl.right - row.right) < 0.6}`, `${totalLinha} true 16px ${C.carvao900} true`)

  const somasL = blocos.nth(2)
  const somas = await m(somasL)
  chk(35, E, 'bloco somas coluna gap 8', `${somas.flexDirection} ${somas.rowGap}`, 'column 8px')
  const lin = somasL.locator(':scope > div')
  const sub = await m(lin.nth(0))
  chk(35, E, 'Subtotal 14px --text-body', `${sub.text} ${sub.fontSize} ${sub.color}`, `Subtotal${subtotal} 14px ${C.carvao700}`)
  const ent = await m(lin.nth(1))
  const entV = await m(lin.nth(1).locator('span').nth(1))
  if (entrega === 'Grátis') {
    chk(37, E, 'Entrega "Grátis" --manjericao-700 700', `${ent.text} ${entV.color} ${entV.fontWeight}`, `EntregaGrátis ${C.manj700} 700`)
  } else {
    chk(36, E, 'Entrega paga sem estilo extra', `${ent.text} ${ent.fontSize} ${entV.color} ${entV.fontWeight}`, `Entrega${entrega} 14px ${C.carvao700} 400`)
  }
  const tot = await m(lin.nth(2))
  const totR = await m(lin.nth(2).locator('span').nth(0))
  const totV = await m(lin.nth(2).locator('span').nth(1))
  chk(38, E, 'total pt 12 borda sup 1px --border-soft', `${tot.pt} ${tot.btw} ${tot.bts} ${tot.btc}`, `12px 1px solid ${C.massa300}`)
  chk(38, E, 'rotulo Total Karla 14 700 caps ls 0.84px muted', `${totR.text} ${KARLA.test(totR.fontFamily)} ${totR.fontSize} ${totR.fontWeight} ${totR.textTransform} ${totR.letterSpacing} ${totR.color}`, `Total true 14px 700 uppercase 0.84px ${C.carvao500}`)
  chk(38, E, 'valor total Young Serif 28 lh 33.6 --text-title', `${totV.text} ${YOUNG.test(totV.fontFamily)} ${totV.fontSize} ${totV.lineHeight} ${totV.color}`, `${total} true 28px 33.6px ${C.carvao900}`)
  const av = await m(blocos.nth(3))
  const la = aviso.gratis ? 40 : 39
  chk(la, E, 'aviso copy (sem negrito)', `${av.text} strong=${av.hasStrong}`, `${aviso.texto} strong=false`)
  chk(la, E, 'aviso Karla 14 lh 21 padding 12 16 raio 12 fundo/cor', `${KARLA.test(av.fontFamily)} ${av.fontSize} ${av.lineHeight} ${av.pt} ${av.pr} ${av.radius} ${av.bg} ${av.color}`, `true 14px 21px 12px 16px 12px ${aviso.gratis ? `${C.manj100} ${C.manj700}` : `${C.crosta100} ${C.crosta600}`}`)
  chk(41, E, 'aviso DEPOIS do total (gap 20)', Math.round(av.y - somas.bottom), 20)
  await tem(page, E)
}

async function main() {
  const server = await createServer({ server: { port: PORT, strictPort: true }, logLevel: 'silent' })
  await server.listen()
  const browser = await chromium.launch()
  const consoleMsgs = []
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 720 } })
    page.on('console', (msg) => consoleMsgs.push(`[${msg.type()}] ${msg.text()}`))
    page.on('pageerror', (err) => consoleMsgs.push(`[pageerror] ${err.message}`))
    await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'networkidle' })
    await page.evaluate(() => document.fonts.ready)
    const f = await page.evaluate(() => `${document.fonts.check('16px "Young Serif"')} ${document.fonts.check('16px Karla')}`)
    chk('-', 'ambiente', 'fontes Young Serif + Karla carregadas', f, 'true true')
    await medirHome(page)

    await page.getByRole('button', { name: 'Ver o cardápio' }).click()
    await page.waitForLoadState('networkidle')
    await page.evaluate(() => document.fonts.ready)
    const r = await medirVazio(page)
    if (OUT) await page.screenshot({ path: path.join(OUT, 'paridade-V.png'), fullPage: true })

    await r.cards.nth(0).getByRole('button', { name: 'Adicionar', exact: true }).click()
    await repousa(page)
    await medirItens(page, 'P', 1, 'R$ 45,00', 'R$ 45,00', 'R$ 12,00', 'R$ 57,00', { gratis: false, texto: 'Faltam R$ 55,00 para frete grátis' })
    if (OUT) await page.screenshot({ path: path.join(OUT, 'paridade-P.png'), fullPage: true })

    const mais = page.getByRole('button', { name: 'Aumentar quantidade' })
    await mais.click(); await mais.click()
    await repousa(page)
    await medirItens(page, 'G', 3, 'R$ 135,00', 'R$ 135,00', 'Grátis', 'R$ 135,00', { gratis: true, texto: 'Frete grátis liberado! A entrega é por nossa conta.' })
    if (OUT) await page.screenshot({ path: path.join(OUT, 'paridade-G.png'), fullPage: true })

    const st = await page.evaluate(() => `${localStorage.length} ${sessionStorage.length}`)
    chk(44, 'G', 'nada persiste (localStorage/sessionStorage vazios)', st, '0 0')
  } finally {
    await browser.close()
    await server.close()
  }

  const cpf = consoleMsgs.filter((s) => /\d{3}\.?\d{3}\.?\d{3}-?\d{2}/.test(s))
  console.log(`console do navegador: ${consoleMsgs.length} mensagem(ns); com padrao de CPF: ${cpf.length}`)
  for (const s of consoleMsgs) console.log(`  ${s.replace(/\d{3}\.?\d{3}\.?\d{3}-?\d{2}/g, '***CPF***')}`)
  const falhas = results.filter((x) => !x.ok && x.tipo === 'implementa')
  const der = results.filter((x) => x.tipo === 'derivado')
  const okImpl = results.filter((x) => x.ok && x.tipo === 'implementa').length
  console.log(`\nverificacoes: ${results.length} | implementa ok: ${okImpl} | divergencias implementa: ${falhas.length} | derivado/nao verificado: ${der.length}`)
  console.log('\n-- derivado / nao verificado (relato, nao reprova)')
  for (const x of der) console.log(`  [${x.ok ? 'bate' : 'DIFERE'}] L${x.linha} ${x.estado} ${x.desc}: app=${x.actual} | inventario=${x.expected}`)
  if (falhas.length) {
    console.log('\n-- DIVERGENCIAS (linhas implementa)')
    for (const x of falhas) console.log(`  L${x.linha} ${x.estado} ${x.desc}: app=${x.actual} | inventario=${x.expected}`)
  }
  if (cpf.length) console.log('\nCPF no console do navegador: FALHA')
  process.exit(falhas.length || cpf.length ? 1 : 0)
}

main().catch((e) => { console.error(e); process.exit(2) })
