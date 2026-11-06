describe('Abstract Support', () => {
  // Fonction pour éviter de répéter la connexion 3 fois
  function seConnecter(email, motDePasse) {
    cy.get('input[name="email"]').type(email)
    cy.get('input[name="password"]').type(motDePasse)
    cy.contains('button', ' Se connecter').click()
    cy.location('pathname').should('eq', '/dashboard')
    // On attend l'affichage complet, sinon cy.visit coupe le chargement de la page
    cy.contains('h1', 'Bonjour').should('be.visible')
    cy.contains('h2', 'en cours').should('be.visible')
  }

  // Récupère le jeton Firebase d'un compte, comme le ferait un utilisateur malveillant
  // log: false pour ne pas afficher le mot de passe et le jeton dans Cypress
  function recupererJeton(firebase, compte) {
    return cy.request({
      method: 'POST',
      url: `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${firebase.apiKey}`,
      body: { email: compte.email, password: compte.motDePasse, returnSecureToken: true },
      log: false,
    }).then(({ body }) => ({ uid: body.localId, jeton: body.idToken }))
  }

  // Lit le rôle d'un compte avec son propre jeton
  function lireRole(firebase, { uid, jeton }) {
    return cy.request({
      url: `${firebase.databaseURL}/users/${uid}/role.json?auth=${jeton}`,
      log: false,
    }).its('body')
  }

  // Tente d'écrire le rôle directement dans la base.
  // Sécurité : on réécrit toujours le rôle ACTUEL du compte, jamais « admin ».
  // Si la base accepte, le test échoue mais aucune donnée ne change.
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

  const collaborateur = { nom: 'collaborateur', libelle: 'Collaborateur', role: 'collaborator', email: 'underfr31@icloud.com', motDePasse: 'dytgob-hYjqoc-5morpo' }
  const technicien = { nom: 'technicien', libelle: 'Technicien', role: 'technician', email: 'q.civel@yahoo.fr', motDePasse: '1234quentin!' }
  const responsable = { nom: 'responsable', libelle: 'Responsable du support', role: 'manager', email: 'loicklaurent28@gmail.com', motDePasse: 'nuqwa7-dowkun-gapguJ' }

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
