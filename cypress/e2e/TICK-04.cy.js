/**
 * @file A created ticket is still there after reloading the list and details pages.
 * @see docs/tests/TICK-04.md
 */

describe('Abstract Support', () => {
  beforeEach(() => {
    cy.login('COLLABORATOR')
  })

  it('Le ticket créé est toujours là après rechargement de la page', () => {
    // Titre unique : on est sûr de retrouver CE ticket et pas un ancien
    const titre = `Imprimante hors service ${Date.now()}`
    const description = 'L’imprimante du 2e étage affiche une erreur papier.'

    // 1. Créer le ticket
    cy.get('main a[href="/tickets/new"]').click()
    cy.get('input[name="title"]').type(titre)
    cy.get('select[name="categoryId"]').select('Réseaux')
    cy.get('input[name="priority"]').check('high')
    cy.get('textarea[name="description"]').type(description)
    cy.contains('button', 'Envoyer le ticket').click()
    cy.contains('button', /Confirmer l.envoi/).click()

    // 2. On arrive sur la liste et le ticket est affiché
    cy.location('pathname').should('eq', '/tickets')
    cy.contains('a', titre).should('be.visible')

    // 3. Recharger la page (comme F5) : le ticket doit toujours être là
    cy.reload()
    cy.contains('a', titre).should('be.visible')

    // 4. Ouvrir le détail, recharger, vérifier les données enregistrées
    cy.contains('a', titre).click()
    cy.location('pathname').should('match', /^\/tickets\/.+/)
    cy.reload()
    cy.get('h1').should('contain', titre)
    cy.contains(description).should('be.visible')
    cy.contains('dd', 'Réseau').should('be.visible')
  })
})