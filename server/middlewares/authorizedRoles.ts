import { Request, Response, NextFunction } from 'express';

// Cette fonction prend une liste de rôles autorisés...
export const authorizeRoles = (...allowedRoles: string[]) => {
  // ...et retourne le middleware Express.
  return (req: Request, res: Response, next: NextFunction): void => {
    // On s'attend à ce que verifyToken ait déjà ajouté req.user
    if (!req.user?.role) {
      res.status(403).json({ error: "Accès refusé : rôle utilisateur non spécifié." });
      return ;
    }

    // On vérifie si le rôle de l'utilisateur est dans la liste des rôles autorisés
    const isAllowed = allowedRoles.includes(req.user.role);

    if (!isAllowed) {
      // 403 Forbidden : le serveur a compris la requête, mais refuse de l'autoriser.
      res.status(403).json({ error: "Accès refusé : vous n'avez pas les droits nécessaires." });
      return;
    }

    // Si tout est bon, on passe à la suite (le prochain middleware ou le contrôleur)
    next();
  };
};