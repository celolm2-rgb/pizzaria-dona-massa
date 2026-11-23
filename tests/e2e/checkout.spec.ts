import { expect, type Page, test } from '@playwright/test'

// mesma regex da régua F1 (cardapio.paridade.mjs L399): CPF com e sem máscara (casa também telefone de 11 dígitos)
const REGEX_CPF = /\d{3}\.?\d{3}\.?\d{3}-?\d{2}/
const TITULO_CHECKOUT = 'Quase lá — falta só a gente saber quem é você'
const ERRO_CPF = 'Esse CPF não confere. Dá uma olhadinha nos números?'

function coletarMensagens(page: Page): string[] {
  const mensagens: string[] = []
  page.on('console', (m) => mensagens.push(m.text()))
  page.on('pageerror', (e) => mensagens.push(String(e)))
  return mensagens
}

function cartaoDaPizza(page: Page, nomePizza: string) {
  return page
    .locator('main div')
    .filter({ has: page.getByRole('heading', { name: nomePizza }) })
    .filter({ has: page.getByRole('button', { name: 'Adicionar', exact: true }) })
    .last()
}

async function adicionar(page: Page, nomePizza: string) {
  await cartaoDaPizza(page, nomePizza).getByRole('button', { name: 'Adicionar', exact: true }).click()
}

async function irAoCardapio(page: Page) {
  await page.goto('/')
  await page.getByRole('button', { name: 'Ver o cardápio' }).click()
  await expect(page.getByRole('heading', { name: 'Nossas pizzas' })).toBeVisible()
}

// Margherita M + Calabresa G (= EXEMPLO do mockup): subtotal R$ 105,00, frete grátis
async function irAoCheckoutComDoisItens(page: Page) {
  await irAoCardapio(page)
  await adicionar(page, 'Margherita da casa')
  await page.getByRole('button', { name: /^G/ }).nth(1).click() // Calabresa (2ª pizza) -> G
  await adicionar(page, 'Calabresa da Dona')
  await expect(page.getByRole('complementary').getByText('2 pizzas no carrinho')).toBeVisible()
  await page.getByRole('button', { name: 'Finalizar pedido' }).click()
  await expect(page.getByRole('heading', { name: TITULO_CHECKOUT })).toBeVisible()
}

async function preencherNomeETelefone(page: Page) {
  await page.getByLabel('Seu nome').fill('Ana Exemplo')
  await page.getByLabel('Telefone (com DDD)').pressSequentially('11900000000')
  await expect(page.getByLabel('Telefone (com DDD)')).toHaveValue('(11) 90000-0000')
}

test.describe('Checkout — Finalizar pedido com CPF na nota', () => {
  test('com CPF: erros, máscaras, confirmação mascarada e guardas de LGPD', async ({ page }) => {
    const mensagens = coletarMensagens(page)
    await irAoCheckoutComDoisItens(page)

    const aside = page.getByRole('complementary')
    await expect(aside.getByText('Margherita da casa')).toBeVisible()
    await expect(aside.getByText('Calabresa da Dona')).toBeVisible()
    await expect(aside.getByText('Grátis', { exact: true })).toBeVisible()
    await expect(aside.getByText('R$ 105,00', { exact: true })).toHaveCount(2) // Subtotal e Total

    const confirmar = page.getByRole('button', { name: 'Confirmar pedido · R$ 105,00' })
    await confirmar.click()
    await expect(page.getByText('Conta pra gente seu nome.')).toBeVisible()
    await expect(page.getByText('A gente precisa de um telefone com DDD.')).toBeVisible()

    await preencherNomeETelefone(page)
    await page.getByRole('checkbox', { name: 'Quero CPF na nota' }).click()
    const cpf = page.getByLabel('CPF', { exact: true })
    await cpf.pressSequentially('12345678900')
    await expect(cpf).toHaveValue('123.456.789-00')
    await expect(page.getByText(ERRO_CPF)).toBeVisible()
    await cpf.fill('')
    await cpf.pressSequentially('12345678909')
    await expect(page.getByText(ERRO_CPF)).toHaveCount(0)

    await confirmar.click()
    await expect(page.getByText('Sua pizza já vai pro forno!')).toBeVisible()
    await expect(page.getByText('Pedido #1234', { exact: true })).toBeVisible()
    await expect(page.getByText('CPF na nota: ***.456.789-**', { exact: true })).toBeVisible()

    // LGPD
    expect(mensagens.filter((m) => REGEX_CPF.test(m))).toEqual([])
    expect(mensagens.filter((m) => m.includes('Ana Exemplo') || m.includes('90000-0000'))).toEqual([])
    const url = new URL(page.url())
    expect(url.pathname).toBe('/')
    expect(url.search).toBe('')
    expect(url.hash).toBe('')
    expect(page.url()).not.toContain('12345678909')
    expect(await page.evaluate(() => localStorage.length + sessionStorage.length)).toBe(0)
    const html = await page.content()
    expect(html).not.toMatch(REGEX_CPF)
    expect(html).not.toContain('Ana Exemplo')
    expect(html).not.toContain('90000-0000')

    await page.getByRole('button', { name: 'Voltar para o início' }).click() // P-2 -> A
    await expect(page.getByRole('heading', { name: 'Pizza artesanal, feita como em casa' })).toBeVisible()
  })

  test('sem CPF: a confirmação não tem "CPF na nota"', async ({ page }) => {
    await irAoCheckoutComDoisItens(page)
    await preencherNomeETelefone(page)
    await page.getByRole('button', { name: 'Confirmar pedido · R$ 105,00' }).click()
    await expect(page.getByText('Pedido #1234', { exact: true })).toBeVisible()
    await expect(page.getByText(/CPF na nota/)).toHaveCount(0)
  })

  test('"← Voltar ao cardápio" e "Alterar pedido" voltam ao Cardápio com o carrinho', async ({ page }) => {
    await irAoCheckoutComDoisItens(page)
    await page.getByRole('button', { name: '← Voltar ao cardápio' }).click()
    await expect(page.getByRole('complementary').getByText('2 pizzas no carrinho')).toBeVisible()

    await page.getByRole('button', { name: 'Finalizar pedido' }).click()
    await expect(page.getByRole('heading', { name: TITULO_CHECKOUT })).toBeVisible()
    await page.getByRole('button', { name: 'Alterar pedido' }).click()
    await expect(page.getByRole('complementary').getByText('2 pizzas no carrinho')).toBeVisible()
  })

  test('carrinho vazio: não há "Finalizar pedido"', async ({ page }) => {
    await irAoCardapio(page)
    await expect(page.getByRole('button', { name: 'Finalizar pedido' })).toHaveCount(0)
  })
})
