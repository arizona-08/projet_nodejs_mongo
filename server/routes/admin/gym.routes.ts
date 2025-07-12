import { Request, Response, Router } from "express";
import { verifyToken } from "../../middlewares/verifyToken";
import { authorizeRoles } from "../../middlewares/authorizedRoles";
import { Gym } from "../../models/Gym";

const router = Router();

// Voir toutes les salles
router.get('/', verifyToken, authorizeRoles('admin'), async (req: Request, res: Response) => {
  const allGyms = await Gym.find();
  res.status(200).send(allGyms)
});

// Approuver une salle
router.patch('/approve/:id', verifyToken, authorizeRoles('admin'), async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const gym = await Gym.findByIdAndUpdate(id, { $set: { approved: true } }, { new: true });
    if (!gym) {
      res.status(404).json({ message: "Salle non trouvée" });
      return;
    }
    res.json({ message: "Salle approuvée", gym });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de l'approbation" });
    return;
  }
});

// Désapprouver une salle
router.patch('/disapprove/:id', verifyToken, authorizeRoles('admin'), async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const gym = await Gym.findByIdAndUpdate(id, { $set: { approved: false } }, { new: true });
    if (!gym) {
      res.status(404).json({ message: "Salle non trouvée" });
      return;
    }
    res.json({ message: "Salle désapprouvée", gym });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la désapprobation" });
    return;
  }
});

// Modifier une salle (admin)
router.put('/edit/:id', verifyToken, authorizeRoles('admin'), async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, address, equipments, description, activities } = req.body;
  try {
    const gym = await Gym.findByIdAndUpdate(
      id,
      { name, address, equipments, description, activities },
      { new: true }
    );
    if (!gym) {
      res.status(404).json({ message: "Salle non trouvée" });
      return;
    }
    res.json({ message: "Salle modifiée", gym });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la modification" });
    return;
  }
});

// Supprimer une salle (admin)
router.delete('/delete/:id', verifyToken, authorizeRoles('admin'), async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const gym = await Gym.findByIdAndDelete(id);
    if (!gym) {
      res.status(404).json({ message: "Salle non trouvée" });
      return;
    }
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la suppression" });
    return;
  }
  res.json({ message: "Salle supprimée" });
});

export default router;