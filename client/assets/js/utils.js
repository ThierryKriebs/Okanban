import "animate.css"; // Grâce à notre bundler, on peut "charger" le CSS depuis un fichier JS

import { toast } from "bulma-toast";
import JSConfetti from "js-confetti";

export function initClosingModalsButtons() {
  // Selectionner TOUS les boutons de fermeture de modal
  const closingButtons = document.querySelectorAll(".close"); // On se permet de selectionner par la classe .close car c'est sa seule respnsabilité ! // [{}, {}, {}]

  // POUR CHAQUE BOUTON : 
  closingButtons.forEach(closingButton => {
    // - on pose un listener sur le bouton, en cas de click
    closingButton.addEventListener("click", closeActiveModal);
  });
}

export function closeActiveModal() {
  //   - selectionner la modal ACTIVE
  const activeModal = document.querySelector(".is-active");

  //   - lui retirer la classe is-active
  activeModal.classList.remove("is-active");
}

export function displaySuccessToast(message) {
  toast({
    message: message,
    type: "is-success",
    dismissible: true,
    animate: { in: "fadeIn", out: "fadeOut" },
  });
}

export function showErrorModal() {
  // Selectionner la modale d'erreur
  const errorModal = document.querySelector("#error-modal");
  // Lui ajouter la classe is-active
  errorModal.classList.add("is-active");
}

export const confetti = new JSConfetti(); // Note : creates HTML Canvas element and adds it to page, so call it only once!
