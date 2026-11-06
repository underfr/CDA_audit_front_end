/**
 * @file Audits the main pages with Lighthouse on an already running server, then fails if a score
 * falls below its threshold. Credentials come from `cypress.env.json` locally and from the
 * `CYPRESS_*` secrets in GitHub Actions.
 */

import { appendFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { chromium } from '@playwright/test'
import lighthouse from 'lighthouse'

/**
 * Page to audit.
 *
 * @typedef {object} AuditTarget
 * @property {string} name - Name of the HTML report, without extension.
 * @property {string} path - Path of the page.
 */

/**
 * Scores kept for an audited page.
 *
 * @typedef {object} AuditResult
 * @property {string} name - Name of the HTML report, without extension.
 * @property {string} path - Path of the page.
 * @property {Record<string, number|null>} scores - Score of each category from 0 to 1, or `null` on error.
 */

/** URL of the server to audit. */
const BASE_URL = process.env.LIGHTHOUSE_URL ?? 'http://localhost:3000'
/** Remote debugging port shared by Chromium and Lighthouse. */
const DEBUG_PORT = 9222
/** Directory receiving the HTML reports. */
const REPORT_DIR = 'lighthouse-report'
/** Number of audits per page; the median is kept because two runs never give exactly the same score. */
const RUNS = 3

/**
 * Minimum score of each audited category, from 0 to 1.
 *
 * @type {Record<string, number>}
 */
const MIN_SCORES = { performance: 0.8, accessibility: 0.9, 'best-practices': 0.9 }

/**
 * Pages audited before signing in.
 *
 * @type {AuditTarget[]}
 */
const PUBLIC_PAGES = [{ name: 'connexion', path: '/login' }]
/**
 * Pages audited after signing in.
 *
 * @type {AuditTarget[]}
 */
const CONNECTED_PAGES = [
    { name: 'tableau-de-bord', path: '/dashboard' },
    { name: 'tickets', path: '/tickets' },
    { name: 'nouveau-ticket', path: '/tickets/new' },
]

/** Contents of `cypress.env.json`, or an empty object when the file does not exist. */
const local = existsSync('cypress.env.json') ? JSON.parse(readFileSync('cypress.env.json', 'utf8')) : {}
/** E-mail address of the collaborator test account. */
const email = process.env.CYPRESS_COLLABORATOR_EMAIL || local.COLLABORATOR_EMAIL
/** Password of the collaborator test account. */
const password = process.env.CYPRESS_COLLABORATOR_PASSWORD || local.COLLABORATOR_PASSWORD
if (!email || !password) {
    console.error('COLLABORATOR_EMAIL / COLLABORATOR_PASSWORD manquants : ajoute-les dans cypress.env.json (ou en secrets CYPRESS_* sur GitHub).')
    process.exit(1)
}

/** Temporary persistent profile: Lighthouse opens its tabs in it, and so shares the Firebase session. */
const profile = mkdtempSync(join(tmpdir(), 'lighthouse-'))
/** Chromium instance using this profile, with its debugging port open to Lighthouse. */
const context = await chromium.launchPersistentContext(profile, {
    channel: 'chromium',
    args: [`--remote-debugging-port=${DEBUG_PORT}`],
})
/** Tab used to sign in. */
const page = await context.newPage()
/** DevTools session used to clear the browser cache between runs. */
const cdp = await context.newCDPSession(page)

/**
 * Audits a page `RUNS` times and writes the HTML report of the median run, by performance score.
 *
 * @param {AuditTarget} target - Page to audit.
 * @returns {Promise<AuditResult>} The scores of the median run.
 * @throws {Error} If the page redirects elsewhere, for example to `/login` without a session.
 */
async function audit({ name, path }) {
    const runs = []
    for (let i = 0; i < RUNS; i++) {
        // disableStorageReset garde la session, mais aussi le cache : on le vide pour mesurer un premier chargement
        await cdp.send('Network.clearBrowserCache')
        const { lhr, report } = await lighthouse(BASE_URL + path, {
            port: DEBUG_PORT,
            output: 'html',
            logLevel: 'error',
            onlyCategories: Object.keys(MIN_SCORES),
            disableStorageReset: true,
            // Le dépôt est public : pas de capture d'écran dans les rapports (noms, tickets affichés)
            disableFullPageScreenshot: true,
            skipAudits: ['final-screenshot', 'screenshot-thumbnails'],
        })
        // Sans session, une page connectée redirige vers /login : on noterait la mauvaise page sans le voir
        if (new URL(lhr.finalDisplayedUrl).pathname !== path) {
            throw new Error(`${path} a redirigé vers ${lhr.finalDisplayedUrl}`)
        }
        runs.push({ lhr, report })
    }
    runs.sort((a, b) => a.lhr.categories.performance.score - b.lhr.categories.performance.score)
    const { lhr, report } = runs[Math.floor(RUNS / 2)]
    writeFileSync(join(REPORT_DIR, `${name}.html`), report)
    return { name, path, scores: Object.fromEntries(Object.keys(MIN_SCORES).map((id) => [id, lhr.categories[id].score])) }
}

/**
 * Results of the audited pages.
 *
 * @type {AuditResult[]}
 */
let results = []
try {
    mkdirSync(REPORT_DIR, { recursive: true })
    for (const target of PUBLIC_PAGES) results.push(await audit(target))

    await page.goto(`${BASE_URL}/login`)
    await page.fill('#login-email', email)
    await page.fill('#login-password', password)
    await page.click("button[type='submit']")
    await page.waitForURL('**/dashboard')
    await page.goto('about:blank') // cet onglet ne doit pas consommer de CPU pendant les mesures

    for (const target of CONNECTED_PAGES) results.push(await audit(target))
} finally {
    await context.close()
    rmSync(profile, { recursive: true, force: true })
}
// Raw results, turned into a report by scripts/test-report.mjs
mkdirSync('reports', { recursive: true })
writeFileSync('reports/lighthouse.json', JSON.stringify({ minScores: MIN_SCORES, results }))

/**
 * Formats a score for display.
 *
 * @param {number|null} score - Score from 0 to 1, or `null` on error.
 * @returns {number|string} The score out of 100, or `erreur`.
 */
const percent = (score) => (score === null ? 'erreur' : Math.round(score * 100))
/** Markdown table of the scores, printed and added to the GitHub Actions summary. */
const table = [
    `| Page | ${Object.keys(MIN_SCORES).join(' | ')} |`,
    `|---|${Object.keys(MIN_SCORES).map(() => '---').join('|')}|`,
    ...results.map(({ path, scores }) => `| ${path} | ${Object.values(scores).map(percent).join(' | ')} |`),
    '',
    `Seuils : ${Object.entries(MIN_SCORES).map(([id, min]) => `${id} ${min * 100}`).join(', ')}`,
].join('\n')
console.log(table)
if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, `## Lighthouse\n\n${table}\n`)

/** Description of each score below its threshold. */
const failures = results.flatMap(({ path, scores }) =>
    Object.entries(scores)
        .filter(([id, score]) => score === null || score < MIN_SCORES[id])
        .map(([id, score]) => `${path} : ${id} à ${percent(score)}, seuil ${MIN_SCORES[id] * 100}`))
if (failures.length) {
    console.error(`\nScores sous le seuil :\n${failures.join('\n')}`)
    process.exitCode = 1
}