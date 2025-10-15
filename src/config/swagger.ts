import swaggerJsDoc from 'swagger-jsdoc';

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Dynamic Profile',
            version: "1.0.0",
            description: 'API documentation for Dynamic Profile',
        },
        components: {
            securitySchemes: {
                BearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
    },
    apis: ['src/routes/v1/profile.ts'],
};

export default swaggerJsDoc(options);