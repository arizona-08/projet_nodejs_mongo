/**
 * Routes pour les Salles de sport (Gyms)
 * Base URL à utiliser dans Postman : http://localhost:3000/gyms
 */
import express, { Request, Response } from 'express';
import { Gym } from '../models/Gym';
import mongoose from 'mongoose';
import { validateMongoId } from '../utils/idUtils';

const router = express.Router();

/**
 * [POST] http://localhost:3000/gyms/gyms
 * Créer une salle de sport (propriétaire)
 * Body JSON attendu :
 * {
 *   "name": "Salle Titan",
 *   "address": "12 rue du Sport, Paris",
 *   "equipments": ["tapis", "haltères"],
 *   "description": "Salle très équipée",
 *   "activities": ["musculation", "cardio"]
 * }
 */
router.post('/gyms', async (req: Request, res: Response): Promise<any> => {
  const { name, address, equipments, description, activities } = req.body;

  // Simuler un propriétaire (à remplacer par l'authentification réelle)
  const owner = new mongoose.Types.ObjectId(); // ou req.user._id si auth

  try {
    const newGym = new Gym({
      name,
      address,
      equipments,
      description,
      activities,
      owner,
    });
    await newGym.save();
    res.status(201).json(newGym);
  } catch (error) {
    console.error('Erreur lors de la création de la salle :', error);
    res.status(500).json({ message: 'Erreur serveur lors de la création de la salle' });
  }
});

/**
 * [GET] http://localhost:3000/gyms/gyms/my
 * Voir toutes les salles créées par le propriétaire connecté (simulé ici)
 */
router.get('/gyms/my', async (req: Request, res: Response): Promise<any> => {
  // Simuler un propriétaire (à remplacer par l'authentification réelle)
  const ownerId = '000000000000000000000000'; // Remplacer par req.user._id si auth

  try {
    const gyms = await Gym.find({ owner: ownerId });
    res.json(gyms);
  } catch (error) {
    console.error('Erreur lors de la récupération des salles du propriétaire :', error);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération des salles' });
  }
});

/**
 * [PUT] http://localhost:3000/gyms/gyms/:id
 * Modifier une salle de sport existante (propriétaire)
 * Paramètre : ID de la salle dans l'URL
 * Body JSON : (champ libre, seuls les champs fournis seront mis à jour)
 * {
 *   "name": "Nouvelle salle",
 *   "description": "Description mise à jour"
 * }
 */
router.put('/gyms/:id', async (req: Request, res: Response): Promise<any> => {
  const { id } = req.params;
  const { name, address, equipments, description, activities } = req.body;
  // Simuler un propriétaire (à remplacer par l'authentification réelle)
  const ownerId = '000000000000000000000000'; // Remplacer par req.user._id si auth

  console.log('Requête PUT reçue pour /gyms/:id');
  console.log('Param ID =', id);
  console.log('Body =', req.body);

  try {
    const validatedId = validateMongoId(id);
    if (!validatedId.valid) {
      return res.status(400).json({ message: 'ID invalide: doit être un ObjectId MongoDB valide (24 caractères)' });
    }
    
    const gym = await Gym.findById(validatedId.id);
    if (!gym) {
      return res.status(404).json({ message: 'Salle non trouvée' });
    }
    
    if (gym.owner.toString() !== ownerId) {
      return res.status(403).json({ message: 'Accès refusé : vous n\'êtes pas le propriétaire de cette salle' });
    }
    gym.name = name ?? gym.name;
    gym.address = address ?? gym.address;
    gym.equipments = equipments ?? gym.equipments;
    gym.description = description ?? gym.description;
    gym.activities = activities ?? gym.activities;
    await gym.save();
    res.json(gym);
  } catch (error) {
    console.error('Erreur dans PUT /gyms/:id :', error);
    res.status(500).json({ message: 'Erreur serveur lors de la modification de la salle' });
  }
});

/**
 * [DELETE] http://localhost:3000/gyms/gyms/:id
 * Supprimer une salle de sport (propriétaire)
 * Paramètre : ID de la salle dans l'URL
 */
router.delete('/gyms/:id', async (req: Request, res: Response): Promise<any> => {
  const { id } = req.params;
  // Simuler un propriétaire (à remplacer par l'authentification réelle)
  const ownerId = '000000000000000000000000'; // Remplacer par req.user._id si auth

  try {
    const validatedId = validateMongoId(id);
    if (!validatedId.valid) {
      return res.status(400).json({ message: 'ID invalide: doit être un ObjectId MongoDB valide (24 caractères)' });
    }
    
    const gym = await Gym.findById(validatedId.id);
    if (!gym) {
      return res.status(404).json({ message: 'Salle non trouvée' });
    }
    
    if (gym.owner.toString() !== ownerId) {
      return res.status(403).json({ message: 'Accès refusé : vous n\'êtes pas le propriétaire de cette salle' });
    }
    await gym.deleteOne();
    res.json({ message: 'Salle supprimée avec succès' });
  } catch (error) {
    console.error('Erreur dans DELETE /gyms/:id :', error);
    res.status(500).json({ message: 'Erreur serveur lors de la suppression de la salle' });
  }
});

export default router;
