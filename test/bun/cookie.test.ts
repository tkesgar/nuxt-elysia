import { load } from 'cheerio'
import { describe, it, expect } from 'bun:test'

describe('cookie', () => {
  it('should not receive the secret cookie', async () => {
    const response = await fetch('http://localhost:3000/secret-cookie')
    const html = await response.text()

    const content = load(html)('#secretCookie').text().trim()
    expect(content).toBe('Secret cookie: -')
  })

  it('should receive the secret cookie', async () => {
    const response = await fetch('http://localhost:3000/secret-cookie', {
      headers: {
        Cookie: `secret=abc123`,
      },
    })
    const html = await response.text()

    const content = load(html)('#secretCookie').text().trim()
    expect(content).toBe('Secret cookie: abc123')
  })
})
