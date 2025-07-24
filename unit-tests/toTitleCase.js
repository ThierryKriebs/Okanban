/**
 * Retourne une chaîne de caractères dont la première lettre de 
 * chaque mot est en majuscule et les autres lettres en minuscules.
 * @param {string} str 
 * @returns string
 */
export function toTitleCase(str) {
  return (!str || !str.length) ? '' : str.toLowerCase().split(' ').map((s) => s.length ? s[0].toUpperCase() + s.substring(1) : s).join(' ');
}