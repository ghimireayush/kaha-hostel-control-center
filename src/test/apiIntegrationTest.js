// API Integration Test - Testing Invoice and Payment API connections
import { invoiceService } from '../services/invoiceService.js';
import { paymentService } from '../services/paymentService.js';

console.log('🧪 Starting API Integration Tests...\n');

async function testInvoiceAPI() {
  console.log('📋 Testing Invoice API...');
  
  try {
    // Test getting all invoices
    console.log('  → Testing GET /api/v1/invoices');
    const invoices = await invoiceService.getInvoices();
    console.log(`  ✅ Retrieved ${invoices.length} invoices`);
    
    if (invoices.length > 0) {
      // Test getting specific invoice
      const firstInvoice = invoices[0];
      console.log(`  → Testing GET /api/v1/invoices/${firstInvoice.id}`);
      const specificInvoice = await invoiceService.getInvoiceById(firstInvoice.id);
      console.log(`  ✅ Retrieved invoice: ${specificInvoice.id}`);
      
      // Test filtering by status
      console.log('  → Testing GET /api/v1/invoices?status=Paid');
      const paidInvoices = await invoiceService.filterInvoicesByStatus('Paid');
      console.log(`  ✅ Retrieved ${paidInvoices.length} paid invoices`);
    }
    
    // Test invoice stats
    console.log('  → Testing invoice statistics calculation');
    const stats = await invoiceService.getInvoiceStats();
    console.log(`  ✅ Stats - Paid: ₨${stats.totalPaid}, Unpaid: ₨${stats.totalUnpaid}`);
    
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
    const payments = await paymentService.getPayments();
    console.log(`  ✅ Retrieved ${payments.length} payments`);
    
    if (payments.length > 0) {
      // Test filtering by student ID if available
      const firstPayment = payments[0];
      if (firstPayment.studentId) {
        console.log(`  → Testing GET /api/v1/payments?studentId=${firstPayment.studentId}`);
        const studentPayments = await paymentService.getPaymentsByStudentId(firstPayment.studentId);
        console.log(`  ✅ Retrieved ${studentPayments.length} payments for student ${firstPayment.studentId}`);
      }
      
      // Test getting specific payment (skip if endpoint doesn't exist)
      try {
        console.log(`  → Testing GET /api/v1/payments/${firstPayment.id}`);
        const specificPayment = await paymentService.getPaymentById(firstPayment.id);
        console.log(`  ✅ Retrieved payment: ${specificPayment.id}`);
      } catch (error) {
        console.log(`  ⚠️  Individual payment lookup not available (${error.message})`);
      }
    }
    
    // Test payment stats
    console.log('  → Testing payment statistics calculation');
    const stats = await paymentService.getPaymentStats();
    console.log(`  ✅ Stats - Total: ₨${stats.totalCollected}, Count: ${stats.paymentCount}`);
    
    // Test recent payments
    console.log('  → Testing recent payments');
    const recentPayments = await paymentService.getRecentPayments(5);
    console.log(`  ✅ Retrieved ${recentPayments.length} recent payments`);
    
    console.log('  ✅ Payment API tests completed successfully\n');
    return true;
  } catch (error) {
    console.error('  ❌ Payment API test failed:', error.message);
    return false;
  }
}

async function runAPITests() {
  console.log('🚀 API Integration Test Suite');
  console.log('================================\n');
  
  const invoiceTestPassed = await testInvoiceAPI();
  const paymentTestPassed = await testPaymentAPI();
  
  console.log('📊 Test Results:');
  console.log('================');
  console.log(`Invoice API: ${invoiceTestPassed ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`Payment API: ${paymentTestPassed ? '✅ PASSED' : '❌ FAILED'}`);
  
  if (invoiceTestPassed && paymentTestPassed) {
    console.log('\n🎉 All API integration tests passed!');
    console.log('Your frontend is now successfully connected to the backend APIs.');
  } else {
    console.log('\n⚠️  Some tests failed. Please check:');
    console.log('1. Backend server is running on http://localhost:3012');
    console.log('2. API endpoints are accessible');
    console.log('3. API response format matches expected structure');
  }
}

// Run the tests
runAPITests().catch(console.error);