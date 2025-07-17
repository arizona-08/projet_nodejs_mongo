import { Request, Response, Router } from "express";
import { verifyToken } from "../middlewares/verifyToken";
import { User } from "../models/User";

const router = Router();

router.get('/', verifyToken, async (req: Request, res: Response) => {
try {
    const topUsers = await User.find({ role: 'client' })
      .sort({ participation_count: -1 }) // Trie par participation_count en ordre décroissant
      .limit(10) // Optionnel : pour ne récupérer que le top 10
      .select('firstname lastname participation_count badges'); // Optionnel : pour ne sélectionner que les champs utiles

    res.status(200).json(topUsers);

  } catch (error) {
    console.error("Erreur lors de la récupération du classement :", error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
})

export default router