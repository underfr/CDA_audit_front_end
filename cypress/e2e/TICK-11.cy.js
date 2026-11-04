describe('Abstract Support', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000/login', {
        onBeforeLoad(win) {
        win.indexedDB.deleteDatabase('firebaseLocalStorageDb')
        },
    })
    cy.get('input[name="email"]').type('loicklaurent28@gmail.com')
    cy.get('input[name="password"]').type('nuqwa7-dowkun-gapguJ')
    cy.contains('button',' Se connecter').click()
    cy.location('pathname').should('not.eq', '/login')
})

  it('Le responsable support peux assigner un ticket à un technicien',()=>{
    // Création d'un nouveau ticket
    cy.get('main a[href="/tickets/new"]').click()
    cy.get('input[name="title"]').type('Test assignation ticket')
    cy.get('select[name="categoryId"]').select('Réseau')
    cy.get('input[name="priority"]').check('medium')
    cy.get('textarea[name="description"]').type("Réalisation du test d'assignation d'un ticket à un technicien.")
    cy.contains('button','Envoyer le ticket').click()
    cy.contains('button'," Confirmer l’envoi ").click()
   // Selectionner le ticket
    cy.contains('a','Test assignation ticket').click()
    // Assignation du ticket
    cy.get('select[id="ticket-assignee"]').select('yaelle')
    cy.get('select[id="ticket-priority"]').select('Moyenne')
    cy.contains('button','Affecter').click()
    // Vérification
    cy.contains('dd', 'yaelle').should('be.visible')
  })
})