import { Router } from "express";
import { verifyToken } from "../../middlewares/verifyToken";
import { authorizeRoles } from "../../middlewares/authorizedRoles";
import { Category } from "../../models/Category";

const router = Router();

router.post("/", verifyToken, authorizeRoles("admin"), async (req, res) => {
  try {
    const category = new Category(req.body);
    await category.save();
    res.status(201).json({ message: "Catégorie créée", category });
  } catch (e) {
    res.status(500).json({ message: "Erreur lors de la création de la catégorie" });
  }
});

router.get("/", verifyToken, authorizeRoles("admin"), async (req, res) => {
  const { type } = req.query;
  const filter = type ? { type } : {};
  try {
    const categories = await Category.find(filter);
    res.json({ message: "Liste des catégories", categories });
  } catch (e) {
    res.status(500).json({ message: "Erreur lors de la récupération des catégories" });
  }
});

router.put("/:id", verifyToken, authorizeRoles("admin"), async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!category) {
      res.status(404).json({ message: "Catégorie non trouvée" });
      return;
    }
    res.json({ message: "Catégorie modifiée", category });
  } catch (e) {
    res.status(500).json({ message: "Erreur lors de la modification de la catégorie" });
  }
});

router.delete("/:id", verifyToken, authorizeRoles("admin"), async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      res.status(404).json({ message: "Catégorie non trouvée" });
      return;
    }
    res.json({ message: "Catégorie supprimée" });
  } catch (e) {
    res.status(500).json({ message: "Erreur lors de la suppression de la catégorie" });
  }
});

export default router;