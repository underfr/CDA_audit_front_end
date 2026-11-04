describe('Abstract Support', () => {
    beforeEach(() => {
        cy.visit('http://localhost:3000/login', {
      // Supprime la session Firebase avant le chargement de l'application
        onBeforeLoad(win) {
            win.indexedDB.deleteDatabase('firebaseLocalStorageDb')
        },
    })
    cy.get('input[name="email"]').type('jean.jacque@mail.com')
    cy.get('input[name="password"]').type('Jean@31!')
    cy.contains('button',' Se connecter').click()
    cy.location('pathname').should('not.eq', '/login')
        
    })

  it('Créer un ticket avec des données valides',()=>{
    cy.get('main a[href="/tickets/new"]').click()
    cy.get('input[name="title"]').type('Mot de passe expiré, compte verrouillé')
    cy.get('select[name="categoryId"]').select('Réseau')
    cy.get('input[name="priority"]').check('urgent')
    cy.get('textarea[name="description"]').type('Depuis ce matin, impossible de me connecter à mon poste et à ma messagerie.')
    cy.contains('button','Envoyer le ticket').click()
    cy.contains('button'," Confirmer l’envoi ").click()
    // Vérifier si le ticket est bien affiché
    cy.visit('http://localhost:3000/tickets')
    cy.contains('a','Mot de passe expiré, compte verrouillé').should('be.visible')
  })



})