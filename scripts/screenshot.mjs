import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import { chromium } from 'playwright'
import { createServer } from 'vite'

const HOME_OUTPUT_PATH = path.resolve('design/atual-home.png')
const CARDAPIO_OUTPUT_PATH = path.resolve('design/atual-cardapio.png')

async function main() {
  const server = await createServer({ server: { port: 5183, strictPort: true } })
  await server.listen()
  const url = server.resolvedUrls.local[0]

  const browser = await chromium.launch()
  try {
    const page = await browser.newPage()
    await mkdir(path.dirname(HOME_OUTPUT_PATH), { recursive: true })

    await page.goto(url, { waitUntil: 'networkidle' })
    await page.screenshot({ path: HOME_OUTPUT_PATH, fullPage: true })
    console.log(`Screenshot salvo em ${HOME_OUTPUT_PATH}`)

    await page.getByRole('button', { name: 'Ver o cardápio' }).click()
    await page.waitForLoadState('networkidle')
    await page.screenshot({ path: CARDAPIO_OUTPUT_PATH, fullPage: true })
    console.log(`Screenshot salvo em ${CARDAPIO_OUTPUT_PATH}`)
  } finally {
    await browser.close()
    await server.close()
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
