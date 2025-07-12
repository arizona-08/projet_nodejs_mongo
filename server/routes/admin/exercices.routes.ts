import { Router, Request, Response } from "express";
import { verifyToken } from "../../middlewares/verifyToken";
import { authorizeRoles } from "../../middlewares/authorizedRoles";
import { ExerciseType } from "../../models/ExerciseType";

const router = Router();

// Créer un type d'exercice
router.post('/', verifyToken, authorizeRoles('admin'), async (req: Request, res: Response) => {
  const { name, description, muscles } = req.body;
  try {
    const exercise = new ExerciseType({ name, description, muscles });
    await exercise.save();
    res.status(201).json({ message: "Type d'exercice créé", exercise });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la création" });
  }
});

// Voir tous les types d'exercice
router.get('/', verifyToken, authorizeRoles('admin'), async (_req: Request, res: Response) => {
  try {
    const exercises = await ExerciseType.find();
    res.json({ message: "Liste des types d'exercice", exercises });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération" });
  }
});

// Modifier un type d'exercice
router.put('/:id', verifyToken, authorizeRoles('admin'), async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, description, muscles } = req.body;
  try {
    const exercise = await ExerciseType.findByIdAndUpdate(
      id,
      { name, description, muscles },
      { new: true }
    );
    if (!exercise) {
      res.status(404).json({ message: "Type d'exercice non trouvé" });
      return;
    }
    res.json({ message: "Type d'exercice modifié", exercise });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la modification" });
  }
});

// Supprimer un type d'exercice
router.delete('/:id', verifyToken, authorizeRoles('admin'), async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const exercise = await ExerciseType.findByIdAndDelete(id);
    if (!exercise) {
      res.status(404).json({ message: "Type d'exercice non trouvé" });
      return;
    }
    res.json({ message: "Type d'exercice supprimé" });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la suppression" });
  }
});

export default router;

