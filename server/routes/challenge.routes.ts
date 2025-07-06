import express, { Request, Response } from 'express';
import { Challenge } from '../models/Challenge';
import { validateMongoId } from '../utils/idUtils';
import { ChallengeParticipation } from '../models/ChallengeParticipation';
import { verifyToken } from '../middlewares/verifyToken';

const router = express.Router();

/**
 * POST /challenges
 * Créer un nouveau défi
 * Authentification requise: Bearer Token dans le header Authorization
 */
router.post('/', verifyToken, async (req: Request, res: Response): Promise<any> => {
  const { title, description, duration, difficulty, type, gym } = req.body;
  const creator = req.user.id; // ID extrait du token JWT

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
 * Authentification requise: Bearer Token dans le header Authorization
 */
router.get('/mine', verifyToken, async (req: Request, res: Response): Promise<any> => {
  const creatorId = req.user.id; // ID extrait du token JWT

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
 * Authentification requise: Bearer Token dans le header Authorization
 */
router.put('/:id', verifyToken, async (req: Request, res: Response): Promise<any> => {
  const { id } = req.params;
  const { title, description, duration, difficulty, type } = req.body;
  const creatorId = req.user.id; // ID extrait du token JWT

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
 * Authentification requise: Bearer Token dans le header Authorization
 */
router.delete('/:id', verifyToken, async (req: Request, res: Response): Promise<any> => {
  const { id } = req.params;
  const creatorId = req.user.id; // ID extrait du token JWT

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
 * Authentification requise: Bearer Token dans le header Authorization
 */
router.post('/:id/join', verifyToken, async (req: Request, res: Response): Promise<any> => {
  const { id } = req.params;
  const userId = req.user.id; // ID extrait du token JWT

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
