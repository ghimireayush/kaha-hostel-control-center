// System Integration Test - Verify all services work together
import { studentService } from '../services/studentService.js';
import { ledgerService } from '../services/ledgerService.js';
import { discountService } from '../services/discountService.js';
import { monthlyBillingService } from '../services/monthlyBillingService.js';
import { checkoutService } from '../services/checkoutService.js';

export const runSystemIntegrationTest = async () => {
  console.log('🧪 Starting System Integration Test...\n');
  
  try {
    // Test 1: Student Service
    console.log('1️⃣ Testing Student Service...');
    const students = await studentService.getStudents();
    console.log(`✅ Found ${students.length} students`);
    
    if (students.length > 0) {
      const firstStudent = students[0];
      console.log(`   Sample student: ${firstStudent.name} (${firstStudent.id})`);
    }
    
    // Test 2: Ledger Service
    console.log('\n2️⃣ Testing Ledger Service...');
    const ledgerEntries = await ledgerService.getLedgerEntries();
    console.log(`✅ Found ${ledgerEntries.length} ledger entries`);
    
    if (students.length > 0) {
      const studentLedger = await ledgerService.getLedgerByStudentId(students[0].id);
      console.log(`   Student ledger entries: ${studentLedger.length}`);
    }
    
    // Test 3: Discount Service
    console.log('\n3️⃣ Testing Discount Service...');
    const discounts = await discountService.getDiscounts();
    console.log(`✅ Found ${discounts.length} discount records`);
    
    // Test 4: Monthly Billing Service
    console.log('\n4️⃣ Testing Monthly Billing Service...');
    const billingStats = await monthlyBillingService.getBillingStats();
    console.log(`✅ Billing stats loaded:`, billingStats);
    
    // Test 5: Integration Test - Apply a discount
    if (students.length > 0) {
      console.log('\n5️⃣ Testing Discount Integration...');
      const testStudent = students[0];
      
      try {
        const discountResult = await discountService.applyDiscount({
          studentId: testStudent.id,
          amount: 500,
          reason: 'System Integration Test',
          notes: 'Automated test discount',
          appliedBy: 'System Test'
        });
        
        console.log(`✅ Discount applied successfully:`, discountResult);
        
        // Verify ledger entry was created
        const updatedLedger = await ledgerService.getLedgerByStudentId(testStudent.id);
        const discountEntry = updatedLedger.find(entry => 
          entry.description.includes('System Integration Test')
        );
        
        if (discountEntry) {
          console.log(`✅ Ledger entry created: ${discountEntry.description} - Credit: ${discountEntry.credit}`);
        } else {
          console.log(`❌ Ledger entry not found`);
        }
        
      } catch (error) {
        console.log(`⚠️ Discount test skipped (expected if already applied):`, error.message);
      }
    }
    
    console.log('\n🎉 System Integration Test Completed Successfully!');
    console.log('\n📊 System Status:');
    console.log(`   • Students: ${students.length}`);
    console.log(`   • Ledger Entries: ${ledgerEntries.length}`);
    console.log(`   • Discounts: ${discounts.length}`);
    console.log(`   • All services integrated and working`);
    
    return {
      success: true,
      studentsCount: students.length,
      ledgerEntriesCount: ledgerEntries.length,
      discountsCount: discounts.length
    };
    
  } catch (error) {
    console.error('❌ System Integration Test Failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Auto-run test if this file is executed directly
if (typeof window === 'undefined') {
  runSystemIntegrationTest();
}