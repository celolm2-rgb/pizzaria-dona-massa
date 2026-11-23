import { expect, type Page, test } from '@playwright/test'

async function irParaCardapio(page: Page) {
  await page.goto('/')
  await page.getByRole('button', { name: 'Ver o cardápio' }).click()
  await expect(page.getByRole('heading', { name: 'Nossas pizzas' })).toBeVisible()
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

function painel(page: Page) {
  return page.getByRole('complementary')
}

test.describe('Carrinho — adicionar, quantidade, frete', () => {
  test('carrinho começa vazio', async ({ page }) => {
    await irParaCardapio(page)

    await expect(page.getByText('Seu carrinho ainda está vazio')).toBeVisible()
    await expect(painel(page).getByText('Nenhuma pizza ainda')).toBeVisible()
  })

  test('adicionar 1 Margherita M mostra item, subtotal e frete pago', async ({ page }) => {
    await irParaCardapio(page)
    await adicionar(page, 'Margherita da casa')

    await expect(painel(page).getByText('1 pizza no carrinho')).toBeVisible()
    await expect(painel(page).getByText('Margherita da casa')).toBeVisible()
    await expect(painel(page).getByText('Tamanho M')).toBeVisible()
    await expect(painel(page).getByText('R$ 45,00', { exact: true }).first()).toBeVisible() // subtotal ou total do item
    await expect(painel(page).getByText('R$ 12,00')).toBeVisible() // entrega paga
    await expect(painel(page).getByText('R$ 57,00')).toBeVisible() // total
    await expect(painel(page).getByText('para frete grátis')).toBeVisible()
  })

  test('incrementar até 3 unidades libera frete grátis', async ({ page }) => {
    await irParaCardapio(page)
    await adicionar(page, 'Margherita da casa')

    const aumentar = page.getByRole('button', { name: 'Aumentar quantidade' })
    await aumentar.click()
    await aumentar.click()

    await expect(painel(page).getByText('3 pizzas no carrinho')).toBeVisible()
    await expect(painel(page).getByText('R$ 135,00', { exact: true }).first()).toBeVisible() // subtotal ou total geral
    await expect(painel(page).getByText('Frete grátis liberado!')).toBeVisible()
    await expect(painel(page).getByText('Grátis', { exact: true })).toBeVisible()
  })

  test('decrementar de volta a 2 unidades cobra frete novamente', async ({ page }) => {
    await irParaCardapio(page)
    await adicionar(page, 'Margherita da casa')

    const aumentar = page.getByRole('button', { name: 'Aumentar quantidade' })
    await aumentar.click()
    await aumentar.click()

    await page.getByRole('button', { name: 'Diminuir quantidade' }).click()

    await expect(painel(page).getByText('R$ 90,00').first()).toBeVisible() // subtotal com 2 unidades
    await expect(painel(page).getByText('R$ 12,00')).toBeVisible() // entrega voltou a ser paga
    await expect(painel(page).getByText('para frete grátis')).toBeVisible()
  })

  test('remover o item volta o carrinho ao estado vazio', async ({ page }) => {
    await irParaCardapio(page)
    await adicionar(page, 'Margherita da casa')

    await page.getByRole('button', { name: 'tirar' }).click()

    await expect(page.getByText('Seu carrinho ainda está vazio')).toBeVisible()
  })
})
