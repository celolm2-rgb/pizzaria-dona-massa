import { expect, test } from '@playwright/test'

test.describe('Navegação Home ↔ Cardápio', () => {
  test('Home exibe o hero principal', async ({ page }) => {
    await page.goto('/')

    await expect(
      page.getByRole('heading', { name: 'Pizza artesanal, feita como em casa' }),
    ).toBeVisible()
  })

  test('navega da Home para o Cardápio ao clicar em "Ver o cardápio"', async ({ page }) => {
    await page.goto('/')

    await page.getByRole('button', { name: 'Ver o cardápio' }).click()

    await expect(page.getByRole('heading', { name: 'Nossas pizzas' })).toBeVisible()
    await expect(
      page.getByRole('button', { name: 'Pizzaria Dona Massa' }),
    ).toBeVisible()
  })

  test('volta do Cardápio para a Home ao clicar no título', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Ver o cardápio' }).click()
    await expect(page.getByRole('heading', { name: 'Nossas pizzas' })).toBeVisible()

    await page.getByRole('button', { name: 'Pizzaria Dona Massa' }).click()

    await expect(
      page.getByRole('heading', { name: 'Pizza artesanal, feita como em casa' }),
    ).toBeVisible()
  })
})
