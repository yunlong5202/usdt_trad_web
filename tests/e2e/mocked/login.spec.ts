import { test, expect } from '@playwright/test'
import { installLoginMocks, CAPTCHA_ANSWER } from './fixtures'

/**
 * Signing in.
 *
 * 91% of the people who open this deployment land here, and until now nothing
 * executed it: every other spec starts by planting a cookie, which skips the
 * page entirely. The gap was invisible because the suite was green -- it was
 * green about everything except the one screen most visitors see.
 *
 * These tests deliberately do NOT call authenticate(). A token in the jar sends
 * the guard straight to '/', so a signed-in fixture cannot reach this page.
 */
test.describe('signing in', () => {
  test.beforeEach(async({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 })
  })

  test('the form arrives without demo credentials, with a captcha to solve', async({ page }) => {
    const calls = await installLoginMocks(page)
    await page.goto('/#/login')

    // Production login never ships demo credentials.
    await expect(page.locator('input[name=username]')).toHaveValue('')
    await expect(page.locator('input[name=password]')).toHaveValue('')
    await expect(page.locator('input[name=code]')).toHaveValue('')

    // Rendered, not merely requested: the page binds the payload to <img src>,
    // so a broken response leaves an element that exists but shows nothing.
    const image = page.locator('.captcha-img')
    await expect(image).toBeVisible()
    expect(await image.evaluate((el: HTMLImageElement) => el.naturalWidth)).toBeGreaterThan(0)
    expect(calls.captcha).toBe(1)
  })

  test('clicking the captcha issues a new challenge', async({ page }) => {
    const calls = await installLoginMocks(page)
    await page.goto('/#/login')
    await expect(page.locator('.captcha-img')).toBeVisible()

    await page.locator('.captcha-wrap').click()
    await expect.poll(() => calls.captcha).toBe(2)

    // A refresh that reuses the previous id would look identical on screen and
    // fail on the server, so the id is what this checks.
    await page.locator('input[name=username]').fill('admin')
    await page.locator('input[name=password]').fill('123456')
    await expect(page.locator('.submit-btn')).toBeEnabled()
    await page.locator('input[name=code]').fill(CAPTCHA_ANSWER)
    await page.locator('.submit-btn').click()
    await expect.poll(() => calls.lastLogin?.uuid).toBe('e2e-captcha-2')
  })

  test('the attempt carries the captcha id the image was issued under', async({ page }) => {
    const calls = await installLoginMocks(page)
    await page.goto('/#/login')
    await expect(page.locator('.captcha-img')).toBeVisible()

    await page.locator('input[name=username]').fill('admin')
    await page.locator('input[name=password]').fill('123456')
    await expect(page.locator('.submit-btn')).toBeEnabled()
    await page.locator('input[name=code]').fill(CAPTCHA_ANSWER)
    await page.locator('.submit-btn').click()

    await expect.poll(() => calls.login).toBe(1)
    // Dropping uuid is the classic way this breaks: the request still looks
    // well-formed and the server rejects every attempt.
    expect(calls.lastLogin).toMatchObject({
      username: 'admin',
      password: '123456',
      code: CAPTCHA_ANSWER,
      uuid: 'e2e-captcha-1'
    })
  })

  test('a good attempt lands on the dashboard', async({ page }) => {
    const calls = await installLoginMocks(page)
    await page.goto('/#/login')
    await expect(page.locator('.captcha-img')).toBeVisible()

    await page.locator('input[name=username]').fill('admin')
    await page.locator('input[name=password]').fill('123456')
    await expect(page.locator('.submit-btn')).toBeEnabled()
    await page.locator('input[name=code]').fill(CAPTCHA_ANSWER)
    await page.locator('.submit-btn').click()

    // Through the guard, which fetches the profile and builds the routes.
    await expect(page).toHaveURL(/#\/(dashboard)?$/)
    await expect(page.locator('.sidebar-container')).toBeVisible()

    // Exactly once each: the guard reads roles off the store after the first
    // call, so a second fetch would mean the session was rebuilt -- the shape
    // the 502 loop took, where a token survived a failed profile lookup.
    expect(calls.getinfo, 'profile fetched once').toBe(1)
    expect(calls.menurole, 'routes built once').toBe(1)
  })

  test('a redirect is honoured after signing in', async({ page }) => {
    await installLoginMocks(page)
    // The shape the guard produces when an unauthenticated visitor asks for a
    // page: next(`/login?redirect=${to.path}`).
    await page.goto('/#/login?redirect=/admin/sys-user')
    await expect(page.locator('.captcha-img')).toBeVisible()

    await page.locator('input[name=username]').fill('admin')
    await page.locator('input[name=password]').fill('123456')
    await expect(page.locator('.submit-btn')).toBeEnabled()
    await page.locator('input[name=code]').fill(CAPTCHA_ANSWER)
    await page.locator('.submit-btn').click()

    await expect(page).toHaveURL(/#\/admin\/sys-user/)
  })

  test('a rejected attempt stays put and re-issues the captcha', async({ page }) => {
    const calls = await installLoginMocks(page)
    await page.goto('/#/login')
    await expect(page.locator('.captcha-img')).toBeVisible()

    await page.locator('input[name=username]').fill('admin')
    await page.locator('input[name=password]').fill('123456')
    await expect(page.locator('.submit-btn')).toBeEnabled()
    await page.locator('input[name=code]').fill('0000')
    await page.locator('.submit-btn').click()

    await expect.poll(() => calls.login).toBe(1)
    // A spent captcha cannot be retried, so the page must fetch another one --
    // otherwise the second attempt fails for a reason the user cannot see.
    await expect.poll(() => calls.captcha).toBe(2)
    await expect(page).toHaveURL(/#\/login/)

    // And the button has to come back, or the form is dead after one mistake.
    await expect(page.locator('.submit-btn')).toBeEnabled()
    await expect(page.locator('.submit-btn')).toHaveText('登录')
  })

  test('an invalid Google code stays visible and a fresh code can be retried', async({ page }) => {
    const calls = await installLoginMocks(page)
    await page.route('**/api/v1/usdt/auth-config*', route => route.fulfill({
      json: { code: 200, data: { totp_enabled: route.request().url().includes('username=admin') }}
    }))
    let rejected = 0
    await page.route('**/api/v1/login', async route => {
      const payload = route.request().postDataJSON()
      if (payload.totp_code !== '123456') {
        rejected++
        await route.fulfill({ json: { code: 401, msg: '谷歌验证码错误', data: null }})
        return
      }
      await route.fallback()
    })
    await page.goto('/#/login')
    await page.locator('input[name=username]').fill('admin')
    await page.locator('input[name=password]').fill('123456')
    await expect(page.locator('input[name=totp_code]')).toBeVisible()
    await page.locator('input[name=code]').fill(CAPTCHA_ANSWER)
    await page.locator('input[name=totp_code]').fill('000000')
    await page.locator('.submit-btn').click()

    await expect(page.locator('.el-message--error')).toContainText('谷歌验证码错误')
    await expect(page.locator('input[name=username]')).toHaveValue('admin')
    await expect(page.locator('input[name=password]')).toHaveValue('123456')
    await expect(page.locator('input[name=code]')).toHaveValue('')
    await expect(page.locator('input[name=totp_code]')).toHaveValue('')
    await expect.poll(() => calls.captcha).toBe(2)
    expect(rejected).toBe(1)
    await expect(page.locator('.submit-btn')).toBeEnabled()

    await page.locator('input[name=code]').fill(CAPTCHA_ANSWER)
    await page.locator('input[name=totp_code]').fill('123456')
    await page.locator('.submit-btn').click()
    await expect(page).toHaveURL(/#\/(dashboard)?$/)
    expect(calls.lastLogin?.totp_code).toBe('123456')
  })
})

/**
 * The same page on a phone.
 *
 * The business introduction gives way to the form at phone widths.
 */
test.describe('signing in on a phone', () => {
  const PHONE = { width: 375, height: 812 }

  test('the screen is the form', async({ page }) => {
    await installLoginMocks(page)
    await page.setViewportSize(PHONE)
    await page.goto('/#/login')
    await expect(page.locator('.captcha-img')).toBeVisible()

    // The decorative half is gone, and with it the second copy of the product
    // name -- the form already opens with it.
    await expect(page.locator('.stage')).toBeHidden()
    await expect(page.locator('.panel-title')).toBeVisible()

    const submit = (await page.locator('.submit-btn').boundingBox())!
    // Reachable rather than merely present: it sat 110px from the bottom edge
    // with the terminal above it, which on a real phone is under the browser's
    // own chrome.
    expect(submit.y + submit.height, 'the submit button sits too low')
      .toBeLessThan(PHONE.height - 180)

    // And the form still fits without scrolling.
    const scrolls = await page.evaluate(() =>
      document.documentElement.scrollHeight > document.documentElement.clientHeight
    )
    expect(scrolls, 'the login form scrolls').toBe(false)
  })

  test('the deposit workflow introduces the workspace on a desktop', async({ page }) => {
    await installLoginMocks(page)
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/#/login')
    await expect(page.locator('.captcha-img')).toBeVisible()

    // It is the page's main visual where there is room for it.
    await expect(page.locator('.stage')).toBeVisible()
    await expect(page.locator('.payment-flow')).toBeVisible()
  })
})
