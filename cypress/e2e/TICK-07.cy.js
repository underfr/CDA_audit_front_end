describe('Abstract Support', () => {
  // Petite fonction pour éviter de répéter la connexion 3 fois
  function seConnecter(email, motDePasse) {
    cy.get('input[name="email"]').type(email)
    cy.get('input[name="password"]').type(motDePasse)
    cy.contains('button', ' Se connecter').click()
    cy.location('pathname').should('eq', '/dashboard')
  }

  beforeEach(() => {
    cy.visit('http://localhost:3000/login', {
      // Supprime la session Firebase avant le chargement de l'application
      onBeforeLoad(win) {
        win.indexedDB.deleteDatabase('firebaseLocalStorageDb')
      },
    })
  })

  it('Un ticket résolu ne s’affiche plus dans « Mes tickets en cours »', () => {
    // Titre unique : on est sûr de suivre CE ticket et pas un ancien
    const titre = `Écran noir au démarrage ${Date.now()}`

    // 1. Le responsable support crée un ticket
    seConnecter('loicklaurent28@gmail.com', 'nuqwa7-dowkun-gapguJ')
    cy.get('main a[href="/tickets/new"]').click()
    cy.get('input[name="title"]').type(titre)
    cy.get('select[name="categoryId"]').select('Réseau')
    cy.get('input[name="priority"]').check('medium')
    cy.get('textarea[name="description"]').type('Mon écran reste noir quand j’allume le poste.')
    cy.contains('button', 'Envoyer le ticket').click()
    cy.contains('button', /Confirmer l.envoi/).click()

    // 2. Le ticket est bien dans « Mes tickets en cours » (statut Nouveau)
    cy.contains('aside a', 'Tableau de bord').click()
    cy.contains('section', 'Mes tickets en cours').should('contain', titre)

    // 3. Il l'affecte au technicien Quentin
    cy.contains('a', titre).click()
    cy.get('select[id="ticket-assignee"]').select('Quentin')
    cy.contains('button', 'Affecter').click()
    cy.contains('dd', 'Quentin').should('be.visible')
    cy.contains('button', 'Déconnexion').click()

    // 4. Le technicien prend en charge le ticket puis le marque comme résolu
    seConnecter('q.civel@yahoo.fr', '1234quentin!')
    cy.get('aside a[href="/tickets"]').click()
    cy.contains('a', titre).click()
    cy.contains('button', 'Prendre en charge').click()
    cy.contains('button', 'Marquer comme résolu').click()
    cy.contains('.badge', 'Résolu').should('be.visible')
    cy.contains('button', 'Déconnexion').click()

    // 5. Le responsable revient sur son tableau de bord :
    //    le ticket résolu n'est plus dans « Mes tickets en cours »
    seConnecter('loicklaurent28@gmail.com', 'nuqwa7-dowkun-gapguJ')
    // On attend la fin du chargement, sinon le test passerait « trop tôt »
    cy.contains('section', 'Mes tickets en cours').should('not.contain', 'Chargement des tickets')
    cy.contains('section', 'Mes tickets en cours').should('not.contain', titre)
  })
})
