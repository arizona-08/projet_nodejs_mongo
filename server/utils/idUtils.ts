/**
 * Utilitaires pour les routes de l'API
 */
import mongoose from 'mongoose';

/**
 * Vérifie et corrige un ID MongoDB si nécessaire
 * @param id L'ID à vérifier/corriger
 * @returns L'ID corrigé si possible, ou l'original sinon
 */
export const validateMongoId = (id: string): { valid: boolean; id: string } => {
  // Si l'ID est déjà valide, le retourner directement
  if (mongoose.Types.ObjectId.isValid(id)) {
    return { valid: true, id };
  }
  
  // Si l'ID a 23 caractères, essayer d'ajouter un caractère
  if (id.length === 23) {
    const possibleChars = '0123456789abcdef';
    for (const char of possibleChars) {
      const testId = id + char;
      if (mongoose.Types.ObjectId.isValid(testId)) {
        console.log(`ID corrigé: ${id} -> ${testId}`);
        return { valid: true, id: testId };
      }
    }
  }
  
  // L'ID n'est pas valide et ne peut pas être corrigé
  return { valid: false, id };
};
