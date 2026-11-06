/**
 * @file Cypress support file: loads the custom commands and real events, and disables Nuxt DevTools.
 */

// ***********************************************************
// This example support/e2e.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'
import 'cypress-real-events'

/**
 * Disables Nuxt DevTools during the tests.
 *
 * @param {Window} win - Window of the application, before it loads.
 */
Cypress.on('window:before:load', (win) => {
  win.__NUXT_DEVTOOLS_DISABLE__ = true
})