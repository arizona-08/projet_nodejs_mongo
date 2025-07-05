import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes'
import gymRoutes from './routes/gym.routes';
import challengeRoutes from './routes/challenge.routes';
import participationRoutes from './routes/participation.routes';

// --------- | IMPORTANT : Les routes et middlewares doivent retounrer void !!!! | ---------

dotenv.config();
const app = express();

const PORT = process.env.PORT || 3000;

// Connexion à MongoDB
mongoose.connect(process.env.MONGO_URI as string)
  .then(() => console.log('MongoDB connecté'))
  .catch((err) => console.error('Erreur MongoDB :', err))


app.use(express.json());

app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes);
app.use('/api/gyms', gymRoutes);
app.use('/api/challenges', challengeRoutes);
app.use('/api', participationRoutes); // Les routes commencent par /participation

app.get('/', (req, res) => {
  res.send('Hello, World!');
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
})