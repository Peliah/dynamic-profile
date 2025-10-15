"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = require("../../../lib/winston");
const utils_1 = require("../../../utils");
const getProfile = async (req, res) => {
    try {
        const catFactData = await (0, utils_1.fetchCatFact)(5000);
        const catFact = catFactData.fact;
        const response = {
            status: 'success',
            user: {
                email: 'pelepoupa@gmail.com',
                name: 'Pelayah Epoupa',
                stack: 'Node.js/Express'
            },
            timestamp: new Date().toISOString(),
            fact: catFact
        };
        winston_1.logger.info('Profile endpoint accessed successfully');
        res.status(200).json(response);
    }
    catch (error) {
        winston_1.logger.error('Error fetching cat fact:', error);
        const errorResponse = {
            status: 'error',
            message: 'Failed to fetch cat fact'
        };
        res.status(500).json(errorResponse);
    }
};
exports.default = getProfile;
