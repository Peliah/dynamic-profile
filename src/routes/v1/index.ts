import { Router } from "express";
import profileRoutes from './profile';

const router = Router();

router.get('/', (req, res) => {
    res.status(200).json({
        message: 'Welcome to the my dynamic profile project!',
        status: 'OK',
        version: '1.0.0',
        docs: "",
        timestamp: new Date().toISOString(),

    });
});

router.use('/', profileRoutes);

export default router;