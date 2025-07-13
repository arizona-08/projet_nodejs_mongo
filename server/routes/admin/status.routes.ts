import express from 'express';
import { verifyToken } from '../../middlewares/verifyToken';
import { authorizeRoles } from '../../middlewares/authorizedRoles';
import { User } from '../../models/User';

const router = express.Router();

// Voir tous les users actifs
router.get('/active', verifyToken, authorizeRoles('admin'), async (_req, res) => {
  const users = await User.find({ active: true });
  res.json({ message: "Utilisateurs actifs", users });
});

// Voir tous les users inactifs
router.get('/inactive', verifyToken, authorizeRoles('admin'), async (_req, res) => {
  const users = await User.find({ active: false });
  res.json({ message: "Utilisateurs inactifs", users });
});

// Désactiver un user
router.patch('/deactivate/:id', verifyToken, authorizeRoles('admin'), async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { active: false }, { new: true });
  if (!user) {
    res.status(404).json({ message: "Utilisateur non trouvé" });
    return;
  }
  res.json({ message: "Utilisateur désactivé", user });
});

// Activer un user
router.patch('/activate/:id', verifyToken, authorizeRoles('admin'), async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { active: true }, { new: true });
  if (!user) {
    res.status(404).json({ message: "Utilisateur non trouvé" });
    return;
  }
  res.json({ message: "Utilisateur activé", user });
});

export default router;