describe('Abstract Support', () => {
    beforeEach(() => {
        cy.visit('http://localhost:3000/login', {
            onBeforeLoad(win) {
            win.indexedDB.deleteDatabase('firebaseLocalStorageDb')
            },
        })
    })
    it('Le technicien peux voir les tickets qui lui sont assigné', ()=>{
        // Se connecter avec un compte responsable support
        cy.get('input[name="email"]').type('loicklaurent28@gmail.com')
        cy.get('input[name="password"]').type('nuqwa7-dowkun-gapguJ')
        cy.contains('button',' Se connecter').click()
        cy.location('pathname').should('not.eq', '/login')
        // Créer un nouveau ticket
        cy.get('main a[href="/tickets/new"]').click()
        cy.get('input[name="title"]').type('test visibilité des ticket assigner au technicien')
        cy.get('select[name="categoryId"]').select('Réseaux')
        cy.get('input[name="priority"]').check('urgent')
        cy.get('textarea[name="description"]').type("Test si un technicien à acces aux tickets qui lui sont assignés.")
        cy.contains('button','Envoyer le ticket').click()
        cy.contains('button'," Confirmer l’envoi ").click()
        // Selectionner le ticket
        cy.contains('a','test visibilité des ticket assigner au technicien').click()
        // Assignation du ticket
        cy.get('select[id="ticket-assignee"]').select('Quentin')
        cy.get('select[id="ticket-priority"]').select('Moyenne')
        cy.contains('button','Affecter').click()
        // Se deconnecter
        cy.contains('button','Déconnexion').click()
        //Se connecter avec le compte technicien quentin
        cy.get('input[name="email"]').type('q.civel@yahoo.fr')
        cy.get('input[name="password"]').type('1234quentin!')
        cy.contains('button',' Se connecter').click()
        cy.location('pathname').should('not.eq', '/login')
        //Vérifier que le ticket lui est bien assigné
        cy.get('aside a[href="/tickets"]').click()
        cy.contains('a','test visibilité des ticket assigner au technicien').click()
    })
    

})