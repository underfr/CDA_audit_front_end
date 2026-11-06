/**
 * @file Non-admin roles cannot open the administration pages through their URL.
 * @see docs/tests/ROLE-08.md
 */

describe('Abstract Support', () => {
  /**
   * Signs in through the form and waits for the dashboard to be fully displayed.
   *
   * @param {string} email - E-mail address of the account.
   * @param {string} motDePasse - Password of the account.
   */
  function seConnecter(email, motDePasse) {
    cy.get('input[name="email"]').type(email)
    cy.get('input[name="password"]').type(motDePasse)
    cy.contains('button', ' Se connecter').click()
    cy.location('pathname').should('eq', '/dashboard')
    // On attend l'affichage complet, sinon cy.visit coupe le chargement de la page
    cy.contains('h1', 'Bonjour').should('be.visible')
    cy.contains('h2', 'en cours').should('be.visible')
  }

  /**
   * Opens a page through its URL and checks that the user is sent back to the dashboard.
   *
   * @param {string} url - URL of the forbidden page.
   * @param {string} titrePage - Heading of the forbidden page, which must not appear.
   */
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

  /** Accounts tested, one per non-admin role, with the role label displayed in the header. */
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
