// Transforme les résultats bruts d'une suite de tests en rapport Markdown : reports/<suite>.md
// Usage : node scripts/test-report.mjs e2e | a11y | lighthouse
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'

const TITLES = {
    e2e: 'Tests E2E (Cypress)',
    a11y: "Tests d'accessibilité (Playwright + axe)",
    lighthouse: 'Audit Lighthouse',
}
const suite = process.argv[2]
if (!TITLES[suite]) {
    console.error(`Suite inconnue : ${suite}. Valeurs possibles : ${Object.keys(TITLES).join(', ')}`)
    process.exit(1)
}

const source = `reports/${suite}.json`
const raw = existsSync(source) ? JSON.parse(readFileSync(source, 'utf8')) : null

const icon = (status) => (status === 'passed' ? '✅' : status === 'pending' || status === 'skipped' ? '⏭️' : '❌')
const cell = (text) => String(text).replaceAll('|', '\\|')
const cleanError = (message) => message
    .replace(/\x1b\[[0-9;]*m/g, '')
    .split('\n')
    .filter((line) => !/^\s*at /.test(line))
    .slice(0, 25)
    .join('\n')
    .trim()

// Chaque outil a son format : on le ramène à { group, title, status, duration, error }
function fromCypress(runs) {
    return runs.flatMap((run) => run.tests.map((test) => ({
        group: run.spec.name,
        title: test.title.slice(1).join(' › '),
        status: test.state,
        duration: test.duration,
        error: test.displayError,
    })))
}

function fromPlaywright(report) {
    const specs = (node) => [...(node.specs ?? []), ...(node.suites ?? []).flatMap(specs)]
    return (report.suites ?? []).flatMap((file) => specs(file).map((spec) => {
        const result = spec.tests[0]?.results.at(-1)
        return { group: file.title, title: spec.title, status: result?.status ?? 'skipped', duration: result?.duration, error: result?.error?.message }
    }))
}

function testsReport(tests) {
    const count = (test) => tests.filter(test).length
    const failed = tests.filter((test) => icon(test.status) === '❌')
    return {
        summary: `${failed.length ? '❌' : '✅'} ${count((t) => t.status === 'passed')} réussis, ${failed.length} échoués, ${count((t) => icon(t.status) === '⏭️')} ignorés`,
        body: [
            '| Fichier | Test | Résultat | Durée |',
            '|---|---|---|---|',
            ...tests.map((t) => `| ${cell(t.group)} | ${cell(t.title)} | ${icon(t.status)} | ${((t.duration ?? 0) / 1000).toFixed(1)} s |`),
            ...failed.flatMap((t) => ['', `### ❌ ${t.group} › ${t.title}`, '', '```text', cleanError(t.error ?? 'Pas de message.'), '```']),
        ],
    }
}

function lighthouseReport({ minScores, results }) {
    const ids = Object.keys(minScores)
    const score = (value, min) => (value === null ? '❌ erreur' : `${value >= min ? '✅' : '❌'} ${Math.round(value * 100)}`)
    const failed = results.flatMap((r) => ids.filter((id) => r.scores[id] === null || r.scores[id] < minScores[id]))
    return {
        summary: `${failed.length ? `❌ ${failed.length} score(s) sous le seuil` : '✅ Tous les scores atteignent le seuil'}`,
        body: [
            `| Page | ${ids.join(' | ')} |`,
            `|---|${ids.map(() => '---').join('|')}|`,
            ...results.map((r) => `| ${r.path} | ${ids.map((id) => score(r.scores[id], minScores[id])).join(' | ')} |`),
            '',
            `Seuils : ${ids.map((id) => `${id} ${Math.round(minScores[id] * 100)}`).join(', ')}`,
        ],
    }
}

function buildReport() {
    if (suite === 'lighthouse' && raw) return lighthouseReport(raw)
    const tests = !raw ? [] : suite === 'e2e' ? fromCypress(raw) : fromPlaywright(raw)
    // Pas de résultat = le run s'est arrêté avant ou pendant les tests : on ne doit surtout pas afficher un succès
    if (!tests.length) return { summary: "❌ Aucun résultat : le run s'est arrêté avant la fin des tests", body: [] }
    return testsReport(tests)
}

// Le rapport part dans un dépôt public : aucun secret ni e-mail ne doit y rester
function sanitize(text) {
    for (const [name, value] of Object.entries(process.env)) {
        if (value && /^(CYPRESS_|NUXT_PUBLIC_FIREBASE_)/.test(name)) text = text.replaceAll(value, '***')
    }
    return text.replace(/[\w.+-]+@[\w-]+\.[\w.-]+/g, '***@***')
}

const { GITHUB_HEAD_REF, GITHUB_REF_NAME, GITHUB_REPOSITORY, GITHUB_RUN_ID, GITHUB_SERVER_URL, GITHUB_SHA, REPORT_SHA } = process.env
const { summary, body } = buildReport()
const lines = [
    `# ${TITLES[suite]}`,
    '',
    `- **Résultat :** ${summary}`,
    `- **Date :** ${new Date().toISOString().slice(0, 16).replace('T', ' ')} UTC`,
    `- **Branche :** ${GITHUB_HEAD_REF || GITHUB_REF_NAME || 'local'}`,
    `- **Commit :** ${REPORT_SHA || GITHUB_SHA || 'local'}`,
    ...(GITHUB_RUN_ID ? [`- **Run :** ${GITHUB_SERVER_URL}/${GITHUB_REPOSITORY}/actions/runs/${GITHUB_RUN_ID}`] : []),
    '',
    ...body,
    '',
]
mkdirSync('reports', { recursive: true })
writeFileSync(`reports/${suite}.md`, sanitize(lines.join('\n')))
console.log(`Rapport écrit : reports/${suite}.md (${summary})`)