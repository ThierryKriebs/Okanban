import { createCard, deleteCard, updateCard } from "./api.js";
import { closeActiveModal, displaySuccessToast, showErrorModal } from "./utils.js";

export function addCardToList(card) { // card = { id, color, content, list_id }
  // Récupérer le template d'une carte
  const cardTemplate = document.querySelector("#card-template");

  // Cloner le template
  const cardClone = cardTemplate.content.cloneNode(true);

  // Modifier le clone :
  cardClone.querySelector('[slot="card-content"]').textContent = card.content; // - changer son contenu
  cardClone.querySelector('[slot="card-id"]').id = `card-${card.id}`; // lui mettre un id
  cardClone.querySelector('[slot="card-id"]').style.border = `2px solid ${card.color}`; // - changer sa couleur

  // Ajout d'un listener sur le bouton 🖍️ d'une carte
  const editCardButton = cardClone.querySelector('[slot="edit-card-button"]');
  editCardButton.addEventListener("click", () => {
    const editCardModal = document.querySelector("#edit-card-modal");
    editCardModal.classList.add("is-active");
    editCardModal.dataset.cardId = card.id;

    // Bonus : afficher les valeurs existantes dans le formulaire d'édition
    const previousCardContent = document.querySelector(`#card-${card.id} [slot="card-content"]`).textContent;
    editCardModal.querySelector('input[name="content"]').value = previousCardContent;

    const previousCardColor = document.querySelector(`#card-${card.id}`).style.borderColor;
    editCardModal.querySelector('input[name="color"]').value = rgbToHexa(previousCardColor);
  });

  // Ajout d'un listener sur le bouton 🗑️ d'une carte
  const deleteCardButton = cardClone.querySelector('[slot="delete-card-button"]');
  deleteCardButton.addEventListener("click", () => {
    const deleteCardModal = document.querySelector('#delete-card-modal');
    deleteCardModal.classList.add("is-active");
    deleteCardModal.dataset.cardId = card.id;
  });

  // Sélectionner le parent : la bonne liste avec le bon ID (list_id) =>  slot="list-content"
  const cardsContainer = document.querySelector(`#list-${card.list_id} [slot="list-content"]`);
  
  // Insère le clone dans le parent
  cardsContainer.prepend(cardClone);
}

export function initAddCardForm() {
  // Selectionner la modale d'ajout de carte
  const addCardModal = document.querySelector('#add-card-modal');

  // Selectionner le formulaire d'ajout de carte
  const addCardForm = document.querySelector("#add-card-form");

  // Ecouter le submit sur le formulaire, en cas de click : 
  addCardForm.addEventListener("submit", async (event) => {
    event.preventDefault(); // preventDefault

    // Récupérer le contenu du formulaire { content, color }
    const cardData = Object.fromEntries(new FormData(addCardForm));
    // Récupérer l'ID de la liste pour créer la carte : dans les dataset
    const listId = parseInt(addCardModal.dataset.listId);

    // POSTS /cards   avec BODY = { content, color, list_id }
    const body = { content: cardData.content, color: cardData.color, list_id: listId };
    const createdCard = await createCard(body);
    
    if (!createdCard) { // Si pas ok : modal d'erreur
      showErrorModal();
    } else { // Si ok : toast de succès + insérer la nouvelle carte dans la bonne liste 
      displaySuccessToast("La carte a été créée avec succès.");
      addCardToList(createdCard);
    }

    addCardForm.reset(); // Reset le form
    closeActiveModal(); // Fermer la modale
  });
}

export function initEditCardForm() {
  const editCardModal = document.querySelector("#edit-card-modal");
  const editCardForm = document.querySelector("#edit-card-form");

  editCardForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const cardData = Object.fromEntries(new FormData(editCardForm));
    const cardId = editCardModal.dataset.cardId;

    const updatedCard = await updateCard(cardId, cardData);
    if (! updatedCard) {
      showErrorModal();
      closeActiveModal();
      return;
    }

    document.querySelector(`#card-${updatedCard.id}`).style.borderColor = updatedCard.color;
    document.querySelector(`#card-${updatedCard.id} [slot="card-content"]`).textContent = updatedCard.content;
    displaySuccessToast("Carte mise à jour avec succès.");
    closeActiveModal();
  });
}

export async function initDeleteCardForm() {
  const deleteCardModal = document.querySelector("#delete-card-modal");
  const deleteCardForm = document.querySelector("#delete-card-form");

  deleteCardForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const cardId = deleteCardModal.dataset.cardId;
    const hasBeenDeleted = await deleteCard(cardId);

    if (! hasBeenDeleted) {
      showErrorModal();
    } else {
      displaySuccessToast("Carte supprimée avec succès.");
      const deletedCardElement = document.querySelector(`#card-${cardId}`);
      deletedCardElement.remove();
    }

    closeActiveModal();
  });
}

function rgbToHexa(rgb) { // rgb = "rgb(XXX, XXX, XXX)"
  const [, red, green, blue] = rgb.match(/(\d{1,3}), (\d{1,3}), (\d{1,3})/);
  const [hexRed, hexGreen, hexBlue] = [convert(red), convert(green), convert(blue)];
  return `#${hexRed}${hexGreen}${hexBlue}`;

  function convert(color) { return Number(color).toString(16).padStart(2, '0'); }
}
