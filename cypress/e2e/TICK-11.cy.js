/**
 * @file A support manager can assign a ticket to a technician.
 * @see docs/tests/TICK-11.md
 */

describe('Abstract Support', () => {
  beforeEach(() => {
    cy.login('MANAGER')
  })

  it('Le responsable support peux assigner un ticket à un technicien', () => {
    const titre = `Test assignation ticket ${Date.now()}`

    // Création d'un nouveau ticket
    cy.get('main a[href="/tickets/new"]').click()
    cy.get('input[name="title"]').type(titre)
    cy.get('select[name="categoryId"]').select('Réseaux')
    cy.get('input[name="priority"]').check('medium')
    cy.get('textarea[name="description"]').type("Réalisation du test d'assignation d'un ticket à un technicien.")
    cy.contains('button', 'Envoyer le ticket').click()
    cy.contains('button', /Confirmer l.envoi/).click()
    // Selectionner le ticket
    cy.contains('a', titre).click()
    // Assignation du ticket
    cy.get('select[id="ticket-assignee"]').select('Quentin')
    cy.get('select[id="ticket-priority"]').select('Moyenne')
    cy.contains('button', 'Affecter').click()
    // Vérification
    cy.contains('dd', 'Quentin').should('be.visible')
  })
})