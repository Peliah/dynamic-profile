import { Router } from "express";
import profileRoutes from './profile';
import stringRoutes from './string';
import countryRoutes from './countries';

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
router.use('/strings', stringRoutes);
router.use('/countries', countryRoutes);

export default router;