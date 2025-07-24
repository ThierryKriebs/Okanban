import {
  fetchAndDisplayLists,
  initAddListButton,
  initAddListForm,
  initEditListForm,
  initDeleteListForm,
  initListsDragAndDrop
} from "./list.module.js";

import {
  initAddCardForm,
  initDeleteCardForm,
  initEditCardForm,
} from "./cards.module.js";

import {
  initClosingModalsButtons
} from "./utils.js";

// Lorsque l'intégralité du DOM est chargé dans la page, on lance notre code JS
document.addEventListener("DOMContentLoaded", async () => {

  initAddListButton();
  initClosingModalsButtons();

  initAddListForm();
  initEditListForm();

  initDeleteListForm();
  initListsDragAndDrop();

  initAddCardForm();
  initEditCardForm();
  initDeleteCardForm();

  await fetchAndDisplayLists();
});
