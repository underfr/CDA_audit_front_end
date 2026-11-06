/**
 * @file Non-admin roles cannot change a role, neither in the interface nor directly in the database
 * with their own token. The tests write back the current role, so no data changes.
 * @see docs/tests/ROLE-09.md
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
   * Gets the Firebase token of an account, as a malicious user would.
   * `log: false` keeps the password and token out of the Cypress log.
   *
   * @param {{apiKey: string}} firebase - Public Firebase configuration of the application.
   * @param {{email: string, motDePasse: string}} compte - Account to sign in with.
   * @returns {Cypress.Chainable<{uid: string, jeton: string}>} The uid and token of the account.
   */
  function recupererJeton(firebase, compte) {
    return cy.request({
      method: 'POST',
      url: `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${firebase.apiKey}`,
      body: { email: compte.email, password: compte.motDePasse, returnSecureToken: true },
      log: false,
    }).then(({ body }) => ({ uid: body.localId, jeton: body.idToken }))
  }

  /**
   * Reads the role of an account with its own token.
   *
   * @param {{databaseURL: string}} firebase - Public Firebase configuration of the application.
   * @param {{uid: string, jeton: string}} session - Uid and token of the account.
   * @returns {Cypress.Chainable<string>} The stored role.
   */
  function lireRole(firebase, { uid, jeton }) {
    return cy.request({
      url: `${firebase.databaseURL}/users/${uid}/role.json?auth=${jeton}`,
      log: false,
    }).its('body')
  }

  /**
   * Tries to write a role directly in the database.
   * Safety: always write back the CURRENT role of the account, never `admin`.
   * If the database accepts the write, the test fails but no data changes.
   *
   * @param {{databaseURL: string}} firebase - Public Firebase configuration of the application.
   * @param {string} uidCible - Uid of the targeted account.
   * @param {string} role - Role to write.
   * @param {string} jeton - Token used for the request.
   * @returns {Cypress.Chainable<number>} The HTTP status of the response.
   */
  function tenterEcriture(firebase, uidCible, role, jeton) {
    return cy.request({
      method: 'PUT',
      url: `${firebase.databaseURL}/users/${uidCible}/role.json?auth=${jeton}`,
      body: JSON.stringify(role),
      failOnStatusCode: false,
      log: false,
    }).its('status')
  }

  beforeEach(() => {
    cy.visit('http://localhost:3000/login', {
      // Supprime la session Firebase avant le chargement de l'application
      onBeforeLoad(win) {
        win.indexedDB.deleteDatabase('firebaseLocalStorageDb')
      },
    })
  })

  /** Collaborator account tested. */
  const collaborateur = { nom: 'collaborateur', libelle: 'Collaborateur', role: 'collaborator', email: 'underfr31@icloud.com', motDePasse: 'dytgob-hYjqoc-5morpo' }
  /** Technician account tested. */
  const technicien = { nom: 'technicien', libelle: 'Technicien', role: 'technician', email: 'q.civel@yahoo.fr', motDePasse: '1234quentin!' }
  /** Support manager account tested. */
  const responsable = { nom: 'responsable', libelle: 'Responsable du support', role: 'manager', email: 'loicklaurent28@gmail.com', motDePasse: 'nuqwa7-dowkun-gapguJ' }

  /** Scenarios: each account tries to change its own role, then the role of the other account. */
  const cas = [
    { compte: collaborateur, autre: technicien },
    { compte: technicien, autre: responsable },
    { compte: responsable, autre: collaborateur },
  ]

  cas.forEach(({ compte, autre }) => {
    describe(`Un ${compte.nom}`, () => {
      it('ne voit aucun moyen de modifier un rôle dans l’interface', () => {
        seConnecter(compte.email, compte.motDePasse)
        // On vérifie que le compte a bien le rôle testé
        cy.contains('header', compte.libelle).should('be.visible')

        cy.visit('/admin/users')
        cy.location('pathname').should('eq', '/dashboard')
        cy.contains('h1', 'Bonjour').should('be.visible')
        cy.get('select[name="role"]').should('not.exist')
        cy.contains('aside a', 'Utilisateurs').should('not.exist')
      })

      it('ne peut pas modifier son propre rôle dans la base', () => {
        cy.window().its('__NUXT__.config.public.firebase').then((firebase) => {
          recupererJeton(firebase, compte).then((session) => {
            lireRole(firebase, session).then((role) => {
              expect(role).to.eq(compte.role)
              tenterEcriture(firebase, session.uid, role, session.jeton).then((statut) => {
                expect(statut, 'écriture refusée').to.be.oneOf([401, 403])
              })
            })
          })
        })
      })

      it('ne peut pas modifier le rôle d’un autre compte dans la base', () => {
        cy.window().its('__NUXT__.config.public.firebase').then((firebase) => {
          recupererJeton(firebase, compte).then((session) => {
            recupererJeton(firebase, autre).then((cible) => {
              lireRole(firebase, cible).then((role) => {
                expect(role).to.eq(autre.role)
                tenterEcriture(firebase, cible.uid, role, session.jeton).then((statut) => {
                  expect(statut, 'écriture refusée').to.be.oneOf([401, 403])
                })
              })
            })
          })
        })
      })
    })
  })
})
