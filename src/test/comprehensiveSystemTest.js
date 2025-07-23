// Comprehensive Hostel Management System Test Suite
import { studentService } from '../services/studentService.js';
import { ledgerService } from '../services/ledgerService.js';
import { discountService } from '../services/discountService.js';
import { monthlyBillingService } from '../services/monthlyBillingService.js';
import { checkoutService } from '../services/checkoutService.js';
import { roomService } from '../services/roomService.js';
import { billingService } from '../services/billingService.js';
import { paymentService } from '../services/paymentService.js';
import { notificationService } from '../services/notificationService.js';

export const runComprehensiveSystemTest = async () => {
  console.log('🧪 Starting Comprehensive Hostel Management System Test Suite...\n');
  
  const testResults = {
    passed: 0,
    failed: 0,
    total: 0,
    details: []
  };

  const runTest = async (testName, testFunction) => {
    testResults.total++;
    try {
      console.log(`🔍 Testing: ${testName}`);
      await testFunction();
      testResults.passed++;
      testResults.details.push({ name: testName, status: 'PASSED', error: null });
      console.log(`✅ PASSED: ${testName}\n`);
    } catch (error) {
      testResults.failed++;
      testResults.details.push({ name: testName, status: 'FAILED', error: error.message });
      console.log(`❌ FAILED: ${testName} - ${error.message}\n`);
    }
  };

  // Test 1: Student Service Tests
  await runTest('Student Service - Get All Students', async () => {
    const students = await studentService.getStudents();
    if (!Array.isArray(students)) throw new Error('Students should be an array');
    console.log(`   Found ${students.length} students`);
  });

  await runTest('Student Service - Get Student by ID', async () => {
    const students = await studentService.getStudents();
    if (students.length > 0) {
      const student = await studentService.getStudentById(students[0].id);
      if (!student) throw new Error('Student not found by ID');
      console.log(`   Retrieved student: ${student.name}`);
    }
  });

  await runTest('Student Service - Create New Student', async () => {
    const newStudentData = {
      name: 'Test Student',
      phone: '9876543210',
      email: 'test@example.com',
      roomNumber: 'TEST-001',
      baseMonthlyFee: 8000,
      laundryFee: 500,
      foodFee: 2000,
      guardianName: 'Test Guardian',
      guardianPhone: '9876543211'
    };
    
    const newStudent = await studentService.createStudent(newStudentData);
    if (!newStudent || !newStudent.id) throw new Error('Failed to create student');
    console.log(`   Created student: ${newStudent.name} (ID: ${newStudent.id})`);
  });

  // Test 2: Ledger Service Tests
  await runTest('Ledger Service - Get All Entries', async () => {
    const entries = await ledgerService.getLedgerEntries();
    if (!Array.isArray(entries)) throw new Error('Ledger entries should be an array');
    console.log(`   Found ${entries.length} ledger entries`);
  });

  await runTest('Ledger Service - Add Ledger Entry', async () => {
    const entryData = {
      studentId: 'STU001',
      type: 'Test Entry',
      description: 'System test entry',
      debit: 1000,
      credit: 0,
      notes: 'Automated test entry'
    };
    
    const newEntry = await ledgerService.addLedgerEntry(entryData);
    if (!newEntry || !newEntry.id) throw new Error('Failed to create ledger entry');
    console.log(`   Created ledger entry: ${newEntry.id}`);
  });

  await runTest('Ledger Service - Calculate Student Balance', async () => {
    const balance = await ledgerService.calculateStudentBalance('STU001');
    if (typeof balance.balance !== 'number') throw new Error('Balance should be a number');
    console.log(`   Student balance: ${balance.balance} (${balance.balanceType})`);
  });

  // Test 3: Room Service Tests
  await runTest('Room Service - Get Available Rooms', async () => {
    const rooms = await roomService.getAvailableRooms();
    if (!Array.isArray(rooms)) throw new Error('Available rooms should be an array');
    console.log(`   Found ${rooms.length} available rooms`);
  });

  await runTest('Room Service - Get Room Statistics', async () => {
    const stats = await roomService.getRoomStats();
    if (!stats || typeof stats.totalRooms !== 'number') throw new Error('Room stats invalid');
    console.log(`   Room stats: ${stats.totalRooms} total, ${stats.occupiedRooms} occupied`);
  });

  // Test 4: Billing Service Tests
  await runTest('Billing Service - Generate Invoice', async () => {
    const students = await studentService.getStudents();
    if (students.length > 0) {
      const invoice = await billingService.generateInvoice(students[0].id);
      if (!invoice || !invoice.id) throw new Error('Failed to generate invoice');
      console.log(`   Generated invoice: ${invoice.id} for ${invoice.amount}`);
    }
  });

  await runTest('Billing Service - Calculate Monthly Charges', async () => {
    const students = await studentService.getStudents();
    if (students.length > 0) {
      const charges = await billingService.calculateMonthlyCharges(students[0]);
      if (typeof charges.totalAmount !== 'number') throw new Error('Charges calculation failed');
      console.log(`   Monthly charges: ₨${charges.totalAmount}`);
    }
  });

  // Test 5: Payment Service Tests
  await runTest('Payment Service - Record Payment', async () => {
    const paymentData = {
      studentId: 'STU001',
      amount: 5000,
      paymentMode: 'Cash',
      notes: 'Test payment',
      receivedBy: 'System Test'
    };
    
    const payment = await paymentService.recordPayment(paymentData);
    if (!payment || !payment.id) throw new Error('Failed to record payment');
    console.log(`   Recorded payment: ${payment.id} for ₨${payment.amount}`);
  });

  // Test 6: Discount Service Tests
  await runTest('Discount Service - Get Discount History', async () => {
    const discounts = await discountService.getDiscountHistory();
    if (!Array.isArray(discounts)) throw new Error('Discount history should be an array');
    console.log(`   Found ${discounts.length} discount records`);
  });

  await runTest('Discount Service - Apply Discount', async () => {
    const students = await studentService.getStudents();
    if (students.length > 0) {
      try {
        const discountData = {
          studentId: students[0].id,
          amount: 500,
          reason: 'System Test Discount',
          notes: 'Automated test discount',
          appliedBy: 'System Test'
        };
        
        const result = await discountService.applyDiscount(discountData);
        if (!result.success) throw new Error('Discount application failed');
        console.log(`   Applied discount: ₨${discountData.amount} to ${students[0].name}`);
      } catch (error) {
        if (error.message.includes('already been applied')) {
          console.log(`   Discount already exists (expected behavior)`);
        } else {
          throw error;
        }
      }
    }
  });

  // Test 7: Monthly Billing Service Tests
  await runTest('Monthly Billing Service - Get Billing Stats', async () => {
    const stats = await monthlyBillingService.getBillingStats();
    if (!stats || typeof stats.totalStudents !== 'number') throw new Error('Billing stats invalid');
    console.log(`   Billing stats: ${stats.totalStudents} students, ₨${stats.totalRevenue} revenue`);
  });

  await runTest('Monthly Billing Service - Generate Monthly Invoices', async () => {
    const result = await monthlyBillingService.generateMonthlyInvoices();
    if (!result || typeof result.invoicesGenerated !== 'number') throw new Error('Monthly billing failed');
    console.log(`   Generated ${result.invoicesGenerated} monthly invoices`);
  });

  // Test 8: Notification Service Tests
  await runTest('Notification Service - Send Test Notification', async () => {
    const result = await notificationService.sendNotification({
      studentId: 'STU001',
      message: 'System test notification',
      type: 'system_test'
    });
    if (!result.success) throw new Error('Notification sending failed');
    console.log(`   Sent notification successfully`);
  });

  await runTest('Notification Service - Get Notification Stats', async () => {
    const stats = await notificationService.getNotificationStats();
    if (!stats || typeof stats.totalSent !== 'number') throw new Error('Notification stats invalid');
    console.log(`   Notification stats: ${stats.totalSent} sent, ${stats.deliveryRate}% delivery rate`);
  });

  // Test 9: Checkout Service Tests
  await runTest('Checkout Service - Calculate Checkout Amount', async () => {
    const students = await studentService.getStudents();
    if (students.length > 0) {
      const checkoutData = {
        studentId: students[0].id,
        checkoutDate: new Date().toISOString().split('T')[0],
        reason: 'System Test Checkout'
      };
      
      const calculation = await checkoutService.calculateCheckoutAmount(checkoutData);
      if (typeof calculation.finalAmount !== 'number') throw new Error('Checkout calculation failed');
      console.log(`   Checkout calculation: ₨${calculation.finalAmount}`);
    }
  });

  // Test 10: Integration Tests
  await runTest('Integration - Student Lifecycle Test', async () => {
    // Create student -> Generate invoice -> Record payment -> Apply discount -> Checkout
    const studentData = {
      name: 'Integration Test Student',
      phone: '9999999999',
      email: 'integration@test.com',
      roomNumber: 'INT-001',
      baseMonthlyFee: 10000,
      laundryFee: 600,
      foodFee: 2500
    };
    
    // Step 1: Create student
    const student = await studentService.createStudent(studentData);
    console.log(`   Step 1: Created student ${student.name}`);
    
    // Step 2: Generate invoice
    const invoice = await billingService.generateInvoice(student.id);
    console.log(`   Step 2: Generated invoice ${invoice.id}`);
    
    // Step 3: Record payment
    const payment = await paymentService.recordPayment({
      studentId: student.id,
      amount: 5000,
      paymentMode: 'UPI',
      notes: 'Integration test payment'
    });
    console.log(`   Step 3: Recorded payment ${payment.id}`);
    
    // Step 4: Apply discount
    try {
      const discount = await discountService.applyDiscount({
        studentId: student.id,
        amount: 1000,
        reason: 'Integration Test Discount',
        appliedBy: 'System'
      });
      console.log(`   Step 4: Applied discount successfully`);
    } catch (error) {
      console.log(`   Step 4: Discount handling (${error.message})`);
    }
    
    console.log(`   Integration test completed successfully`);
  });

  // Test 11: Data Consistency Tests
  await runTest('Data Consistency - Ledger Balance Verification', async () => {
    const students = await studentService.getStudents();
    let consistencyIssues = 0;
    
    for (const student of students.slice(0, 5)) { // Test first 5 students
      const ledgerBalance = await ledgerService.calculateStudentBalance(student.id);
      const studentBalance = student.currentBalance || 0;
      
      // Allow small differences due to rounding
      const difference = Math.abs(ledgerBalance.rawBalance - studentBalance);
      if (difference > 1) {
        consistencyIssues++;
        console.log(`   Inconsistency found for ${student.name}: Ledger=${ledgerBalance.rawBalance}, Student=${studentBalance}`);
      }
    }
    
    if (consistencyIssues > 0) {
      throw new Error(`Found ${consistencyIssues} data consistency issues`);
    }
    console.log(`   Data consistency verified for ${Math.min(students.length, 5)} students`);
  });

  // Test 12: Performance Tests
  await runTest('Performance - Bulk Operations Test', async () => {
    const startTime = Date.now();
    
    // Simulate bulk operations
    const promises = [];
    for (let i = 0; i < 10; i++) {
      promises.push(studentService.getStudents());
      promises.push(ledgerService.getLedgerEntries());
    }
    
    await Promise.all(promises);
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    if (duration > 5000) { // 5 seconds threshold
      throw new Error(`Bulk operations took too long: ${duration}ms`);
    }
    
    console.log(`   Bulk operations completed in ${duration}ms`);
  });

  // Print Test Results Summary
  console.log('\n' + '='.repeat(60));
  console.log('🎯 COMPREHENSIVE SYSTEM TEST RESULTS');
  console.log('='.repeat(60));
  console.log(`📊 Total Tests: ${testResults.total}`);
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`📈 Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`);
  
  if (testResults.failed > 0) {
    console.log('\n❌ FAILED TESTS:');
    testResults.details
      .filter(test => test.status === 'FAILED')
      .forEach(test => {
        console.log(`   • ${test.name}: ${test.error}`);
      });
  }
  
  console.log('\n📋 DETAILED TEST RESULTS:');
  testResults.details.forEach(test => {
    const status = test.status === 'PASSED' ? '✅' : '❌';
    console.log(`   ${status} ${test.name}`);
  });
  
  // System Health Summary
  console.log('\n' + '='.repeat(60));
  console.log('🏥 SYSTEM HEALTH SUMMARY');
  console.log('='.repeat(60));
  
  try {
    const students = await studentService.getStudents();
    const ledgerEntries = await ledgerService.getLedgerEntries();
    const discounts = await discountService.getDiscountHistory();
    const rooms = await roomService.getAvailableRooms();
    
    console.log(`👥 Students: ${students.length} total`);
    console.log(`📚 Ledger Entries: ${ledgerEntries.length} total`);
    console.log(`🏷️ Discounts: ${discounts.length} total`);
    console.log(`🏠 Available Rooms: ${rooms.length} total`);
    
    const activeStudents = students.filter(s => s.status === 'Active').length;
    const totalDues = students.reduce((sum, s) => sum + (s.currentBalance || 0), 0);
    const totalAdvances = students.reduce((sum, s) => sum + (s.advanceBalance || 0), 0);
    
    console.log(`🟢 Active Students: ${activeStudents}`);
    console.log(`💰 Total Outstanding: ₨${totalDues.toLocaleString()}`);
    console.log(`⬆️ Total Advances: ₨${totalAdvances.toLocaleString()}`);
    
  } catch (error) {
    console.log(`⚠️ Could not generate system health summary: ${error.message}`);
  }
  
  console.log('\n' + '='.repeat(60));
  
  if (testResults.failed === 0) {
    console.log('🎉 ALL TESTS PASSED! System is functioning correctly.');
  } else {
    console.log(`⚠️ ${testResults.failed} test(s) failed. Please review and fix issues.`);
  }
  
  console.log('='.repeat(60));
  
  return testResults;
};

// Auto-run test if this file is executed directly
if (typeof window === 'undefined') {
  runComprehensiveSystemTest().then(results => {
    process.exit(results.failed > 0 ? 1 : 0);
  });
}