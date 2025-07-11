import { Request, Response, Router } from "express";
import { verifyToken } from "../../middlewares/verifyToken";
import { authorizeRoles } from "../../middlewares/authorizedRoles";
import { Gym } from "../../models/Gym";

const router = Router();

router.get('/', verifyToken, authorizeRoles('admin'), async (req: Request, res: Response) => {
  const allGyms = await Gym.find();
  console.log(allGyms);
  res.status(200).send(allGyms)
})

router.post('/create', verifyToken, authorizeRoles('admin'), async (req: Request, res: Response) => {
  
})


export default router