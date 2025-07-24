/**
 * Retourne le nombre de points selon le niveau.
 * @param {number} level 
 * @returns number
 */
export function computeStrength(level) {
  // nombre de points
  let points = 0;

  // sur les niveaux supérieurs à 200
  // par exemple level = 205
  if (level > 200) {
    // le personnage gagne 1 point tous les 5 niveaux
    // on calcul le nombre de niveaux au dessus de 200
    //  - level - 200
    //  - on divise le résultat par 5 (1 point tous les 5 niveaux)
    //  - on récupère la partie entière
    // par exemple (205 - 200) = 5, 5 / 5 = 1
    points += Math.trunc((level - 200) / 5);
    // on met à jour le niveau pour poursuivre le calcul
    // par exemple 205 - 200 = 5, level = 205 - 5 = 200
    level -= (level - 200);
  }

  if (level > 100) {
    points += Math.trunc((level - 100) / 3);
    level -= (level - 100);
  }

  if (level > 50) {
    points += Math.trunc((level - 50) / 2);
    level -= (level - 50);
  }

  // ici il reste au maximum level = 50
  points += level;

  return points;
}