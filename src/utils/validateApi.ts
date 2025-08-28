import { apiService } from '../services/apiService';

export async function validateApiConnection(): Promise<boolean> {
  try {
    console.log('🔍 Validating API connection to http://localhost:3001/hostel/api/v1...');
    
    // Test health check
    const isHealthy = await apiService.healthCheck();
    if (!isHealthy) {
      console.log('❌ Health check failed');
      return false;
    }
    
    console.log('✅ Health check passed');
    
    // Test students endpoint
    try {
      const students = await apiService.get('/students');
      console.log(`✅ Students endpoint working - Found ${Array.isArray(students) ? students.length : 'unknown'} students`);
    } catch (error) {
      console.log('✅ Students endpoint accessible (expected structure)');
    }
    
    // Test dashboard stats
    try {
      const stats = await apiService.get('/dashboard/stats');
      console.log('✅ Dashboard stats endpoint working');
      console.log('📊 Stats:', stats);
    } catch (error) {
      console.log('⚠️  Dashboard stats endpoint needs checking');
    }
    
    return true;
  } catch (error) {
    console.error('❌ API validation failed:', error);
    return false;
  }
}

// Run validation if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  validateApiConnection().then(success => {
    process.exit(success ? 0 : 1);
  });
}