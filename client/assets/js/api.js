import { apiBaseUrl } from "./config.js";

export async function getLists() {
  try {

    const httpResponse = await fetch(`${apiBaseUrl}/lists`);

    if (! httpResponse.ok) { // Si le serveur répond avec une 4XX ou 5XX
      console.log(httpResponse);
      return null; // retourner null pour que le "list.module.js" gère l'erreur
    }

    // Sinon, tout s'est bien passé, on peut parser le json
    const lists = await httpResponse.json(); // [{}, {}, {}]
    return lists;

  } catch (error) { // Si le serveur ne répond pas (Fail to Fetch)

    console.error(error);
    return null; // retourner null pour que le "list.module.js" gère l'erreur

  }
}

export async function postList(newListData) { // { title }
  try {

    const httpResponse = await fetch(`${apiBaseUrl}/lists`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newListData)
    });
    
    // Gestion d'erreur
    if (! httpResponse.ok) {
      console.log(httpResponse);
      return null;
    }

    const createdList = await httpResponse.json();
    return createdList;

  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function patchList(listId, newListData) {
  try {

    const httpResponse = await fetch(`${apiBaseUrl}/lists/${listId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newListData) // { title: "..." }
    });

    // Gestion d'erreur
    if (! httpResponse.ok) {
      console.log(httpResponse);
      return null;
    }

    // Si OK
    const updatedList = await httpResponse.json();
    return updatedList;

  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function deleteList(listId) {
  try {
    const httpResponse = await fetch(`${apiBaseUrl}/lists/${listId}`, {
      method: "DELETE"
    });
    
    // Gestion d'erreur
    if (! httpResponse.ok) {
      console.log(httpResponse);
      return false;
    }

    return true;

  } catch (error) {
    console.error(error);
    return false;
  }
}

export async function createCard(cardData) {
  try {

    const httpResponse = await fetch(`${apiBaseUrl}/cards`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cardData)
    });
  
    if (! httpResponse.ok) {
      console.log(httpResponse);
      return null;
    }
  
    const createdCard = await httpResponse.json();
    return createdCard;

  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function updateCard(cardId, cardData) {
  try {

    const httpResponse = await fetch(`${apiBaseUrl}/cards/${cardId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cardData)
    });
  
    if (!httpResponse.ok) {
      console.log(httpResponse);
      return null;
    }
  
    const updatedCard = await httpResponse.json();
    return updatedCard;

  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function deleteCard(cardId) {
  try {
    const httpResponse = await fetch(`${apiBaseUrl}/cards/${cardId}`, {
      method: "DELETE"
    });
  
    if (! httpResponse.ok) {
      console.error(httpResponse);
      return false;
    }
  
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}
