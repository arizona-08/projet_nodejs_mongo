import express from 'express'
import { User } from '../models/User'
import mongoose from 'mongoose'

const router = express.Router()

router.get('/', async (_req, res) => {
  const users = await User.find()
  res.json(users)
  res.send('User route is working!')
})

router.get('/hello-user', (_req, res) => {
  res.json({
    message: 'Hello User!'
  })
})

router.get('/:id', async (req: any, res:any) => {
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


router.post('/create', async (req, res) => {
  const { name, email } = req.body
  try {
    const newUser = new User({
      name: name,
      email: email,
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

export default router
