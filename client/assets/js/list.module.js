import Sortable from 'sortablejs';
import { deleteList, getLists, patchList, postList, updateCard } from "./api.js";
import { closeActiveModal, confetti, displaySuccessToast, showErrorModal } from "./utils.js";
import { addCardToList } from "./cards.module.js";

export function initAddListButton() {
  // Selectionner le bouton d'ajout de liste
  const addListButton = document.querySelector("#add-list-button");
  
  // Ecouter le click sur ce bouton, en cas de click : 
  addListButton.addEventListener("click", () => {
    // - Selectionner la modale d'ajout de liste
    const addListModal = document.querySelector("#add-list-modal");
    
    // - Lui mettre la classe is-active
    addListModal.classList.add("is-active");
  });
}

export async function fetchAndDisplayLists() {
  // Appel HTTP pour récupérer les listes depuis l'API
  const lists = await getLists(); // [{}, {}] || null

  if (!lists) {
    showErrorModal();
    return;
  }

  // POUR CHAQUE LISTE
  lists.toReversed().forEach(addListToListsContainer);
}

export function addListToListsContainer(list) { // list = { id: X, title: "...", , position: Y }
  // - récupérer le template d'une liste
  const listTemplate = document.querySelector("#list-template");

  // - cloner le template
  const listClone = listTemplate.content.cloneNode(true);

  // - modifier le template avec les données de la liste (title)
  listClone.querySelector('[slot="list-title"]').textContent = list.title;

  // - ajouter un ID sur la liste
  listClone.querySelector('[slot="list-id"]').id = `list-${list.id}`;

  // - écouter le click sur le bouton edit
  const editListButton = listClone.querySelector('[slot="edit-list-button"]');
  editListButton.addEventListener("click", () => {

    // Ouvrir la modale d'édition de liste !
    const editListModal = document.querySelector("#edit-list-modal");

    // Lui mettre la classe is-active
    editListModal.classList.add("is-active");

    // (un peu un hack comme solution ici...)
    // On ajoute à la modal d'édition de liste l'ID de la liste qui vient d'être cliqué
    editListModal.dataset.listId = list.id;
    // editListModal.setAttribute("data-list-id", list.id); // Equivalent !!

    // Récupérer (de manière dynamique) le titre de la liste qui vient d'être cliqué
    const targetedList = document.querySelector(`#list-${list.id}`);
    const previousListTitle = targetedList.querySelector('[slot="list-title"]').textContent;

    // Selectionner l'input "title" de la modale et modifier sa value
    document.querySelector("#edit-list-title").value = previousListTitle;
  });

  // - écouter le click sur le bouton supprimer
  const deleteListButton = listClone.querySelector('[slot="delete-list-button"]');
  deleteListButton.addEventListener("click", () => {
    // Selectionner la modale de suppression de liste
    const deleteListModal = document.querySelector("#delete-list-modal");

    // Ajouter la classe is-active dessus
    deleteListModal.classList.add("is-active");

    // Mettre dans les dataset de cette modal l'id de la liste à supprimer
    deleteListModal.dataset.listId = list.id;
  });

  // - écouter le click sur le bouton ajouter
  const addCardButton = listClone.querySelector('[slot="add-card-button"]');
  addCardButton.addEventListener("click", () => {
    // Selectionne la modale d'ajout de carte
    const addCardModal = document.querySelector('#add-card-modal');
    // Mettre la classe is-active
    addCardModal.classList.add("is-active");
    // SECRET : Lui mettre dans ses dataset l'ID de la LISTE dans laquelle on va créer notre carte
    addCardModal.dataset.listId = list.id;
  });

  // - ajout du drag&drop sur le conteneur de carte
  const cardsContainer = listClone.querySelector('[slot="list-content"]');
  Sortable.create(cardsContainer, {
    animation: 150,
    group: "shared",
    onEnd: async (event) => {
      const cardId = parseInt(event.item.id.slice(5));
      const fromListId = parseInt(event.from.parentElement.id.slice(5));
      const toListId = parseInt(event.to.parentElement.id.slice(5));

      if (fromListId !== toListId) { // S'il y a eu changement de liste, on update la list_id de la carte
        const updatedCard = await updateCard(cardId, { list_id: toListId });
        if (!updatedCard) { showErrorModal(); return; }
      }

      // Et on update les positions des cartes dans la liste d'arrivée 
      const cardElements = Array.from(document.querySelector(`#list-${toListId} [slot="list-content"]`).children);
      const promises = cardElements.map((card, index) => {
        const cardId = card.id.slice(5);
        const position = index + 1;
        return updateCard(cardId, { position });
      });
      const results = await Promise.all(promises);

      if (results.includes(null)) {
        showErrorModal();
      } else {
        displaySuccessToast("Positions des cartes sauvegardées avec succès");
      }
    }
  });  

  // - selectionner le lists-container
  const listsContainer = document.querySelector("#lists-container");

  // - insérer le clone dedans
  listsContainer.prepend(listClone);

  // - on ajoute les cartes dans l'ordre inverse
  if (list.cards) {
    list.cards.forEach(addCardToList);
  }

}

export function initAddListForm() {
  // Selectionner le formulaire d'ajout de liste
  const addListForm = document.querySelector("#add-list-modal form");

  // Ecouter le "submit" sur ce formulaire : 
  addListForm.addEventListener("submit", async (event) => {
    // - Empêcher le comportement par défaut du formulaire
    event.preventDefault();

    // - Récupérer les données du formulaire
    const newListData = Object.fromEntries(new FormData(addListForm)); // { title: "..." }

    // APPEL HTTP (POST)
    const createdList = await postList(newListData); // newListData = { ... }
    //    ^ { id, title, position, created_at, updated_at } || null

    if (! createdList) { // Si erreur lors de la création de la liste

      // Notifier l'utilisateur
      alert("Une erreur est survenue. Réessayer plus tard."); // TODO: remplacer le alert par l'ouverture d'une modale d'erreur plus ergonomique
    } else {

      // Afficher sur la page
      addListToListsContainer(createdList);
      displaySuccessToast("Nouvelle liste créée avec succès.");
      confetti.addConfetti();
    }

    // Fermer la modale
    closeActiveModal();

    // Reset le formulaire
    addListForm.reset();
  });
}

export function initEditListForm() {
  // Selectionner la modale d'edition de liste
  const editListModal = document.querySelector("#edit-list-modal");

  // Selecitonner son formulaire
  const editListForm = editListModal.querySelector("form");

  // Ecouter le submit sur le formulaire, et en cas de click : 
  editListForm.addEventListener("submit", async (event) => {
    // - prevent default
    event.preventDefault();
    
    // Récupérer les nouvelles valeurs entrées par l'utilisateur (new FormData)
    const newListData = Object.fromEntries(new FormData(editListForm)); // newListData = { title: "..." }

    // Récupérer la liste ID
    const listId = editListModal.dataset.listId;

    // Appel HTTP avec fetch --> api.js : patchList(listId, nouveauTitle) qui nous retourne la nouvelle liste updated !
    const updatedList = await patchList(listId, newListData);
    
    // Si une erreur a eu lieu (et la fonction nous a renvoyé null)
    if (! updatedList) {
      alert("Une erreur est survenue. Réessayer plus tard."); // TODO: remplacer le alert par l'ouverture d'une modale d'erreur plus ergonomique
      return;
    }

    // - on ferme la modale
    closeActiveModal();

    // - on reset le formulaire
    editListForm.reset();

    // - on affiche une notification de succès
    displaySuccessToast("La liste a bien été mise à jour.");

    // - on met à jour la vue avec le nouveau titre, en selectionnant la liste concerné
    const updatedListElement = document.querySelector(`#list-${updatedList.id}`);

    //   - selectionner son "header" et modifier son textContent avec le nouveau titre
    updatedListElement.querySelector('[slot="list-title"]').textContent = updatedList.title;

  });
}

export function initDeleteListForm() {
  // Selectionner la modal de suppression de liste
  const deleteListModal = document.querySelector("#delete-list-modal");

  // Selectionner le formulaire de suppression de liste
  const deleteListForm = deleteListModal.querySelector("form");

  // Ecouter le submit, en cas de submit : 
  deleteListForm.addEventListener("submit", async (event) => {
    // - prevent default
    event.preventDefault();

    // - récupérer l'ID de la liste à supprimer dans les dataset de la modale
    const listId = deleteListModal.dataset.listId;
  
    // - CALL HTTP : DELETE /lists/ID
    const isDeleted = await deleteList(listId);
  
    // - SI PAS OK : alert()
    if (!isDeleted) {
      alert("Une erreur est survenue. Réessayer plus tard."); // TODO: remplacer le alert par l'ouverture d'une modale d'erreur plus ergonomique
      return;
    }
    
    //   - toast de succès
    displaySuccessToast("La liste et ses cartes ont été supprimé avec succès.");
    
    //   - fermer la modale
    closeActiveModal();

    // - selectionner la liste par son ID
    const deletedListElement = document.querySelector(`#list-${listId}`);
    
    // - "la retirer du DOM" ==> .remove()
    deletedListElement.remove();
  });


}

export function initListsDragAndDrop() {
  const listsContainer = document.querySelector("#lists-container");
  Sortable.create(listsContainer, {
    animation: 150,
    handle: '[slot="move-list-handle"]',
    onEnd: (/* event */) => { // Cette fonction (callback) est appellé lorsque l'utilisateur termine son drag&drop sur un item
      // console.log(event); // { item, oldIndex, newIndex }

      // PATCH /lists/ID la nouvelle position
      
      // Récupérer toutes les listes
      const lists = Array.from(document.querySelector("#lists-container").children); // [{}, {}, {}]
      
      // Pour chaque liste : 
      lists.forEach(async (list, index) => {
        
        // Déterminer son ID
        const listId = parseInt(list.id.substring(5)); // "list-4" ==> "4" ==> 4

        // Déterminer sa nouvelle position
        const newPosition = index + 1;

        // Appel HTTP pour sauvegarder la position de la liste
        await patchList(listId, { position: newPosition });

        // TODO : il manque la gestion d'erreur
      });

      displaySuccessToast("Position des listes sauvegardée.");
    }
  });
}
