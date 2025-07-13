import { Router } from "express";
import { verifyToken } from "../../middlewares/verifyToken";
import { authorizeRoles } from "../../middlewares/authorizedRoles";
import { Filter } from "../../models/Filter";

const router = Router();

router.post("/", verifyToken, authorizeRoles("admin"), async (req, res) => {
  try {
    const filter = new Filter(req.body);
    await filter.save();
    res.status(201).json({ message: "Filtre créé", filter });
  } catch (e) {
    res.status(500).json({ message: "Erreur lors de la création du filtre" });
  }
});

router.get("/", verifyToken, authorizeRoles("admin"), async (req, res) => {
  const { type } = req.query;
  const filter = type ? { type } : {};
  try {
    const filters = await Filter.find(filter);
    res.json({ message: "Liste des filtres", filters });
  } catch (e) {
    res.status(500).json({ message: "Erreur lors de la récupération des filtres" });
  }
});

router.put("/:id", verifyToken, authorizeRoles("admin"), async (req, res) => {
  try {
    const filter = await Filter.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!filter) {
      res.status(404).json({ message: "Filtre non trouvé" });
      return;
    }
    res.json({ message: "Filtre modifié", filter });
  } catch (e) {
    res.status(500).json({ message: "Erreur lors de la modification du filtre" });
  }
});

router.delete("/:id", verifyToken, authorizeRoles("admin"), async (req, res) => {
  try {
    const filter = await Filter.findByIdAndDelete(req.params.id);
    if (!filter) {
      res.status(404).json({ message: "Filtre non trouvé" });
      return;
    }
    res.json({ message: "Filtre supprimé" });
  } catch (e) {
    res.status(500).json({ message: "Erreur lors de la suppression du filtre" });
  }
});

export default router;