/**
 * @file Turns the raw results of a test suite into a Markdown report: `reports/<suite>.md`.
 * Usage: `node scripts/test-report.mjs e2e | a11y | lighthouse`
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'

/**
 * Test result in the format shared by all the tools.
 *
 * @typedef {object} NormalizedTest
 * @property {string} group - Spec file or suite containing the test.
 * @property {string} title - Title of the test.
 * @property {string} status - Result given by the tool, for example `passed`, `failed` or `skipped`.
 * @property {number} [duration] - Duration in milliseconds.
 * @property {string} [error] - Failure message.
 */

/**
 * Generated content of a report.
 *
 * @typedef {object} ReportContent
 * @property {string} summary - One-line result.
 * @property {string[]} body - Markdown lines of the details.
 */

/**
 * Report title of each supported suite.
 *
 * @type {Record<string, string>}
 */
const TITLES = {
    e2e: 'Tests E2E (Cypress)',
    a11y: "Tests d'accessibilité (Playwright + axe)",
    lighthouse: 'Audit Lighthouse',
}
/** Suite requested on the command line. */
const suite = process.argv[2]
if (!TITLES[suite]) {
    console.error(`Suite inconnue : ${suite}. Valeurs possibles : ${Object.keys(TITLES).join(', ')}`)
    process.exit(1)
}

/** Path of the raw results of the suite. */
const source = `reports/${suite}.json`
/** Raw results of the suite, or `null` when the file does not exist. */
const raw = existsSync(source) ? JSON.parse(readFileSync(source, 'utf8')) : null

/**
 * Gives the icon of a test status.
 *
 * @param {string} status - Result given by the tool.
 * @returns {string} ✅ when passed, ⏭️ when pending or skipped, otherwise ❌.
 */
const icon = (status) => (status === 'passed' ? '✅' : status === 'pending' || status === 'skipped' ? '⏭️' : '❌')
/**
 * Escapes a value for a Markdown table cell.
 *
 * @param {*} text - Value to display.
 * @returns {string} The text with its pipes escaped.
 */
const cell = (text) => String(text).replaceAll('|', '\\|')
/**
 * Makes a failure message readable: removes the colour codes and the stack trace.
 *
 * @param {string} message - Raw failure message.
 * @returns {string} The first 25 remaining lines.
 */
const cleanError = (message) => message
    .replace(/\x1b\[[0-9;]*m/g, '')
    .split('\n')
    .filter((line) => !/^\s*at /.test(line))
    .slice(0, 25)
    .join('\n')
    .trim()

/**
 * Converts the Cypress results to the shared format.
 *
 * @param {object[]} runs - `runs` property of the Cypress `after:run` results.
 * @returns {NormalizedTest[]} The tests of all the runs.
 */
function fromCypress(runs) {
    return runs.flatMap((run) => run.tests.map((test) => ({
        group: run.spec.name,
        title: test.title.slice(1).join(' › '),
        status: test.state,
        duration: test.duration,
        error: test.displayError,
    })))
}

/**
 * Converts the Playwright JSON report to the shared format, keeping the last retry of each test.
 *
 * @param {object} report - Playwright JSON report.
 * @returns {NormalizedTest[]} The tests of all the files.
 */
function fromPlaywright(report) {
    /**
     * Collects the specs of a suite and of its nested suites.
     *
     * @param {object} node - File or suite of the report.
     * @returns {object[]} The specs found.
     */
    const specs = (node) => [...(node.specs ?? []), ...(node.suites ?? []).flatMap(specs)]
    return (report.suites ?? []).flatMap((file) => specs(file).map((spec) => {
        const result = spec.tests[0]?.results.at(-1)
        return { group: file.title, title: spec.title, status: result?.status ?? 'skipped', duration: result?.duration, error: result?.error?.message }
    }))
}

/**
 * Builds the report of a test suite: the counters, a results table and the details of each failure.
 *
 * @param {NormalizedTest[]} tests - Tests of the suite.
 * @returns {ReportContent} The content of the report.
 */
function testsReport(tests) {
    /**
     * Counts the tests matching a condition.
     *
     * @param {(test: NormalizedTest) => boolean} test - Condition to check.
     * @returns {number} The number of matching tests.
     */
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

/**
 * Builds the report of the Lighthouse audit: a table of the scores per page and the thresholds.
 *
 * @param {object} data - Contents of `reports/lighthouse.json`.
 * @param {Record<string, number>} data.minScores - Minimum score of each category, from 0 to 1.
 * @param {{path: string, scores: Record<string, number|null>}[]} data.results - Scores of each page.
 * @returns {ReportContent} The content of the report.
 */
function lighthouseReport({ minScores, results }) {
    const ids = Object.keys(minScores)
    /**
     * Formats a score against its threshold.
     *
     * @param {number|null} value - Score from 0 to 1, or `null` on error.
     * @param {number} min - Minimum score of the category.
     * @returns {string} The result icon and the score out of 100.
     */
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

/**
 * Builds the report of the requested suite from its raw results.
 *
 * @returns {ReportContent} The content of the report; a failure when there is no result.
 */
function buildReport() {
    if (suite === 'lighthouse' && raw) return lighthouseReport(raw)
    const tests = !raw ? [] : suite === 'e2e' ? fromCypress(raw) : fromPlaywright(raw)
    // Pas de résultat = le run s'est arrêté avant ou pendant les tests : on ne doit surtout pas afficher un succès
    if (!tests.length) return { summary: "❌ Aucun résultat : le run s'est arrêté avant la fin des tests", body: [] }
    return testsReport(tests)
}

/**
 * Masks the secrets and e-mail addresses of a report, which is published to a public repository.
 *
 * @param {string} text - Content of the report.
 * @returns {string} The content with the values of the `CYPRESS_*` and `NUXT_PUBLIC_FIREBASE_*`
 * variables and all the e-mail addresses masked.
 */
function sanitize(text) {
    for (const [name, value] of Object.entries(process.env)) {
        if (value && /^(CYPRESS_|NUXT_PUBLIC_FIREBASE_)/.test(name)) text = text.replaceAll(value, '***')
    }
    return text.replace(/[\w.+-]+@[\w-]+\.[\w.-]+/g, '***@***')
}

const { GITHUB_HEAD_REF, GITHUB_REF_NAME, GITHUB_REPOSITORY, GITHUB_RUN_ID, GITHUB_SERVER_URL, GITHUB_SHA, REPORT_SHA } = process.env
const { summary, body } = buildReport()
/** Markdown lines of the report: header with the run context, then the content. */
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