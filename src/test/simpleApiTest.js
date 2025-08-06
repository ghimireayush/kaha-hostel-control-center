// Simple API Test - Direct API calls without service dependencies
const API_BASE_URL = 'https://dev.kaha.com.np/hostel/api/v1';

// Helper function to handle API requests
async function apiRequest(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
}

async function testInvoiceAPI() {
  console.log('📋 Testing Invoice API...');
  
  try {
    // Test getting all invoices
    console.log('  → Testing GET /api/v1/invoices');
    const response = await apiRequest('/invoices');
    console.log('  📊 Raw API Response:', JSON.stringify(response, null, 2));
    
    if (response.result && response.result.items) {
      const invoices = response.result.items;
      console.log(`  ✅ Retrieved ${invoices.length} invoices`);
      
      if (invoices.length > 0) {
        const firstInvoice = invoices[0];
        console.log(`  📄 Sample invoice: ${firstInvoice.id} - ${firstInvoice.studentName} - ₨${firstInvoice.total}`);
        
        // Test getting specific invoice
        console.log(`  → Testing GET /api/v1/invoices/${firstInvoice.id}`);
        const specificResponse = await apiRequest(`/invoices/${firstInvoice.id}`);
        console.log(`  ✅ Retrieved specific invoice: ${specificResponse.result?.id || 'No ID found'}`);
      }
    }
    
    console.log('  ✅ Invoice API tests completed successfully\n');
    return true;
  } catch (error) {
    console.error('  ❌ Invoice API test failed:', error.message);
    return false;
  }
}

async function testPaymentAPI() {
  console.log('💰 Testing Payment API...');
  
  try {
    // Test getting all payments
    console.log('  → Testing GET /api/v1/payments');
    const response = await apiRequest('/payments');
    console.log('  📊 Raw API Response:', JSON.stringify(response, null, 2));
    
    if (response.result && response.result.items) {
      const payments = response.result.items;
      console.log(`  ✅ Retrieved ${payments.length} payments`);
      
      if (payments.length > 0) {
        const firstPayment = payments[0];
        console.log(`  💳 Sample payment: ${firstPayment.id} - ₨${firstPayment.amount}`);
      }
    }
    
    console.log('  ✅ Payment API tests completed successfully\n');
    return true;
  } catch (error) {
    console.error('  ❌ Payment API test failed:', error.message);
    return false;
  }
}

async function runTests() {
  console.log('🚀 Simple API Integration Test');
  console.log('==============================\n');
  
  const invoiceTestPassed = await testInvoiceAPI();
  const paymentTestPassed = await testPaymentAPI();
  
  console.log('📊 Test Results:');
  console.log('================');
  console.log(`Invoice API: ${invoiceTestPassed ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`Payment API: ${paymentTestPassed ? '✅ PASSED' : '❌ FAILED'}`);
  
  if (invoiceTestPassed && paymentTestPassed) {
    console.log('\n🎉 All API tests passed!');
    console.log('Your backend APIs are working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Please check your backend server.');
  }
}

// Run the tests
runTests().catch(console.error);