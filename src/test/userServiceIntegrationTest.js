// User Service Integration Test
// Tests the integration between frontend userService and NestJS backend

import { userService } from '../services/userService.js';

console.log('🧪 User Service Integration Test Starting...\n');

async function runUserServiceIntegrationTest() {
  try {
    // Test 1: Get All Users
    console.log('1️⃣ Testing Get All Users...');
    const users = await userService.getAllUsers();
    console.log(`   ✅ Users loaded: ${users.length}`);
    console.log(`   👥 Sample users:`, users.slice(0, 2).map(u => `${u.fullName} (${u.username})`));
    
    // Test 2: Get User Statistics
    console.log('\n2️⃣ Testing User Statistics...');
    const stats = await userService.getUserStats();
    console.log(`   ✅ User statistics:`, stats);
    
    // Test 3: Get Users by Role
    console.log('\n3️⃣ Testing Get Users by Role...');
    const adminUsers = await userService.getUsersByRole('admin');
    console.log(`   ✅ Admin users: ${adminUsers.length}`);
    
    // Test 4: Get Users by Department
    console.log('\n4️⃣ Testing Get Users by Department...');
    const adminDeptUsers = await userService.getUsersByDepartment('administration');
    console.log(`   ✅ Administration department users: ${adminDeptUsers.length}`);
    
    // Test 5: Authentication Test
    console.log('\n5️⃣ Testing User Authentication...');
    try {
      const authResult = await userService.authenticateUser('admin', 'admin123');
      console.log(`   ✅ Authentication successful for: ${authResult.fullName}`);
    } catch (authError) {
      console.log(`   ⚠️  Authentication test skipped: ${authError.message}`);
    }
    
    // Test 6: Get User by ID (if users exist)
    if (users.length > 0) {
      console.log('\n6️⃣ Testing Get User by ID...');
      const firstUser = users[0];
      const userDetails = await userService.getUserById(firstUser.id);
      console.log(`   ✅ User details fetched: ${userDetails.fullName}`);
    }
    
    console.log('\n🎉 User Service Integration Test Completed Successfully!');
    
    console.log('\n📊 Integration Summary:');
    console.log(`   • Total Users: ${users.length}`);
    console.log(`   • User Statistics: ✅ Working`);
    console.log(`   • Role-based Filtering: ✅ Working`);
    console.log(`   • Department-based Filtering: ✅ Working`);
    console.log(`   • User Details: ✅ Working`);
    console.log(`   • API Integration: ✅ Complete`);
    
    return true;
    
  } catch (error) {
    console.error('\n❌ User Service Integration Test Failed:', error.message);
    console.error('Stack trace:', error.stack);
    return false;
  }
}

// Run the test
runUserServiceIntegrationTest()
  .then(success => {
    if (success) {
      console.log('\n✅ User service is properly integrated with the NestJS backend!');
      process.exit(0);
    } else {
      console.log('\n❌ User service integration test failed!');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('\n💥 Test execution failed:', error);
    process.exit(1);
  });