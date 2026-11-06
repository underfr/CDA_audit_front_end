/**
 * @file Full ticket flow between a manager and a technician: once resolved, a ticket no longer
 * appears among the tickets in progress of the dashboard.
 * @see docs/tests/TICK-07.md
 */

describe('Abstract Support', () => {
  it('Un ticket résolu ne s’affiche plus dans « Tickets en cours »', () => {
    // Titre unique : on est sûr de suivre CE ticket et pas un ancien
    const titre = `Écran noir au démarrage ${Date.now()}`

    // 1. Le responsable support crée un ticket
    cy.login('MANAGER')
    cy.get('main a[href="/tickets/new"]').click()
    cy.get('input[name="title"]').type(titre)
    cy.get('select[name="categoryId"]').select('Réseaux')
    cy.get('input[name="priority"]').check('medium')
    cy.get('textarea[name="description"]').type('Mon écran reste noir quand j’allume le poste.')
    cy.contains('button', 'Envoyer le ticket').click()
    cy.contains('button', /Confirmer l.envoi/).click()

    // 2. Le ticket est bien dans « Tickets en cours » (statut Nouveau)
    // On attend la redirection après la création, sinon elle annule le clic suivant
    cy.location('pathname').should('eq', '/tickets')
    cy.contains('aside a', 'Tableau de bord').click()
    cy.contains('section', 'Tickets en cours').should('contain', titre)

    // 3. Il l'affecte au technicien Quentin
    cy.contains('a', titre).click()
    cy.get('select[id="ticket-assignee"]').select('Quentin')
    cy.contains('button', 'Affecter').click()
    cy.contains('dd', 'Quentin').should('be.visible')
    cy.contains('button', 'Déconnexion').click()

    // 4. Le technicien prend en charge le ticket puis le marque comme résolu
    cy.login('TECHNICIAN')
    cy.get('aside a[href="/tickets"]').click()
    cy.contains('a', titre).click()
    cy.contains('button', 'Prendre en charge').click()
    cy.contains('button', 'Marquer comme résolu').click()
    cy.contains('.badge', 'Résolu').should('be.visible')
    cy.contains('button', 'Déconnexion').click()

    // 5. Le responsable revient sur son tableau de bord :
    //    le ticket résolu n'est plus dans « Tickets en cours »
    cy.login('MANAGER')
    // On attend la fin du chargement, sinon le test passerait « trop tôt »
    cy.contains('section', 'Tickets en cours').should('not.contain', 'Chargement des tickets')
    cy.contains('section', 'Tickets en cours').should('not.contain', titre)
  })
})