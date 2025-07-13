import { Router } from "express";
import { verifyToken } from "../../middlewares/verifyToken";
import { authorizeRoles } from "../../middlewares/authorizedRoles";
import { Badge } from "../../models/Badge";
import { User } from "../../models/User";

const router = Router();

// Créer un badge
router.post("/", verifyToken, authorizeRoles("admin"), async (req, res) => {
  try {
    const badge = new Badge(req.body);
    await badge.save();
    res.status(201).json({ message: "Badge créé", badge });
  } catch (e) {
    res.status(500).json({ message: "Erreur lors de la création du badge" });
  }
});

// Voir tous les badges
router.get("/", verifyToken, authorizeRoles("admin"), async (_req, res) => {
  try {
    const badges = await Badge.find();
    res.json({ message: "Liste des badges", badges });
  } catch (e) {
    res.status(500).json({ message: "Erreur lors de la récupération des badges" });
  }
});

// Modifier un badge
router.put("/:id", verifyToken, authorizeRoles("admin"), async (req, res) => {
  try {
    const badge = await Badge.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!badge) {
      res.status(404).json({ message: "Badge non trouvé" });
      return;
    }
    res.json({ message: "Badge modifié", badge });
  } catch (e) {
    res.status(500).json({ message: "Erreur lors de la modification du badge" });
  }
});

// Supprimer un badge
router.delete("/:id", verifyToken, authorizeRoles("admin"), async (req, res) => {
  try {
    const badge = await Badge.findByIdAndDelete(req.params.id);
    if (!badge) {
      res.status(404).json({ message: "Badge non trouvé" });
      return;
    }
    res.json({ message: "Badge supprimé", badge });
  } catch (e) {
    res.status(500).json({ message: "Erreur lors de la suppression du badge" });
  }
});

// Attribuer un badge à un user
router.post("/give/:userId/:badgeId", verifyToken, authorizeRoles("admin"), async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { $addToSet: { badges: req.params.badgeId } },
      { new: true }
    );
    if (!user) {
      res.status(404).json({ message: "Utilisateur non trouvé" });
      return;
    }
    res.json({ message: "Badge attribué à l'utilisateur", user });
  } catch (e) {
    res.status(500).json({ message: "Erreur lors de l'attribution du badge" });
  }
});

// Retirer un badge à un user
router.post("/remove/:userId/:badgeId", verifyToken, authorizeRoles("admin"), async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { $pull: { badges: req.params.badgeId } },
      { new: true }
    );
    if (!user) {
      res.status(404).json({ message: "Utilisateur non trouvé" });
      return;
    }
    res.json({ message: "Badge retiré à l'utilisateur", user });
  } catch (e) {
    res.status(500).json({ message: "Erreur lors du retrait du badge" });
  }
});

export default router;