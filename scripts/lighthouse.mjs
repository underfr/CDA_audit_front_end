// Audite les pages principales avec Lighthouse, sur un serveur déjà lancé, puis échoue si un score passe sous le seuil.
// Identifiants : cypress.env.json en local, secrets CYPRESS_* dans GitHub Actions.
import { appendFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { chromium } from '@playwright/test'
import lighthouse from 'lighthouse'

const BASE_URL = process.env.LIGHTHOUSE_URL ?? 'http://localhost:3000'
const DEBUG_PORT = 9222
const REPORT_DIR = 'lighthouse-report'
const RUNS = 3 // on garde la mesure médiane : deux runs ne donnent jamais exactement le même score

const MIN_SCORES = { performance: 0.8, accessibility: 0.9, 'best-practices': 0.9 }

const PUBLIC_PAGES = [{ name: 'connexion', path: '/login' }]
const CONNECTED_PAGES = [
    { name: 'tableau-de-bord', path: '/dashboard' },
    { name: 'tickets', path: '/tickets' },
    { name: 'nouveau-ticket', path: '/tickets/new' },
]

const local = existsSync('cypress.env.json') ? JSON.parse(readFileSync('cypress.env.json', 'utf8')) : {}
const email = process.env.CYPRESS_COLLABORATOR_EMAIL || local.COLLABORATOR_EMAIL
const password = process.env.CYPRESS_COLLABORATOR_PASSWORD || local.COLLABORATOR_PASSWORD
if (!email || !password) {
    console.error('COLLABORATOR_EMAIL / COLLABORATOR_PASSWORD manquants : ajoute-les dans cypress.env.json (ou en secrets CYPRESS_* sur GitHub).')
    process.exit(1)
}

// Profil persistant : Lighthouse ouvre ses onglets dans ce même profil, donc avec la session Firebase
const profile = mkdtempSync(join(tmpdir(), 'lighthouse-'))
const context = await chromium.launchPersistentContext(profile, {
    channel: 'chromium',
    args: [`--remote-debugging-port=${DEBUG_PORT}`],
})
const page = await context.newPage()
const cdp = await context.newCDPSession(page)

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
// Résultats bruts, transformés en rapport par scripts/test-report.mjs
mkdirSync('reports', { recursive: true })
writeFileSync('reports/lighthouse.json', JSON.stringify({ minScores: MIN_SCORES, results }))

const percent = (score) => (score === null ? 'erreur' : Math.round(score * 100))
const table = [
    `| Page | ${Object.keys(MIN_SCORES).join(' | ')} |`,
    `|---|${Object.keys(MIN_SCORES).map(() => '---').join('|')}|`,
    ...results.map(({ path, scores }) => `| ${path} | ${Object.values(scores).map(percent).join(' | ')} |`),
    '',
    `Seuils : ${Object.entries(MIN_SCORES).map(([id, min]) => `${id} ${min * 100}`).join(', ')}`,
].join('\n')
console.log(table)
if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, `## Lighthouse\n\n${table}\n`)

const failures = results.flatMap(({ path, scores }) =>
    Object.entries(scores)
        .filter(([id, score]) => score === null || score < MIN_SCORES[id])
        .map(([id, score]) => `${path} : ${id} à ${percent(score)}, seuil ${MIN_SCORES[id] * 100}`))
if (failures.length) {
    console.error(`\nScores sous le seuil :\n${failures.join('\n')}`)
    process.exitCode = 1
}