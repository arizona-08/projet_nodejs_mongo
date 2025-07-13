import { Router } from "express";
import { verifyToken } from "../../middlewares/verifyToken";
import { authorizeRoles } from "../../middlewares/authorizedRoles";
import { Reward } from "../../models/Reward";
import { User } from "../../models/User";
import { Badge } from "../../models/Badge";

const router = Router();

// Créer une récompense
router.post("/", verifyToken, authorizeRoles("admin"), async (req, res) => {
  try {
    const reward = new Reward(req.body);
    await reward.save();
    res.status(201).json({ message: "Récompense créée", reward });
  } catch (e) {
    res.status(500).json({ message: "Erreur lors de la création de la récompense" });
  }
});

// Voir toutes les récompenses
router.get("/", verifyToken, authorizeRoles("admin"), async (_req, res) => {
  try {
    const rewards = await Reward.find();
    res.json({ message: "Liste des récompenses", rewards });
  } catch (e) {
    res.status(500).json({ message: "Erreur lors de la récupération des récompenses" });
  }
});

// Modifier une récompense
router.put("/:id", verifyToken, authorizeRoles("admin"), async (req, res) => {
  try {
    const reward = await Reward.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!reward) {
      res.status(404).json({ message: "Récompense non trouvée" });
      return;
    }
    res.json({ message: "Récompense modifiée", reward });
  } catch (e) {
    res.status(500).json({ message: "Erreur lors de la modification de la récompense" });
  }
});

// Supprimer une récompense
router.delete("/:id", verifyToken, authorizeRoles("admin"), async (req, res) => {
  try {
    const reward = await Reward.findByIdAndDelete(req.params.id);
    if (!reward) {
      res.status(404).json({ message: "Récompense non trouvée" });
      return;
    }
    res.json({ message: "Récompense supprimée", reward });
  } catch (e) {
    res.status(500).json({ message: "Erreur lors de la suppression de la récompense" });
  }
});

// Attribution automatique (exemple : tous les badges)
router.post("/auto/assign/:userId", verifyToken, authorizeRoles("admin"), async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).populate("badges");
    const allBadges = await Badge.find();
    if (user && user.badges.length === allBadges.length) {
      // Exemple : attribuer la récompense "all_badges"
      const reward = await Reward.findOne({ condition: "all_badges" });
      if (reward) {
        await User.findByIdAndUpdate(
          req.params.userId,
          { $addToSet: { rewards: reward._id } }
        );
        res.json({ message: "Récompense attribuée automatiquement", user });
        return;
      }
      res.status(404).json({ message: "Récompense 'all_badges' non trouvée" });
      return;
    }
    res.status(400).json({ message: "Condition non remplie" });
  } catch (e) {
    res.status(500).json({ message: "Erreur lors de l'attribution automatique de la récompense" });
  }
});

export default router;