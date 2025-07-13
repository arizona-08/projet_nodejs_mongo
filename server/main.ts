import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

import authRoutes from './routes/auth.routes';
import gymRoutes from './routes/gym.routes';
import challengeRoutes from './routes/challenge.routes';
import participationRoutes from './routes/participation.routes';

import userRoutes from './routes/admin/user.routes'
import adminGymRoutes from './routes/admin/gym.routes'
import adminExercicesRoutes from './routes/admin/exercices.routes';
import adminBadgesRoutes from './routes/admin/badges.route';
import adminRewardsRoutes from './routes/admin/rewards.route';
import adminStatusRoutes from './routes/admin/status.routes';

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
app.use('/api/admin/users', userRoutes);
app.use('/api/admin/gyms', adminGymRoutes);
app.use('/api/gyms', gymRoutes);
app.use('/api/challenges', challengeRoutes);
app.use('/api/participations', participationRoutes); 
app.use('/api/admin/exercices', adminExercicesRoutes);
app.use('/api/admin/badges', adminBadgesRoutes);
app.use('/api/admin/rewards', adminRewardsRoutes);
app.use('/api/admin/status', adminStatusRoutes);

app.get('/', (req, res) => {
  res.send('Hello, World!');
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
})