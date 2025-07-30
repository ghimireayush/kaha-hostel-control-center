#!/usr/bin/env node

/**
 * Simple API Test Script
 * Tests all major endpoints to ensure the API is working correctly
 */

const http = require('http');

const BASE_URL = 'http://localhost:3001';

// Helper function to make HTTP requests
function makeRequest(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const jsonBody = JSON.parse(body);
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: jsonBody,
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: body,
          });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

// Test cases
const tests = [
  {
    name: 'Health Check',
    path: '/health',
    method: 'GET',
    expectedStatus: 200,
  },
  {
    name: 'API Root',
    path: '/',
    method: 'GET',
    expectedStatus: 200,
  },
  {
    name: 'Get All Students',
    path: '/api/v1/students',
    method: 'GET',
    expectedStatus: 200,
  },
  {
    name: 'Get All Rooms',
    path: '/api/v1/rooms',
    method: 'GET',
    expectedStatus: 200,
  },
  {
    name: 'Get All Invoices',
    path: '/api/v1/invoices',
    method: 'GET',
    expectedStatus: 200,
  },
  {
    name: 'Get All Payments',
    path: '/api/v1/payments',
    method: 'GET',
    expectedStatus: 200,
  },
  {
    name: 'Get All Ledger Entries',
    path: '/api/v1/ledgers',
    method: 'GET',
    expectedStatus: 200,
  },
  {
    name: 'Get All Booking Requests',
    path: '/api/v1/booking-requests',
    method: 'GET',
    expectedStatus: 200,
  },
  {
    name: 'Get All Discounts',
    path: '/api/v1/discounts',
    method: 'GET',
    expectedStatus: 200,
  },
  {
    name: 'Get All Reports',
    path: '/api/v1/reports',
    method: 'GET',
    expectedStatus: 200,
  },
  {
    name: 'Create Student',
    path: '/api/v1/students',
    method: 'POST',
    data: {
      name: 'Test Student',
      phone: '1234567890',
      email: 'test@example.com',
      address: '123 Test Street',
    },
    expectedStatus: 201,
  },
  {
    name: 'Create Room',
    path: '/api/v1/rooms',
    method: 'POST',
    data: {
      name: 'Test Room',
      roomNumber: 'T001',
      capacity: 2,
      rent: 5000,
      type: 'Private',
    },
    expectedStatus: 201,
  },
];

// Run tests
async function runTests() {
  console.log('🧪 Starting API Tests...\n');
  
  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      console.log(`Testing: ${test.name}`);
      const response = await makeRequest(test.path, test.method, test.data);
      
      if (response.status === test.expectedStatus) {
        console.log(`✅ PASS - Status: ${response.status}`);
        passed++;
      } else {
        console.log(`❌ FAIL - Expected: ${test.expectedStatus}, Got: ${response.status}`);
        console.log(`   Response: ${JSON.stringify(response.body, null, 2)}`);
        failed++;
      }
    } catch (error) {
      console.log(`❌ ERROR - ${error.message}`);
      failed++;
    }
    console.log('');
  }

  console.log('📊 Test Results:');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);

  if (failed === 0) {
    console.log('\n🎉 All tests passed! Your API is working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the server logs.');
  }
}

// Check if server is running
async function checkServer() {
  try {
    await makeRequest('/health');
    console.log('✅ Server is running at ' + BASE_URL);
    return true;
  } catch (error) {
    console.log('❌ Server is not running at ' + BASE_URL);
    console.log('   Please start the server with: npm run start:dev');
    return false;
  }
}

// Main execution
async function main() {
  console.log('🚀 Kaha Hostel API Test Suite\n');
  
  const serverRunning = await checkServer();
  if (!serverRunning) {
    process.exit(1);
  }

  console.log('');
  await runTests();
}

main().catch(console.error);