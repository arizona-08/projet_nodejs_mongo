import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Challenge } from '../models/Challenge';
import { validateMongoId } from '../utils/idUtils';
import { ChallengeParticipation } from '../models/ChallengeParticipation';

const router = express.Router();

/**
 * POST /challenges
 * Créer un nouveau défi
 */
router.post('/', async (req: Request, res: Response): Promise<any> => {
  const { title, description, duration, difficulty, type, gym } = req.body;
  const creator = new mongoose.Types.ObjectId(); // À remplacer par req.user._id

  try {
    const newChallenge = new Challenge({
      title,
      description,
      duration,
      difficulty,
      type,
      creator,
      gym,
    });
    await newChallenge.save();
    res.status(201).json(newChallenge);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur lors de la création du défi' });
  }
});

/**
 * GET /challenges
 * Récupérer tous les défis avec filtres facultatifs
 */
router.get('/', async (req: Request, res: Response): Promise<any> => {
  const { difficulty, type, duration } = req.query;
  const filter: any = {};
  if (difficulty) filter.difficulty = difficulty;
  if (type) filter.type = type;
  if (duration) filter.duration = Number(duration);

  try {
    const challenges = await Challenge.find(filter);
    res.json(challenges);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur lors de la récupération des défis' });
  }
});

/**
 * GET /challenges/mine
 * Voir les défis créés par l'utilisateur connecté
 */
router.get('/mine', async (req: Request, res: Response): Promise<any> => {
  const creatorId = '000000000000000000000000'; // Remplacer par req.user._id

  try {
    const challenges = await Challenge.find({ creator: creatorId });
    res.json(challenges);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur lors de la récupération des défis' });
  }
});

/**
 * GET /challenges/gym/:gymId
 * Voir les défis liés à une salle spécifique
 */
router.get('/gym/:gymId', async (req: Request, res: Response): Promise<any> => {
  const { gymId } = req.params;

  try {
    const challenges = await Challenge.find({ gym: gymId });
    res.json(challenges);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur lors de la récupération des défis pour la salle' });
  }
});

/**
 * PUT /challenges/:id
 * Modifier un défi créé par l'utilisateur
 */
router.put('/:id', async (req: Request, res: Response): Promise<any> => {
  const { id } = req.params;
  const { title, description, duration, difficulty, type } = req.body;
  const creatorId = '000000000000000000000000'; // À remplacer par req.user._id

  const validatedId = validateMongoId(id);
  if (!validatedId.valid) {
    return res.status(400).json({ message: 'ID invalide : doit être un ObjectId MongoDB' });
  }

  try {
    const challenge = await Challenge.findById(validatedId.id);
    if (!challenge) return res.status(404).json({ message: 'Défi non trouvé' });
    if (challenge.creator.toString() !== creatorId) {
      return res.status(403).json({ message: 'Accès refusé : vous n\'êtes pas le créateur' });
    }

    challenge.title = title ?? challenge.title;
    challenge.description = description ?? challenge.description;
    challenge.duration = duration ?? challenge.duration;
    challenge.difficulty = difficulty ?? challenge.difficulty;
    challenge.type = type ?? challenge.type;

    await challenge.save();
    res.json(challenge);
  } catch (error) {
    console.error('Erreur modification défi :', error);
    res.status(500).json({ message: 'Erreur serveur lors de la modification' });
  }
});

/**
 * DELETE /challenges/:id
 * Supprimer un défi créé par l'utilisateur
 */
router.delete('/:id', async (req: Request, res: Response): Promise<any> => {
  const { id } = req.params;
  const creatorId = '000000000000000000000000'; // À remplacer par req.user._id

  const validatedId = validateMongoId(id);
  if (!validatedId.valid) {
    return res.status(400).json({ message: 'ID invalide : doit être un ObjectId MongoDB' });
  }

  try {
    const challenge = await Challenge.findById(validatedId.id);
    if (!challenge) return res.status(404).json({ message: 'Défi non trouvé' });
    if (challenge.creator.toString() !== creatorId) {
      return res.status(403).json({ message: 'Accès refusé : vous n\'êtes pas le créateur' });
    }

    await challenge.deleteOne();
    res.json({ message: 'Défi supprimé avec succès' });
  } catch (error) {
    console.error('Erreur suppression défi :', error);
    res.status(500).json({ message: 'Erreur serveur lors de la suppression' });
  }
});

/**
 * POST /challenges/:id/join
 * Rejoindre un défi social (crée une participation)
 */
router.post('/:id/join', async (req: Request, res: Response): Promise<any> => {
  const { id } = req.params;
  const userId = '000000000000000000000000'; // À remplacer par req.user._id

  const validatedId = validateMongoId(id);
  if (!validatedId.valid) {
    return res.status(400).json({ message: 'ID invalide : doit être un ObjectId MongoDB' });
  }

  try {
    const challenge = await Challenge.findById(validatedId.id);
    if (!challenge) return res.status(404).json({ message: 'Défi non trouvé' });

    const existing = await ChallengeParticipation.findOne({ challenge: id, user: userId });
    if (existing) {
      return res.status(400).json({ message: 'Déjà inscrit à ce défi' });
    }

    const participation = new ChallengeParticipation({
      challenge: id,
      user: userId,
      status: 'en cours',
      startedAt: new Date(),
    });

    await participation.save();
    res.status(201).json(participation);
  } catch (error) {
    console.error('Erreur participation défi :', error);
    res.status(500).json({ message: 'Erreur serveur lors de la participation' });
  }
});

export default router;
