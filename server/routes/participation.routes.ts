/**
 * Routes pour la gestion de la participation aux défis
 */
import express, { Request, Response } from 'express';
import { ChallengeParticipation } from '../models/ChallengeParticipation';
import { validateMongoId } from '../utils/idUtils';
import { verifyToken } from '../middlewares/verifyToken';
import { User } from '../models/User';
import { verify } from 'jsonwebtoken';
import { ExerciseType } from '../models/ExerciseType';

const router = express.Router();

/**
 * PATCH /participations/:id/update-progression
 *Met à jour la progression du challenge d'un participant
 * Authentification requise: Bearer Token dans le header Authorization
 */
router.patch('/:id/update-progression', verifyToken, async (req: Request, res: Response) => {
  const { exerciseId, duration_sec } = req.body;
  const participationId = req.params.id;
  const userId = req.user.id;

  const validatedId = validateMongoId(participationId);
  if (!validatedId.valid) {
    res.status(400).json({ message: 'ID de participation invalide.' });
    return
  }

  if (!exerciseId || duration_sec === undefined) {
    res.status(400).json({ message: 'exerciseId et duration_sec sont requis.' });
    return
  }

  try {

    const exercise = await ExerciseType.findById(exerciseId);
    if(!exercise){
      res.status(404).json({
        message: "Exercice introuvable."
      })
      return
    }

    const exerciseCalories = exercise.calories;
   
    const filter = {
      _id: participationId,
      user: userId, 
      'progression.exercise': exerciseId
    };

    const update = {
      $set: {
        'progression.$.status': 'terminé',
        'progression.$.duration_sec': duration_sec
      },
      $inc: {
        burned_calories: exerciseCalories
      }
    };
    
    const updatedParticipation = await ChallengeParticipation.findOneAndUpdate(filter, update, {
      new: true 
    });
    
    if (!updatedParticipation) {
      res.status(404).json({message: 'Participation non trouvée, l\'exercice n\'existe pas dans cette participation ou vous n\'êtes pas autorisé à la modifier.',});
      return
    }

    res.status(200).json(updatedParticipation);

  } catch (error) {
    console.error("Erreur lors de la mise à jour :", error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

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

    const allExercisesFinished = participation.progression.every(progress => {
      return progress.status === 'terminé';
    });

    if(!allExercisesFinished){
      return res.status(403).json({message: 'Vous devez finir tous les exercices pour compléter ce challenge.'});
    }

    participation.status = 'terminé';
    participation.finishedAt = new Date();

    await participation.save();

    const user = await User.findById(userId)
    if(!user){
      return res.status(404).json({message: 'Utilisateur introuvable.'});
    }
    user.participation_count++
    await user.save();

    res.json({
      message: "Challenge terminé.",
      participation
    });

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
