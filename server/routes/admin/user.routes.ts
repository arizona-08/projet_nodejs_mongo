import express, { Request, Response } from 'express'
import { User } from '../../models/User'
import mongoose from 'mongoose'
import { hashPassword } from '../../utils/passwordUtils'
import { verifyToken } from '../../middlewares/verifyToken'
import { authorizeRoles } from '../../middlewares/authorizedRoles'
import { roles } from '../../utils/roles'

const router = express.Router()

router.get('/', verifyToken, authorizeRoles('admin'), async (_req, res) => {
  const users = await User.find();
  res.json(users);
});

router.post('/create', verifyToken, authorizeRoles('admin'), async (req, res) => {
  const { firstname, lastname, email, password } = req.body

  try {
    const existingUser = await User.find({email: email});
    console.log(existingUser);
    if(existingUser.length === 0){
      const newUser = new User({
        firstname: firstname,
        lastname: lastname,
        email: email,
        password: await hashPassword(password),
        role: 'client'
      })

      await newUser.save()
      console.log('✅ Utilisateur inséré avec succès')
      res.status(201).send({
        message: 'Utilisateur inséré avec succès',
        user: newUser
      })
    } else {
      res.status(422).send({
        error: "Email déja utilisé."
      })
      return;
    }
  } catch (error) {
    console.error('❌ Erreur lors de l\'insertion :', error)
  }
})

router.get('/:id', verifyToken, authorizeRoles('admin'), async (req: any, res:any) => {
  const id = req.params.id

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'ID invalide' });
  }

  try {
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    res.json(user);
  } catch (error) {
    console.error('❌ Erreur lors de la récupération du user :', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
})

router.get('/get-users-by-role/:role', verifyToken, authorizeRoles('admin'), async (req: Request, res: Response): Promise<void> => {
  const role = req.params.role;
  if(!roles.includes(role)){
    res.status(422).json({
      error: "Le role " + role + " n'esxiste pas."
    })
    return;
  }
  
  try{
    const users = await User.find({role: role});
    if(users.length != 0){
      res.status(200).json({
        [role + '_users']: users
      })
      return;
    } else {
      res.status(404).json({
        message: "Users with role: " + role + " not found"
      })
    }
  } catch(error){
    console.error('Erreur dans les récupérations des users par role: ', error)
  }
})

router.put('/edit/:id', verifyToken, authorizeRoles('admin'), async (req: Request, res: Response) => {
  const id = req.params.id;
  const { firstname, lastname, email, role } = req.body;

  try{
    const existingUser = await User.findById(id);
    
    if(!existingUser){
      res.status(404).send({
        error: "Utilisateur inexistant."
      })

      return;
    }

    if (firstname) existingUser.firstname = firstname;
    if (lastname) existingUser.lastname = lastname;
    if (email) existingUser.email = email;
    if (role) existingUser.role = role;

    const updatedUser = await existingUser.save();
    res.status(200).json({
      message: "Utilisateur mis à jour",
      user: updatedUser
    });
    
  } catch (error) {
    console.error("Erreur lors de la modification du user", error)
  }
})

router.patch('/change-password/:id', verifyToken, authorizeRoles('admin'), async (req: Request, res: Response) => {
  const id = req.params.id
  const {new_password} = req.body

  try{
    const existingUser = await User.findById(id)
    if(!existingUser){
      res.status(404).json({
        error: "Utilisateur inexistant."
      })

      return;
    }

    if(!new_password){
      res.status(422).json({
        error: "Le nouveau mot de passe est requis."
      })

      return;
    }

    existingUser.password = await hashPassword(new_password);
    existingUser.save();

    res.status(200).json({
      message: "Mot de passe du user " + existingUser._id + "modifié avec succès"
    })
    return;

  } catch (error) {
    console.error('Erreur lors de la modification du mot de passe', error)
  }
})

router.delete('/delete-user/:id', verifyToken, authorizeRoles('admin'), async (req: Request, res: Response) => {
  const id = req.params.id;

  try{
    const deletedUser = await User.findByIdAndDelete(id);
    console.log(deletedUser);
    if(deletedUser){
      res.status(200).json({
        message: "L'utilisateur a bien été supprimé."
      })
    } else {
      res.status(404).json({
        message: "Utilisateur non existant."
      })
    }
    
  } catch (error) {
    console.error('Erreur lors de la suppression du user', error);
  }
})


export default router
