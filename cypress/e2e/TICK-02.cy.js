describe('Abstract Support', () => {
    beforeEach(() => {
        cy.login('COLLABORATOR')
    })

    it('Créer un ticket avec un titre invalide moins de 5 caractères',()=>{
        cy.get('main a[href="/tickets/new"]').click()
        cy.get('input[name="title"]').click().realType('Mot')
        cy.get('select[name="categoryId"]').select('Réseaux')
        cy.get('input[name="priority"]').check('urgent')
        cy.get('textarea[name="description"]').type('Depuis ce matin, impossible de me connecter à mon poste et à ma messagerie.')

        cy.get('input[name="title"]').invoke('prop', 'validity').its('tooShort').should('be.true')

        // Vérification si la modal est visible
        cy.contains(/Confirmer l.envoi/).should('not.be.visible')

        // Vérification si on reste sur la page ticket/new
        cy.location('pathname').should('eq', '/tickets/new')
    })


    it('Créer un ticket avec un titre invalide plus de 120 caractères',()=>{
        cy.get('main a[href="/tickets/new"]').click()

        cy.get('input[name="title"]').type('Mot de passe expiré, compte verrouillé après plusieurs essais, plus aucun accès au poste, à la messagerie ni au Réseaux local.')

        // Le navigateur a bloqué la saisie à 120 caractères
        cy.get('input[name="title"]').invoke('val').should('have.length', 120)

        // Le champ est valide (le texte coupé respecte la règle)
        cy.get('input[name="title"]').invoke('prop', 'validity').its('valid').should('be.true')

        // Vérification si la modal est visible
        cy.contains(/Confirmer l.envoi/).should('not.be.visible')

        // Vérification si on reste sur la page ticket/new
        cy.location('pathname').should('eq', '/tickets/new')
    })

    it('Créer un ticket avec une description invalide moins de 5 caractères', () => {
        cy.get('main a[href="/tickets/new"]').click()
        cy.get('input[name="title"]').type('Mot de passe expiré, compte verrouillé')
        cy.get('select[name="categoryId"]').select('Réseaux')
        cy.get('input[name="priority"]').check('urgent')
        cy.get('textarea[name="description"]').click().realType('Dep')
        cy.contains('button', 'Envoyer le ticket').click()
        // La description est signalée comme trop courte
        cy.get('textarea[name="description"]').invoke('prop', 'validity').its('tooShort').should('be.true')
        // Vérification si la modal est visible
        cy.contains(/Confirmer l.envoi/).should('not.be.visible')
        // Vérification si on reste sur la page ticket/new
        cy.location('pathname').should('eq', '/tickets/new')
    })

    it('Créer un ticket avec une description invalide plus de 2000 caractères', () => {
        const descriptionTropLongue = `Depuis ce matin, impossible de me connecter à mon poste de travail. Au démarrage, un message m'indique que mon mot de passe a expiré et qu'il doit être changé. J'ai essayé de le modifier à plusieurs reprises en respectant les règles de sécurité habituelles : au moins douze caractères, une majuscule, un chiffre et un caractère spécial. À chaque tentative, le système refuse le nouveau mot de passe sans donner de raison précise. Après la quatrième tentative, un nouveau message est apparu pour m'indiquer que mon compte était verrouillé. Depuis, je ne peux plus ouvrir de session, ni sur mon poste fixe, ni sur l'ordinateur portable fourni pour le télétravail. J'ai également essayé depuis mon téléphone professionnel : la messagerie refuse de se synchroniser et affiche une erreur d'authentification. Je n'ai donc plus accès à mes courriels, à mon agenda ni aux réunions prévues aujourd'hui. Les dossiers partagés du Réseaux sont eux aussi inaccessibles, tout comme l'intranet et les applications métier que j'utilise quotidiennement, notamment l'outil de facturation et le logiciel de gestion des clients. J'ai redémarré le poste deux fois et vérifié le câble Réseaux, qui est bien branché. Mes collègues du même bureau n'ont aucun problème et peuvent se connecter normalement, ce qui me fait penser que le souci vient uniquement de mon compte. Je n'ai reçu aucun courriel me prévenant de l'expiration prochaine du mot de passe, alors que c'était le cas les fois précédentes. Je dois envoyer plusieurs devis à des clients avant midi et préparer une présentation pour une réunion importante cet après-midi, ce blocage m'empêche donc complètement de travailler. Pourriez-vous déverrouiller mon compte et réinitialiser mon mot de passe en urgence ? Je reste joignable sur mon téléphone portable toute la journée, au bureau numéro deux cent quatorze, au deuxième étage du bâtiment B. Merci beaucoup pour votre aide rapide, et n'hésitez pas à me contacter si vous avez besoin d'informations complémentaires. Bonne journée.`

        cy.get('main a[href="/tickets/new"]').click()

        cy.get('textarea[name="description"]').type(descriptionTropLongue, { delay: 0 })

        // Le navigateur a bloqué la saisie à 2000 caractères
        cy.get('textarea[name="description"]').invoke('val').should('have.length', 2000)

        // Le champ est valide (le texte coupé respecte la règle)
        cy.get('textarea[name="description"]').invoke('prop', 'validity').its('valid').should('be.true')

        // Vérification si la modal est visible
        cy.contains(/Confirmer l.envoi/).should('not.be.visible')

        // Vérification si on reste sur la page ticket/new
        cy.location('pathname').should('eq', '/tickets/new')
    })

})