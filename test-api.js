#!/usr/bin/env node

/**
 * Simple test script to verify the Country API endpoints
 * Run this after starting the server to test basic functionality
 */

const BASE_URL = 'http://localhost:3030/api/v1';

async function testEndpoint(method: string, endpoint: string, expectedStatus: number = 200) {
    try {
        const url = `${BASE_URL}${endpoint}`;
        console.log(`Testing ${method} ${url}...`);

        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.status === expectedStatus) {
            console.log(`✅ ${method} ${endpoint} - Status: ${response.status}`);

            if (response.headers.get('content-type')?.includes('application/json')) {
                const data = await response.json();
                console.log(`   Response:`, JSON.stringify(data, null, 2));
            }
        } else {
            console.log(`❌ ${method} ${endpoint} - Expected: ${expectedStatus}, Got: ${response.status}`);
            const errorText = await response.text();
            console.log(`   Error:`, errorText);
        }
    } catch (error) {
        console.log(`❌ ${method} ${endpoint} - Error:`, error);
    }
    console.log('');
}

async function runTests() {
    console.log('🚀 Starting Country API Tests...\n');

    // Test status endpoint
    await testEndpoint('GET', '/status');

    // Test countries endpoint (should be empty initially)
    await testEndpoint('GET', '/countries');

    // Test refresh endpoint
    console.log('🔄 Testing refresh endpoint (this may take a while)...');
    await testEndpoint('POST', '/countries/refresh');

    // Test countries endpoint after refresh
    await testEndpoint('GET', '/countries');

    // Test filtering
    await testEndpoint('GET', '/countries?region=Africa');
    await testEndpoint('GET', '/countries?sort=gdp_desc');

    // Test specific country
    await testEndpoint('GET', '/countries/Nigeria');

    // Test image endpoint
    await testEndpoint('GET', '/countries/image');

    // Test status again
    await testEndpoint('GET', '/status');

    console.log('✨ Tests completed!');
}

// Check if fetch is available (Node.js 18+)
if (typeof fetch === 'undefined') {
    console.log('❌ This script requires Node.js 18+ or a fetch polyfill');
    console.log('   You can install node-fetch: npm install node-fetch');
    process.exit(1);
}

runTests().catch(console.error);
