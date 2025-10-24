# Country Data API

A RESTful API that fetches country data from external APIs, stores it in a MySQL database, and provides CRUD operations with exchange rate calculations.

## Features

- Fetch country data from REST Countries API
- Fetch exchange rates from Open Exchange Rates API
- Calculate estimated GDP based on population and exchange rates
- Store data in MySQL database
- Generate summary images
- Full CRUD operations for countries
- Filtering and sorting capabilities

## Prerequisites

- Node.js (v16 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd dynamic-profile
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
PORT=3030
NODE_ENV=development
LOG_LEVEL=info

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password_here
DB_NAME=countries_db

# External APIs
CAT_FACT_API_URL=https://catfact.ninja/
COUNTRY_DATA=https://restcountries.com/v2/all?fields=name,capital,region,population,flag,currencies
EXCHANGE_RATE=https://open.er-api.com/v6/latest/USD
```

4. Set up MySQL database:
```sql
CREATE DATABASE countries_db;
```

5. Build the project:
```bash
npm run build
```

6. Start the server:
```bash
npm start
```

For development:
```bash
npm run dev
```

## API Endpoints

### Countries

- `POST /api/v1/countries/refresh` - Fetch and cache all countries data
- `GET /api/v1/countries` - Get all countries (with filters and sorting)
- `GET /api/v1/countries/:name` - Get a specific country by name
- `DELETE /api/v1/countries/:name` - Delete a country record
- `GET /api/v1/countries/image` - Get the summary image

### Status

- `GET /api/v1/status` - Get total countries count and last refresh timestamp

## Query Parameters

### GET /api/v1/countries

- `region` - Filter by region (e.g., Africa, Europe)
- `currency` - Filter by currency code (e.g., USD, EUR)
- `sort` - Sort options:
  - `gdp_desc` - Sort by estimated GDP descending
  - `gdp_asc` - Sort by estimated GDP ascending
  - `population_desc` - Sort by population descending
  - `population_asc` - Sort by population ascending
  - `name_asc` - Sort by name ascending
  - `name_desc` - Sort by name descending
- `limit` - Number of results to return (default: 1000)
- `offset` - Number of results to skip (default: 0)

## Example Usage

### Refresh Countries Data
```bash
curl -X POST http://localhost:3030/api/v1/countries/refresh
```

### Get All Countries
```bash
curl http://localhost:3030/api/v1/countries
```

### Get Countries by Region
```bash
curl "http://localhost:3030/api/v1/countries?region=Africa"
```

### Get Countries Sorted by GDP
```bash
curl "http://localhost:3030/api/v1/countries?sort=gdp_desc"
```

### Get Specific Country
```bash
curl http://localhost:3030/api/v1/countries/Nigeria
```

### Get Status
```bash
curl http://localhost:3030/api/v1/status
```

## Response Format

### Country Object
```json
{
  "id": 1,
  "name": "Nigeria",
  "capital": "Abuja",
  "region": "Africa",
  "population": 206139589,
  "currency_code": "NGN",
  "exchange_rate": 1600.23,
  "estimated_gdp": 25767448125.2,
  "flag_url": "https://flagcdn.com/ng.svg",
  "last_refreshed_at": "2025-10-22T18:00:00Z"
}
```

### Status Response
```json
{
  "total_countries": 250,
  "last_refreshed_at": "2025-10-22T18:00:00Z"
}
```

## Error Handling

The API returns consistent JSON error responses:

- `400 Bad Request` - Validation failed
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error
- `503 Service Unavailable` - External API unavailable

## Database Schema

### Countries Table
- `id` - Auto-increment primary key
- `name` - Country name (unique)
- `capital` - Capital city
- `region` - Geographic region
- `population` - Population count
- `currency_code` - Currency code (e.g., USD, EUR)
- `exchange_rate` - Exchange rate to USD
- `estimated_gdp` - Calculated GDP estimate
- `flag_url` - URL to country flag image
- `last_refreshed_at` - Last update timestamp
- `created_at` - Creation timestamp
- `updated_at` - Last modification timestamp

### Refresh Log Table
- `id` - Auto-increment primary key
- `last_refreshed_at` - Refresh timestamp
- `total_countries` - Total countries count
- `created_at` - Creation timestamp

## Development

The project uses TypeScript and includes:
- Express.js for the web framework
- MySQL2 for database connectivity
- Canvas for image generation
- Winston for logging
- Swagger for API documentation

## License

MIT License