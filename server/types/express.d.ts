// Ce fichier permet d'ajouter des propriétés à l'objet Request d'Express

import { JwtPayload } from "jsonwebtoken";

declare module 'express-serve-static-core' {
  interface Request {
    user?: any; // You can replace 'any' with a specific user type if you have one
  }
}