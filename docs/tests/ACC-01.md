[ACC-01] [Création d'un ticket uniquement via le clavier]

Objectif : Vérifier qu'un utilisateur peut créer un ticket sans souris, en utilisant uniquement le clavier (accessibilité).
Préparation : Compte collaborateur connecté, départ du test sur la page de création de ticket
Données utilisées :
    Compte : collaborateur (commande cy.login('COLLABORATOR'))
    Ticket :
    Titre : Imprimante hors ligne (suivi d'un horodatage pour le rendre unique)
    Catégorie : Réseaux
    Priorité : Urgent
    Description : Impossible d'imprimer depuis ce matin, le poste affiche une erreur de connexion.
    Touches utilisées : Tab, Flèche du bas, Entrée
Actions :
    1.Se rendre sur la page de création de ticket
    2.Atteindre le champ titre avec la touche Tab et saisir le titre
    3.Atteindre la liste des catégories avec Tab et choisir « Réseaux » avec la flèche du bas
    4.Atteindre le groupe de priorités avec Tab et choisir « Urgent » avec la flèche du bas
    5.Atteindre le champ description avec Tab et saisir la description
    6.Atteindre le bouton « Envoyer le ticket » avec Tab et valider avec Entrée
    7.Dans la fenêtre de confirmation, atteindre « Confirmer l'envoi » avec Tab et valider avec Entrée
    8.Vérifier que le ticket apparaît sur la page des tickets
Résultat attendu : 
    Tous les champs et boutons du formulaire sont accessibles avec la touche Tab, dans l'ordre logique du formulaire.
    La catégorie et la priorité peuvent être choisies au clavier.
    La fenêtre de confirmation peut être validée au clavier.
    Le ticket est créé et apparaît sur la page des tickets.
    Le focus est visible à chaque étape (contour autour de l'élément actif), vérifié sur la vidéo du test.
Résultat obtenu : [À compléter après le test]
Statut : Non exécuté

Statuts du test :

Réussi : le résultat obtenu correspond au résultat attendu.
Échoué : le résultat obtenu ne correspond pas au résultat attendu.
Bloqué : un problème empêche d'effectuer la vérification.
Non exécuté : le test n'a pas été lancé.