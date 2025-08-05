#!/usr/bin/env node

/**
 * Migration Runner Script
 * Provides a simple interface to run database migrations
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

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

function checkEnvironment() {
  log('🔍 Checking environment configuration...', 'cyan');
  
  const envFile = path.join(__dirname, '.env');
  if (!fs.existsSync(envFile)) {
    log('❌ .env file not found. Please create one with database configuration.', 'red');
    log('Example .env file:', 'yellow');
    log(`
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=kaha_user
DB_PASSWORD=password
DB_NAME=kaha_hostel_db
NODE_ENV=development
    `.trim(), 'yellow');
    process.exit(1);
  }
  
  // Load environment variables
  require('dotenv').config();
  
  const requiredVars = ['DB_HOST', 'DB_PORT', 'DB_USERNAME', 'DB_PASSWORD', 'DB_NAME'];
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    log(`❌ Missing required environment variables: ${missingVars.join(', ')}`, 'red');
    process.exit(1);
  }
  
  log('✅ Environment configuration looks good!', 'green');
  log(`   Database: ${process.env.DB_NAME}@${process.env.DB_HOST}:${process.env.DB_PORT}`, 'blue');
}

function runCommand(command, description) {
  log(`\\n🚀 ${description}...`, 'cyan');
  try {
    const output = execSync(command, { 
      stdio: 'pipe', 
      encoding: 'utf8',
      cwd: __dirname 
    });
    
    if (output.trim()) {
      log(output, 'blue');
    }
    log(`✅ ${description} completed successfully!`, 'green');
    return true;
  } catch (error) {
    log(`❌ ${description} failed:`, 'red');
    log(error.stdout || error.message, 'red');
    return false;
  }
}

function showMigrationStatus() {
  log('\\n📋 Checking migration status...', 'cyan');
  
  try {
    const output = execSync('npm run typeorm -- migration:show -d src/database/data-source.ts', {
      stdio: 'pipe',
      encoding: 'utf8',
      cwd: __dirname
    });
    
    log(output, 'blue');
  } catch (error) {
    log('Could not retrieve migration status. Database might not be accessible.', 'yellow');
  }
}

function listMigrationFiles() {
  log('\\n📁 Available migration files:', 'cyan');
  
  const migrationsDir = path.join(__dirname, 'src', 'database', 'migrations');
  if (!fs.existsSync(migrationsDir)) {
    log('❌ Migrations directory not found!', 'red');
    return;
  }
  
  const files = fs.readdirSync(migrationsDir)
    .filter(file => file.endsWith('.ts') && !file.endsWith('.d.ts'))
    .sort();
  
  if (files.length === 0) {
    log('No migration files found.', 'yellow');
    return;
  }
  
  files.forEach((file, index) => {
    log(`  ${index + 1}. ${file}`, 'blue');
  });
}

function showHelp() {
  log('\\n📖 Migration Runner Help', 'bright');
  log('========================', 'bright');
  log('');
  log('Available commands:', 'cyan');
  log('  run        - Run all pending migrations', 'blue');
  log('  revert     - Revert the last migration', 'blue');
  log('  status     - Show migration status', 'blue');
  log('  list       - List available migration files', 'blue');
  log('  generate   - Generate a new migration (requires name)', 'blue');
  log('  sync       - Synchronize schema (development only)', 'blue');
  log('  drop       - Drop all database tables (DANGEROUS)', 'blue');
  log('  help       - Show this help message', 'blue');
  log('');
  log('Examples:', 'cyan');
  log('  node run-migrations.js run', 'yellow');
  log('  node run-migrations.js generate AddNewColumn', 'yellow');
  log('  node run-migrations.js status', 'yellow');
}

function main() {
  const command = process.argv[2];
  const arg = process.argv[3];
  
  log('🏗️  Kaha Hostel Database Migration Runner', 'bright');
  log('=========================================', 'bright');
  
  if (!command || command === 'help') {
    showHelp();
    return;
  }
  
  checkEnvironment();
  
  switch (command) {
    case 'run':
      listMigrationFiles();
      showMigrationStatus();
      if (runCommand('npm run migration:run', 'Running migrations')) {
        log('\\n🎉 All migrations completed successfully!', 'green');
        showMigrationStatus();
      }
      break;
      
    case 'revert':
      showMigrationStatus();
      if (runCommand('npm run migration:revert', 'Reverting last migration')) {
        log('\\n✅ Migration reverted successfully!', 'green');
        showMigrationStatus();
      }
      break;
      
    case 'status':
      showMigrationStatus();
      break;
      
    case 'list':
      listMigrationFiles();
      break;
      
    case 'generate':
      if (!arg) {
        log('❌ Please provide a migration name:', 'red');
        log('   node run-migrations.js generate MigrationName', 'yellow');
        process.exit(1);
      }
      runCommand(`npm run migration:generate src/database/migrations/${Date.now()}-${arg}`, `Generating migration: ${arg}`);
      break;
      
    case 'sync':
      if (process.env.NODE_ENV === 'production') {
        log('❌ Schema sync is not allowed in production!', 'red');
        process.exit(1);
      }
      log('⚠️  WARNING: This will synchronize the schema with your entities.', 'yellow');
      log('   This may cause data loss in development!', 'yellow');
      runCommand('npm run schema:sync', 'Synchronizing schema');
      break;
      
    case 'drop':
      if (process.env.NODE_ENV === 'production') {
        log('❌ Schema drop is not allowed in production!', 'red');
        process.exit(1);
      }
      log('⚠️  DANGER: This will drop all database tables!', 'red');
      log('   All data will be lost!', 'red');
      runCommand('npm run schema:drop', 'Dropping all tables');
      break;
      
    default:
      log(`❌ Unknown command: ${command}`, 'red');
      showHelp();
      process.exit(1);
  }
}

// Handle errors gracefully
process.on('uncaughtException', (error) => {
  log(`\\n❌ Uncaught Exception: ${error.message}`, 'red');
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  log(`\\n❌ Unhandled Rejection at: ${promise}, reason: ${reason}`, 'red');
  process.exit(1);
});

if (require.main === module) {
  main();
}

module.exports = { main, runCommand, checkEnvironment };