import express from 'express';
import {Request, Response} from 'express';
import { User } from '../models/User';
import bcrypt from 'bcryptjs';
import jsonwebtoken from 'jsonwebtoken'
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

/**
 * retourne un mot de passe hashé
 * @param password 
 * @returns 
 */
async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  return hashedPassword;
}

/**
 * @description Route pour l'inscription
 */
router.post('/register', async (req: Request, res: Response) => {
  const {firstname, lastname, email, password} = req.body;

  try {
      const newUser = new User({
        firstname: firstname,
        lastname: lastname,
        email: email,
        password: await hashPassword(password)
      })
  
      await newUser.save()
      console.log('✅ Utilisateur inséré avec succès')
      res.status(201).json({
        message: 'Utilisateur inséré avec succès',
        user: newUser
      })
    } catch (error) {
      console.error('❌ Erreur lors de l\'insertion :', error)
    }
})

/**
 * @description Route pour la connexion
 */
router.post('/login', async (req: Request, res: Response) => {
  const {email, password} = req.body;
  // 1. Trouver l'utilisateur dans la base de données
  const user = await User.findOne({ email });

  if (user) {
    // 2. Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.password as string);
    if (!isPasswordValid) {
      res.status(401).json({ message: "Email ou mot de passe incorrect" });
      return; 
    }

    // 3. Créer le JWT
    const payload = { 
      id: user._id,
      role: user.role // Vous pouvez ajouter d'autres infos non sensibles
    };

    const secretKey = process.env.JWT_SECRET as string; // ⚠️ Toujours utiliser une variable d'environnement !

    const token = jsonwebtoken.sign(payload, secretKey, { expiresIn: '1h' }); // Le token expirera dans 1 heure

    // 4. Envoyer le token au client
    res.json({ 
      message: "Connexion réussie",
      token: token 
    });
  } else {
    res.status(401).json({ message: "Email ou mot de passe incorrect" });
    return; 
  }

})

router.delete('/logout', async (req: Request, res: Response) => {
  req.user = null;
  res.status(200).json({
    message: "Déconnexion réussie"
  })
})

export default router