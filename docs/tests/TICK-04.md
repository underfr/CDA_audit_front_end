### [ TICK-04] [Persistance des données après rechargement]

- **Objectif :** Vérifier qu'un ticket créé via le formulaire est bien enregistré dans Firebase et reste affiché après un rechargement de la page.
- **Préparation :** Compte connecté, départ du test page dashboard
- **Données utilisées :**
    - titre du ticket : "Imprimante hors service " + horodatage (titre unique à chaque passage)
    - Catégorie : Réseau
    - Priorité : Élevée
    - description : "L’imprimante du 2e étage affiche une erreur papier."

- **Actions :**
  1. Se connecter
  2. Se rendre sur la page de création de ticket
  3. Saisir les informations du formulaire et confirmer l'envoi
  4. Vérifier que le ticket est affiché dans la liste des tickets
  5. Recharger la page (F5) et vérifier que le ticket est toujours affiché
  6. Ouvrir le détail du ticket, recharger la page
  7. Vérifier que le titre, la description et la catégorie sont toujours affichés
- **Résultat attendu :** Après chaque rechargement, le ticket et ses informations (titre, description, catégorie) sont toujours affichés : les données viennent bien de Firebase et non de la mémoire de la page.
- **Résultat obtenu :** Le ticket est toujours affiché dans la liste et dans le détail après rechargement, avec les bonnes informations.
- **Statut :** exécuté

Statuts du test   :

- **Réussi** : le résultat obtenu correspond au résultat attendu.

Remarque : pendant le passage Cypress, des erreurs « uncaught exception » apparaissent sur la page détail après la fin du test. Elles n'apparaissent pas dans un navigateur normal et n'ont pas d'impact sur le résultat.
