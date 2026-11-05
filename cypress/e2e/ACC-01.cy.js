// ACC-01 : création d'un ticket uniquement au clavier
// Prérequis : cypress-real-events (realPress / realType) et la commande cy.login(role)

// Appuie sur une touche jusqu'à ce que l'élément qui a le focus remplisse la condition.
// Si la condition n'est jamais remplie, le test échoue : l'élément n'est pas accessible au clavier.
const toucheJusqua = (touche, condition, description, essais = 30) => {
    cy.document().then((doc) => {
        const elementActif = Cypress.$(doc.activeElement)
        if (condition(elementActif)) return
        if (essais === 0) {
            throw new Error(`${description} n'a pas pu être atteint avec la touche ${touche}`)
        }
        cy.realPress(touche)
        toucheJusqua(touche, condition, description, essais - 1)
    })
}

describe('Abstract Support', () => {
    beforeEach(() => {
        cy.login('COLLABORATOR')
    })

    it('ACC-01 : Création d\'un ticket uniquement via le clavier', () => {
        // Texte sans accent : realType ne gère que le clavier américain
        const titre = `Imprimante hors ligne ${Date.now()}`

        cy.visit('/tickets/new')

        // 1. Atteindre le champ titre avec Tab et saisir le titre
        toucheJusqua('Tab', (el) => el.is('input[name="title"]'), 'Le champ titre')
        cy.realType(titre)

        // 2. Atteindre la catégorie avec Tab et choisir "Réseaux" en tapant sa première lettre
        toucheJusqua('Tab', (el) => el.is('select[name="categoryId"]'), 'La liste des catégories')
        cy.realType('R')
        cy.get('select[name="categoryId"]').find('option:selected').should('have.text', 'Réseaux')

        // 3. Atteindre la priorité avec Tab et choisir "urgent" avec la flèche du bas
        toucheJusqua('Tab', (el) => el.is('input[name="priority"]'), 'Le groupe de priorités')
        toucheJusqua(
            'ArrowDown',
            (el) => el.is('input[name="priority"][value="urgent"]') && el.prop('checked'),
            'La priorité urgent'
        )

        // 4. Atteindre la description avec Tab et saisir la description
        toucheJusqua('Tab', (el) => el.is('textarea[name="description"]'), 'Le champ description')
        cy.realType('Impossible d\'imprimer depuis ce matin, le poste affiche une erreur de connexion.')

        // 5. Atteindre le bouton d'envoi avec Tab et valider avec Entrée
        toucheJusqua('Tab', (el) => el.is('button') && el.text().includes('Envoyer le ticket'), 'Le bouton Envoyer le ticket')
        cy.realPress('Enter')

        // 6. Dans la fenêtre de confirmation, atteindre "Confirmer l'envoi" avec Tab et valider avec Entrée
        cy.contains('button', /Confirmer l.envoi/).should('be.visible')
        toucheJusqua('Tab', (el) => el.is('button') && /Confirmer l.envoi/.test(el.text()), 'Le bouton Confirmer l\'envoi')
        cy.realPress('Enter')

        // 7. Vérifier que le ticket a bien été créé
        cy.location('pathname').should('not.eq', '/tickets/new')
        cy.visit('/tickets')
        cy.contains(titre).should('be.visible')
    })
})