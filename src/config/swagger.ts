import swaggerJsDoc from 'swagger-jsdoc';

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Country Data API',
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
            schemas: {
                Country: {
                    type: 'object',
                    required: ['name', 'population'],
                    properties: {
                        id: {
                            type: 'integer',
                            description: 'Auto-generated unique identifier',
                            example: 1
                        },
                        name: {
                            type: 'string',
                            description: 'Country name',
                            example: 'Nigeria'
                        },
                        capital: {
                            type: 'string',
                            description: 'Capital city',
                            example: 'Abuja'
                        },
                        region: {
                            type: 'string',
                            description: 'Geographic region',
                            example: 'Africa'
                        },
                        population: {
                            type: 'integer',
                            description: 'Population count',
                            example: 206139589
                        },
                        currency_code: {
                            type: 'string',
                            description: 'Currency code',
                            example: 'NGN'
                        },
                        exchange_rate: {
                            type: 'number',
                            format: 'float',
                            description: 'Exchange rate to USD',
                            example: 1600.23
                        },
                        estimated_gdp: {
                            type: 'number',
                            format: 'float',
                            description: 'Estimated GDP calculated from population and exchange rate',
                            example: 25767448125.2
                        },
                        flag_url: {
                            type: 'string',
                            format: 'uri',
                            description: 'URL to country flag image',
                            example: 'https://flagcdn.com/ng.svg'
                        },
                        last_refreshed_at: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Last refresh timestamp',
                            example: '2025-10-22T18:00:00Z'
                        },
                        created_at: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Creation timestamp'
                        },
                        updated_at: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Last update timestamp'
                        }
                    }
                },
                Error: {
                    type: 'object',
                    properties: {
                        error: {
                            type: 'string',
                            description: 'Error message',
                            example: 'Country not found'
                        },
                        details: {
                            type: 'object',
                            description: 'Additional error details',
                            example: { name: 'is required' }
                        }
                    }
                },
                RefreshResponse: {
                    type: 'object',
                    properties: {
                        message: {
                            type: 'string',
                            example: 'Countries refreshed successfully'
                        },
                        processed: {
                            type: 'integer',
                            description: 'Number of countries processed',
                            example: 250
                        },
                        updated: {
                            type: 'integer',
                            description: 'Number of countries updated',
                            example: 200
                        },
                        inserted: {
                            type: 'integer',
                            description: 'Number of countries inserted',
                            example: 50
                        },
                        total_countries: {
                            type: 'integer',
                            description: 'Total countries in database',
                            example: 250
                        },
                        last_refreshed_at: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Refresh timestamp',
                            example: '2025-10-22T18:00:00Z'
                        }
                    }
                },
                StatusResponse: {
                    type: 'object',
                    properties: {
                        total_countries: {
                            type: 'integer',
                            description: 'Total countries in database',
                            example: 250
                        },
                        last_refreshed_at: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Last refresh timestamp',
                            example: '2025-10-22T18:00:00Z'
                        }
                    }
                }
            }
        },
    },
    apis: ['src/routes/v1/*.ts'],
};

export default swaggerJsDoc(options);