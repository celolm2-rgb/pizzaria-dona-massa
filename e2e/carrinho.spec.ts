import { expect, type Page, test } from '@playwright/test'

async function irParaCardapio(page: Page) {
  await page.goto('/')
  await page.getByRole('button', { name: 'Ver o cardápio' }).click()
  await expect(page.getByRole('heading', { name: 'Nossas pizzas' })).toBeVisible()
}

function cartaoDaPizza(page: Page, nomePizza: string) {
  return page.locator('div').filter({ has: page.getByRole('heading', { name: nomePizza }) }).first()
}

test.describe('Carrinho — adicionar, quantidade, frete', () => {
  test('carrinho começa vazio', async ({ page }) => {
    await irParaCardapio(page)

    await expect(page.getByText('Seu pedido está vazio')).toBeVisible()
  })

  test('adicionar 1 Margherita M mostra item, subtotal e frete pago', async ({ page }) => {
    await irParaCardapio(page)

    await cartaoDaPizza(page, 'Margherita da casa')
      .getByRole('button', { name: /Adicionar/ })
      .first()
      .click()

    const painel = page.getByRole('heading', { name: 'Seu pedido' }).locator('..')
    await expect(painel.getByText('Margherita da casa')).toBeVisible()
    await expect(painel.getByText('Tamanho M')).toBeVisible()
    await expect(painel.getByText('R$ 45,00').first()).toBeVisible() // subtotal ou total do item
    await expect(painel.getByText('R$ 12,00')).toBeVisible() // frete pago
    await expect(painel.getByText('R$ 57,00')).toBeVisible() // total
    await expect(painel.getByText('para o frete grátis')).toBeVisible()
  })

  test('incrementar até 3 unidades libera frete grátis', async ({ page }) => {
    await irParaCardapio(page)
    await cartaoDaPizza(page, 'Margherita da casa')
      .getByRole('button', { name: /Adicionar/ })
      .first()
      .click()

    const aumentar = page.getByRole('button', { name: 'Aumentar quantidade' })
    await aumentar.click()
    await aumentar.click()

    const painel = page.getByRole('heading', { name: 'Seu pedido' }).locator('..')
    await expect(painel.getByText('R$ 135,00').first()).toBeVisible() // subtotal ou total geral
    await expect(painel.getByText('Você ganhou frete grátis')).toBeVisible()
    await expect(painel.getByText('Grátis').first()).toBeVisible()
  })

  test('decrementar de volta a 2 unidades cobra frete novamente', async ({ page }) => {
    await irParaCardapio(page)
    await cartaoDaPizza(page, 'Margherita da casa')
      .getByRole('button', { name: /Adicionar/ })
      .first()
      .click()

    const aumentar = page.getByRole('button', { name: 'Aumentar quantidade' })
    await aumentar.click()
    await aumentar.click()

    await page.getByRole('button', { name: 'Diminuir quantidade' }).click()

    const painel = page.getByRole('heading', { name: 'Seu pedido' }).locator('..')
    await expect(painel.getByText('R$ 90,00').first()).toBeVisible() // subtotal com 2 unidades
    await expect(painel.getByText('R$ 12,00')).toBeVisible() // frete voltou a ser pago
    await expect(painel.getByText('para o frete grátis')).toBeVisible()
  })

  test('remover o item volta o carrinho ao estado vazio', async ({ page }) => {
    await irParaCardapio(page)
    await cartaoDaPizza(page, 'Margherita da casa')
      .getByRole('button', { name: /Adicionar/ })
      .first()
      .click()

    await page.getByTitle('Tirar do pedido').click()

    await expect(page.getByText('Seu pedido está vazio')).toBeVisible()
  })
})
