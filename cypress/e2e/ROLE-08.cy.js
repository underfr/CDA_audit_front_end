describe('Abstract Support', () => {
  // Petite fonction pour éviter de répéter la connexion 3 fois
  function seConnecter(email, motDePasse) {
    cy.get('input[name="email"]').type(email)
    cy.get('input[name="password"]').type(motDePasse)
    cy.contains('button', ' Se connecter').click()
    cy.location('pathname').should('eq', '/dashboard')
    // On attend l'affichage complet, sinon cy.visit coupe le chargement de la page
    cy.contains('h1', 'Bonjour').should('be.visible')
    cy.contains('h2', 'en cours').should('be.visible')
  }

  // On ouvre la page par son URL, puis on vérifie le retour au tableau de bord
  function verifierAccesRefuse(url, titrePage) {
    cy.visit(url)
    cy.location('pathname').should('eq', '/dashboard')
    cy.contains('h1', 'Bonjour').should('be.visible')
    cy.contains('h1', titrePage).should('not.exist')
  }

  beforeEach(() => {
    cy.visit('http://localhost:3000/login', {
      // Supprime la session Firebase avant le chargement de l'application
      onBeforeLoad(win) {
        win.indexedDB.deleteDatabase('firebaseLocalStorageDb')
      },
    })
  })

  const comptes = [
    { role: 'collaborateur', libelle: 'Collaborateur', email: 'underfr31@icloud.com', motDePasse: 'dytgob-hYjqoc-5morpo' },
    { role: 'technicien', libelle: 'Technicien', email: 'q.civel@yahoo.fr', motDePasse: '1234quentin!' },
    { role: 'responsable', libelle: 'Responsable du support', email: 'loicklaurent28@gmail.com', motDePasse: 'nuqwa7-dowkun-gapguJ' },
  ]

  comptes.forEach(({ role, libelle, email, motDePasse }) => {
    it(`Un ${role} ne peut pas ouvrir les pages d'administration par l'URL directe`, () => {
      seConnecter(email, motDePasse)
      // On vérifie que le compte a bien le rôle testé
      cy.contains('header', libelle).should('be.visible')

      // Comptes et rôles
      verifierAccesRefuse('/admin/users', 'Utilisateurs')
      // Catégories
      verifierAccesRefuse('/admin/categories', 'Catégories')
    })
  })
})
