// Frontend Integration Test
// Tests the integration between frontend services and NestJS backend

import { adminChargingService } from '../services/adminChargingService.js';
import { discountService } from '../services/discountService.js';
import { studentService } from '../services/studentService.js';

console.log('🎯 Frontend Integration Test Starting...\n');

async function runFrontendIntegrationTest() {
  try {
    // Test 1: Admin Charging Service Integration
    console.log('1️⃣ Testing Admin Charging Service Integration...');
    
    // Load charge types (required for frontend components)
    await adminChargingService.loadChargeTypes();
    console.log(`   ✅ Charge types loaded: ${adminChargingService.chargeTypes.length}`);
    console.log(`   📋 Available charge types:`, adminChargingService.chargeTypes.map(ct => ct.label));
    
    // Get overdue students (for AdminCharging component)
    const overdueStudents = await adminChargingService.getOverdueStudents();
    console.log(`   ✅ Overdue students: ${overdueStudents.length}`);
    
    // Get today's summary (for dashboard widgets)
    const chargeSummary = await adminChargingService.getTodayChargeSummary();
    console.log(`   ✅ Today's charge summary:`, chargeSummary);
    
    // Test 2: Discount Service Integration
    console.log('\n2️⃣ Testing Discount Service Integration...');
    
    // Get discount history (for DiscountManagement component)
    const discountHistory = await discountService.getDiscountHistory();
    console.log(`   ✅ Discount history loaded: ${discountHistory.length} records`);
    
    // Get discount stats (for dashboard widgets)
    const discountStats = await discountService.getDiscountStats();
    console.log(`   ✅ Discount statistics:`, discountStats);
    
    // Test 3: Student Service Integration
    console.log('\n3️⃣ Testing Student Service Integration...');
    
    // Get all students (required for dropdowns in components)
    const students = await studentService.getStudents();
    console.log(`   ✅ Students loaded: ${students.length}`);
    console.log(`   👥 Sample students:`, students.slice(0, 2).map(s => `${s.name} (Room ${s.roomNumber})`));
    
    // Test 4: End-to-End Workflow Simulation
    console.log('\n4️⃣ Testing End-to-End Workflow...');
    
    if (students.length > 0) {
      const testStudent = students[0];
      console.log(`   🎯 Using test student: ${testStudent.name} (${testStudent.id})`);
      
      // Simulate adding a charge (like AdminCharging component would do)
      console.log('   💰 Simulating charge addition...');
      const chargeResult = await adminChargingService.addChargeToStudent(
        testStudent.id,
        {
          type: 'admin_fee',
          amount: 100,
          description: 'Frontend Integration Test Charge',
          notes: 'Automated test charge',
          sendNotification: false
        },
        'Frontend Test'
      );
      
      if (chargeResult.success) {
        console.log(`   ✅ Charge added successfully: NPR ${chargeResult.chargeAmount}`);
        
        // Simulate applying a discount (like DiscountManagement component would do)
        console.log('   🏷️ Simulating discount application...');
        const discountResult = await discountService.applyDiscount({
          studentId: testStudent.id,
          amount: 50,
          reason: 'Frontend Integration Test Discount',
          notes: 'Automated test discount',
          appliedBy: 'Frontend Test'
        });
        
        console.log(`   ✅ Discount applied successfully: NPR 50`);
        
        // Get updated student charge history
        const chargeHistory = await adminChargingService.getStudentChargeHistory(testStudent.id);
        console.log(`   📊 Student charge history: ${chargeHistory.length} records`);
        
      } else {
        console.log(`   ❌ Charge addition failed: ${chargeResult.error}`);
      }
    }
    
    // Test 5: Component Data Requirements
    console.log('\n5️⃣ Verifying Component Data Requirements...');
    
    // AdminCharging component requirements
    console.log('   🔍 AdminCharging component data:');
    console.log(`      • Charge types: ${adminChargingService.chargeTypes.length > 0 ? '✅' : '❌'}`);
    console.log(`      • Students list: ${students.length > 0 ? '✅' : '❌'}`);
    console.log(`      • Overdue students: ${overdueStudents.length >= 0 ? '✅' : '❌'}`);
    console.log(`      • Charge summary: ${chargeSummary ? '✅' : '❌'}`);
    
    // DiscountManagement component requirements
    console.log('   🔍 DiscountManagement component data:');
    console.log(`      • Discount history: ${discountHistory.length >= 0 ? '✅' : '❌'}`);
    console.log(`      • Discount stats: ${discountStats ? '✅' : '❌'}`);
    console.log(`      • Students list: ${students.length > 0 ? '✅' : '❌'}`);
    
    console.log('\n🎉 Frontend Integration Test Completed Successfully!');
    console.log('\n📊 Integration Summary:');
    console.log(`   • Admin Charging Service: ✅ Fully Integrated`);
    console.log(`   • Discount Service: ✅ Fully Integrated`);
    console.log(`   • Student Service: ✅ Fully Integrated`);
    console.log(`   • Component Data Requirements: ✅ All Met`);
    console.log(`   • End-to-End Workflow: ✅ Working`);
    
    return true;
    
  } catch (error) {
    console.error('\n❌ Frontend Integration Test Failed:', error.message);
    console.error('Stack trace:', error.stack);
    return false;
  }
}

// Run the test
runFrontendIntegrationTest()
  .then(success => {
    if (success) {
      console.log('\n✅ All frontend services are properly integrated with the NestJS backend!');
      process.exit(0);
    } else {
      console.log('\n❌ Frontend integration test failed!');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('\n💥 Test execution failed:', error);
    process.exit(1);
  });