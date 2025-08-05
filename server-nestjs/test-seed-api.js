#!/usr/bin/env node

/**
 * Seed API Test Script
 * Tests all seeding endpoints to ensure they work correctly
 */

const http = require('http');

const BASE_URL = 'http://localhost:3001';

// Helper function to make HTTP requests
function makeRequest(path, method = 'GET', data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
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
            rawBody: body
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: body,
            rawBody: body
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

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

class SeedAPITester {
  constructor() {
    this.results = {
      summary: {
        totalTests: 0,
        passed: 0,
        failed: 0,
        startTime: new Date(),
        endTime: null
      },
      tests: [],
      failures: []
    };
  }

  async runAllTests() {
    log('🌱 Starting Seed API Test Suite...', 'bright');
    log('=' .repeat(50), 'bright');

    // Check if server is running
    const serverRunning = await this.checkServer();
    if (!serverRunning) {
      log('❌ Server is not running. Please start the server first.', 'red');
      log('   Run: npm run start:dev', 'yellow');
      return false;
    }

    // Test sequence
    await this.testSeedStatus();
    await this.testIndividualSeeding();
    await this.testFullSeeding();
    await this.testCustomSeeding();
    await this.testDataClearing();

    this.results.summary.endTime = new Date();
    this.printSummary();
    
    return this.results.summary.failed === 0;
  }

  async checkServer() {
    try {
      await makeRequest('/health');
      log('✅ Server is running at ' + BASE_URL, 'green');
      return true;
    } catch (error) {
      log('❌ Server is not running at ' + BASE_URL, 'red');
      return false;
    }
  }

  async testSeedStatus() {
    log('\\n📊 Testing Seed Status Endpoint...', 'cyan');
    
    const result = await this.runSingleTest({
      name: 'Get Seed Status',
      path: '/api/v1/seed/status',
      method: 'GET',
      expectedStatus: 200,
      validateResponse: (body) => {
        return body.status === 200 && 
               body.data && 
               typeof body.data.buildings === 'number' &&
               typeof body.data.students === 'number';
      }
    });

    if (result.passed) {
      log(`   Current counts: Buildings: ${result.response.data.buildings}, Students: ${result.response.data.students}`, 'blue');
    }
  }

  async testIndividualSeeding() {
    log('\\n🏗️ Testing Individual Seeding Endpoints...', 'cyan');
    
    const seedEndpoints = [
      { name: 'Seed Buildings', path: '/api/v1/seed/buildings' },
      { name: 'Seed Room Types', path: '/api/v1/seed/room-types' },
      { name: 'Seed Amenities', path: '/api/v1/seed/amenities' },
      { name: 'Seed Rooms', path: '/api/v1/seed/rooms' },
      { name: 'Seed Students', path: '/api/v1/seed/students' },
      { name: 'Seed Invoices', path: '/api/v1/seed/invoices' },
      { name: 'Seed Payments', path: '/api/v1/seed/payments' },
      { name: 'Seed Discounts', path: '/api/v1/seed/discounts' },
      { name: 'Seed Bookings', path: '/api/v1/seed/bookings' }
    ];

    for (const endpoint of seedEndpoints) {
      await this.runSingleTest({
        name: endpoint.name,
        path: endpoint.path + '?force=true',
        method: 'POST',
        expectedStatus: 201,
        validateResponse: (body) => {
          return body.status === 201 && body.data && body.data.count >= 0;
        }
      });
    }
  }

  async testFullSeeding() {
    log('\\n🌱 Testing Full Database Seeding...', 'cyan');
    
    await this.runSingleTest({
      name: 'Seed All Data',
      path: '/api/v1/seed/all?force=true',
      method: 'POST',
      expectedStatus: 201,
      validateResponse: (body) => {
        return body.status === 201 && 
               body.data && 
               body.data.buildings &&
               body.data.students &&
               body.data.rooms;
      }
    });

    // Check final status
    const statusResult = await this.runSingleTest({
      name: 'Verify Final Status',
      path: '/api/v1/seed/status',
      method: 'GET',
      expectedStatus: 200,
      validateResponse: (body) => {
        return body.status === 200 && 
               body.data.buildings > 0 &&
               body.data.students > 0 &&
               body.data.rooms > 0;
      }
    });

    if (statusResult.passed) {
      log('   ✅ Database successfully seeded with sample data!', 'green');
      log(`   📊 Final counts:`, 'blue');
      const data = statusResult.response.data;
      Object.entries(data).forEach(([key, value]) => {
        if (typeof value === 'number') {
          log(`      ${key}: ${value}`, 'blue');
        }
      });
    }
  }

  async testCustomSeeding() {
    log('\\n🎯 Testing Custom Data Seeding...', 'cyan');
    
    const customData = {
      students: [
        {
          id: 'TEST001',
          name: 'Test Student API',
          phone: '9999999999',
          email: 'test.api@example.com',
          address: '123 Test Street',
          status: 'Active',
          isActive: true
        }
      ]
    };

    await this.runSingleTest({
      name: 'Seed Custom Data',
      path: '/api/v1/seed/custom',
      method: 'POST',
      data: customData,
      expectedStatus: 201,
      validateResponse: (body) => {
        return body.status === 201 && body.data && body.data.students;
      }
    });
  }

  async testDataClearing() {
    log('\\n🧹 Testing Data Clearing Endpoints...', 'cyan');
    
    // Test clearing specific entity (should fail without confirmation)
    await this.runSingleTest({
      name: 'Clear Data Without Confirmation (Should Fail)',
      path: '/api/v1/seed/students',
      method: 'DELETE',
      expectedStatus: 400,
      validateResponse: (body) => {
        return body.status === 400 && body.message.includes('confirm');
      }
    });

    // Test clearing with confirmation
    await this.runSingleTest({
      name: 'Clear Test Student Data',
      path: '/api/v1/seed/students?confirm=yes',
      method: 'DELETE',
      expectedStatus: 200,
      validateResponse: (body) => {
        return body.status === 200;
      }
    });

    log('   ⚠️  Skipping full data clear to preserve seeded data', 'yellow');
  }

  async runSingleTest(test) {
    const startTime = Date.now();
    
    try {
      const response = await makeRequest(test.path, test.method, test.data);
      const duration = Date.now() - startTime;
      
      let passed = response.status === test.expectedStatus;
      let validationResult = null;
      
      // Run custom validation if provided
      if (passed && test.validateResponse) {
        try {
          validationResult = test.validateResponse(response.body);
          passed = passed && validationResult;
        } catch (validationError) {
          passed = false;
          validationResult = `Validation error: ${validationError.message}`;
        }
      }
      
      const result = {
        name: test.name,
        path: test.path,
        method: test.method,
        expectedStatus: test.expectedStatus,
        actualStatus: response.status,
        passed,
        duration,
        validationResult,
        response: response.body,
        error: null
      };
      
      this.results.tests.push(result);
      
      // Print result
      const status = passed ? '✅ PASS' : '❌ FAIL';
      const timing = `(${duration}ms)`;
      log(`  ${status} ${test.name} ${timing}`);
      
      if (!passed) {
        log(`    Expected: ${test.expectedStatus}, Got: ${response.status}`, 'red');
        if (validationResult && typeof validationResult === 'string') {
          log(`    Validation: ${validationResult}`, 'red');
        }
        this.results.failures.push(result);
        this.results.summary.failed++;
      } else {
        this.results.summary.passed++;
      }
      
      this.results.summary.totalTests++;
      return result;
      
    } catch (error) {
      const duration = Date.now() - startTime;
      
      const result = {
        name: test.name,
        path: test.path,
        method: test.method,
        expectedStatus: test.expectedStatus,
        actualStatus: null,
        passed: false,
        duration,
        validationResult: null,
        response: null,
        error: error.message
      };
      
      this.results.tests.push(result);
      this.results.failures.push(result);
      
      log(`  ❌ ERROR ${test.name} (${duration}ms)`, 'red');
      log(`    Error: ${error.message}`, 'red');
      
      this.results.summary.failed++;
      this.results.summary.totalTests++;
      
      return result;
    }
  }

  printSummary() {
    log('\\n' + '='.repeat(50), 'bright');
    log('📊 SEED API TEST SUMMARY', 'bright');
    log('='.repeat(50), 'bright');
    
    const { summary } = this.results;
    const successRate = summary.totalTests > 0 ? 
      ((summary.passed / summary.totalTests) * 100).toFixed(1) : 0;
    
    log(`Total Tests: ${summary.totalTests}`);
    log(`✅ Passed: ${summary.passed}`, 'green');
    log(`❌ Failed: ${summary.failed}`, summary.failed > 0 ? 'red' : 'green');
    log(`📈 Success Rate: ${successRate}%`, successRate == 100 ? 'green' : 'yellow');
    
    const duration = summary.endTime - summary.startTime;
    log(`⏱️  Total Time: ${duration}ms`);
    
    // Show failures
    if (this.results.failures.length > 0) {
      log('\\n❌ FAILURES:', 'red');
      this.results.failures.forEach((failure, index) => {
        log(`  ${index + 1}. ${failure.name}`, 'red');
        log(`     ${failure.method} ${failure.path}`, 'red');
        log(`     Expected: ${failure.expectedStatus}, Got: ${failure.actualStatus}`, 'red');
        if (failure.error) {
          log(`     Error: ${failure.error}`, 'red');
        }
      });
    }
    
    if (summary.failed === 0) {
      log('\\n🎉 All seed API tests passed! Your seeding system is working correctly.', 'green');
      log('\\n📚 Next steps:', 'cyan');
      log('   1. Use the seed endpoints to populate your database', 'blue');
      log('   2. Test your main API endpoints with seeded data', 'blue');
      log('   3. Run the full API test suite: npm run test:api:full', 'blue');
    } else {
      log(`\\n⚠️  ${summary.failed} test(s) failed. Please check the issues above.`, 'yellow');
    }
  }
}

// Main execution
async function main() {
  const tester = new SeedAPITester();
  const success = await tester.runAllTests();
  process.exit(success ? 0 : 1);
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { SeedAPITester };