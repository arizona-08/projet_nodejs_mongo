/**
 * Routes pour la gestion de la participation aux défis
 */
import express, { Request, Response } from 'express';
import { ChallengeParticipation } from '../models/ChallengeParticipation';
import { validateMongoId } from '../utils/idUtils';
import { verifyToken } from '../middlewares/verifyToken';

const router = express.Router();

/**
 * PATCH /participations/:id/complete
 * Marquer un défi comme terminé par le participant
 * Authentification requise: Bearer Token dans le header Authorization
 */
router.patch('/:id/complete', verifyToken, async (req: Request, res: Response): Promise<any> => {
  const { id } = req.params;
  const userId = req.user.id; // ID extrait du token JWT

  const validatedId = validateMongoId(id);
  if (!validatedId.valid) {
    return res.status(400).json({ message: 'ID invalide : doit être un ObjectId MongoDB' });
  }

  try {
    const participation = await ChallengeParticipation.findById(validatedId.id);
    if (!participation) {
      return res.status(404).json({ message: 'Participation non trouvée' });
    }

    if (participation.user.toString() !== userId) {
      return res.status(403).json({ message: 'Accès refusé : vous n\'êtes pas le participant de ce défi' });
    }

    participation.status = 'terminé';
    participation.finishedAt = new Date();

    await participation.save();
    res.json(participation);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur lors de la complétion du défi' });
  }
});

/**
 * GET /participations/mine
 * Récupérer tous les défis auxquels l'utilisateur a participé
 * Authentification requise: Bearer Token dans le header Authorization
 */
router.get('/mine', verifyToken, async (req: Request, res: Response): Promise<any> => {
  const userId = req.user.id; // ID extrait du token JWT

  try {
    const participations = await ChallengeParticipation.find({ user: userId }).populate('challenge');
    res.json(participations);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur lors de la récupération des participations' });
  }
});

export default router;
