import jsonwebtoken from 'jsonwebtoken';
import {Request, Response, NextFunction} from 'express';

export function verifyToken(req: Request, res: Response, next: NextFunction){
  // Récupérer le token depuis l'en-tête "Authorization"
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer VOTRE_TOKEN"

  if (!token) {
    return res.status(403).json({ message: "Un token est requis pour l'authentification" });
  }

  try {
    const secretKey = process.env.JWT_SECRET as string;
    const decoded = jsonwebtoken.verify(token, secretKey);
    
    // Ajouter les informations du token à l'objet de requête
    req.user = decoded; 

  } catch (err) {
    return res.status(401).json({ message: "Token invalide ou expiré" });
  }

  return next(); // Passe à la suite si le token est valide
}