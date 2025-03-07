import express from 'express';
import cors from 'cors';
import crewRoutes from '../src/routes/crew.routes.js';

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());
app.use('/api/crews', crewRoutes);

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});