#!/usr/bin/env node

/**
 * Database Setup Script
 * Provides options to set up the database using either migrations or synchronization
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const readline = require("readline");

// Colors for console output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
};

function log(message, color = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkEnvironment() {
  log("🔍 Checking environment configuration...", "cyan");

  const envFile = path.join(__dirname, ".env");
  if (!fs.existsSync(envFile)) {
    log(
      "❌ .env file not found. Please create one with database configuration.",
      "red"
    );
    log("Example .env file:", "yellow");
    log(
      `
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=kaha_user
DB_PASSWORD=password
DB_NAME=kaha_hostel_db
NODE_ENV=development
    `.trim(),
      "yellow"
    );
    process.exit(1);
  }

  // Load environment variables
  require("dotenv").config();

  const requiredVars = [
    "DB_HOST",
    "DB_PORT",
    "DB_USERNAME",
    "DB_PASSWORD",
    "DB_NAME",
  ];
  const missingVars = requiredVars.filter((varName) => !process.env[varName]);

  if (missingVars.length > 0) {
    log(
      `❌ Missing required environment variables: ${missingVars.join(", ")}`,
      "red"
    );
    process.exit(1);
  }

  log("✅ Environment configuration looks good!", "green");
  log(
    `   Database: ${process.env.DB_NAME}@${process.env.DB_HOST}:${process.env.DB_PORT}`,
    "blue"
  );
}

function runCommand(command, description) {
  log(`\\n🚀 ${description}...`, "cyan");
  try {
    const output = execSync(command, {
      stdio: "pipe",
      encoding: "utf8",
      cwd: __dirname,
    });

    if (output.trim()) {
      log(output, "blue");
    }
    log(`✅ ${description} completed successfully!`, "green");
    return true;
  } catch (error) {
    log(`❌ ${description} failed:`, "red");
    log(error.stdout || error.message, "red");
    return false;
  }
}

function showDatabaseStatus() {
  log("\\n📋 Checking database status...", "cyan");

  try {
    // Try to connect and show basic info
    const output = execSync(
      'npm run typeorm -- query "SELECT current_database(), current_user, version()" -d src/database/data-source.ts',
      {
        stdio: "pipe",
        encoding: "utf8",
        cwd: __dirname,
      }
    );

    log("Database connection successful:", "green");
    log(output, "blue");
    return true;
  } catch (error) {
    log("❌ Could not connect to database:", "red");
    log(error.stdout || error.message, "red");
    return false;
  }
}

function showMigrationStatus() {
  log("\\n📋 Checking migration status...", "cyan");

  try {
    const output = execSync(
      "npm run typeorm -- migration:show -d src/database/data-source.ts",
      {
        stdio: "pipe",
        encoding: "utf8",
        cwd: __dirname,
      }
    );

    log(output, "blue");
    return true;
  } catch (error) {
    log(
      "Migration table might not exist yet (this is normal for first setup)",
      "yellow"
    );
    return false;
  }
}

function listTables() {
  log("\\n📋 Checking existing tables...", "cyan");

  try {
    const output = execSync(
      `npm run typeorm -- query "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name" -d src/database/data-source.ts`,
      {
        stdio: "pipe",
        encoding: "utf8",
        cwd: __dirname,
      }
    );

    if (output.includes("table_name")) {
      log("Existing tables:", "green");
      log(output, "blue");
      return true;
    } else {
      log("No tables found in database", "yellow");
      return false;
    }
  } catch (error) {
    log("Could not list tables", "yellow");
    return false;
  }
}

async function askQuestion(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim().toLowerCase());
    });
  });
}

async function setupWithMigrations() {
  log("\\n🏗️  Setting up database using MIGRATIONS", "bright");
  log("=====================================", "bright");

  // Check if migrations have been run
  const migrationExists = showMigrationStatus();

  if (!migrationExists) {
    log("\\n📝 No migrations have been run yet.", "yellow");
    const proceed = await askQuestion(
      "Do you want to run all migrations now? (y/n): "
    );

    if (proceed === "y" || proceed === "yes") {
      if (runCommand("npm run migration:run", "Running all migrations")) {
        log(
          "\\n🎉 Database schema created successfully using migrations!",
          "green"
        );
        showMigrationStatus();
      } else {
        log("\\n❌ Migration failed. Please check the errors above.", "red");
        return false;
      }
    } else {
      log("\\n⏸️  Migration setup cancelled.", "yellow");
      return false;
    }
  } else {
    log("\\n✅ Migrations have already been applied.", "green");
    const runPending = await askQuestion(
      "Do you want to run any pending migrations? (y/n): "
    );

    if (runPending === "y" || runPending === "yes") {
      runCommand("npm run migration:run", "Running pending migrations");
    }
  }

  return true;
}

async function setupWithSync() {
  log("\\n⚡ Setting up database using SYNCHRONIZATION", "bright");
  log("===========================================", "bright");

  if (process.env.NODE_ENV === "production") {
    log("❌ Synchronization is not allowed in production environment!", "red");
    log("   Please use migrations for production deployments.", "red");
    return false;
  }

  // Check if tables already exist
  const hasExistingTables = listTables();

  if (hasExistingTables) {
    log("\\n⚠️  WARNING: Existing tables detected!", "yellow");
    log("   Synchronization may modify or drop existing data.", "yellow");

    const dropFirst = await askQuestion(
      "Do you want to drop all existing tables first? (y/n): "
    );

    if (dropFirst === "y" || dropFirst === "yes") {
      log("\\n🗑️  Dropping all existing tables...", "red");
      if (!runCommand("npm run schema:drop", "Dropping all database tables")) {
        return false;
      }
    }
  }

  log("\\n🔄 Synchronizing database schema with entities...", "cyan");
  if (runCommand("npm run schema:sync", "Synchronizing database schema")) {
    log("\\n🎉 Database schema synchronized successfully!", "green");
    listTables();
    return true;
  } else {
    log(
      "\\n❌ Schema synchronization failed. Please check the errors above.",
      "red"
    );
    return false;
  }
}

async function seedDatabase() {
  log("\\n🌱 Database Seeding Options", "bright");
  log("===========================", "bright");
  log("");
  log("Choose seeding method:", "cyan");
  log("1. 🚀 API-based seeding (Recommended)", "blue");
  log("   - Seeds data through API endpoints", "blue");
  log("   - Tests your API while seeding", "blue");
  log("   - More flexible and realistic", "blue");
  log("");
  log("2. 📁 Direct database seeding", "yellow");
  log("   - Seeds data directly to database", "yellow");
  log("   - Faster but bypasses API validation", "yellow");
  log("");
  log("3. ⏸️  Skip seeding", "magenta");
  log("");

  const seedChoice = await askQuestion("Enter your choice (1-3): ");

  switch (seedChoice) {
    case "1":
      return await seedViaAPI();
    case "2":
      return await seedDirectly();
    case "3":
      log("\\n⏸️  Database seeding skipped.", "yellow");
      return true;
    default:
      log("\\n❌ Invalid choice. Skipping seeding.", "red");
      return true;
  }
}

async function seedViaAPI() {
  log("\\n🚀 API-Based Seeding", "bright");
  log("====================", "bright");

  log("\\n📋 This will seed data through your API endpoints.", "cyan");
  log("   Make sure your server is running in another terminal:", "yellow");
  log("   npm run start:dev", "yellow");

  const serverReady = await askQuestion(
    "\\nIs the server running and ready? (y/n): "
  );

  if (serverReady !== "y" && serverReady !== "yes") {
    log(
      "\\n⏸️  API seeding cancelled. Please start the server first.",
      "yellow"
    );
    return false;
  }

  if (runCommand("npm run test:seed", "Running API-based seeding and tests")) {
    log("\\n🎉 Database seeded successfully via API!", "green");
    log(
      "\\n📊 Your API endpoints are working correctly and database is populated.",
      "green"
    );
    return true;
  } else {
    log(
      "\\n❌ API seeding failed. Please check the server and try again.",
      "red"
    );
    return false;
  }
}

async function seedDirectly() {
  log("\\n📁 Direct Database Seeding", "bright");
  log("==========================", "bright");

  if (runCommand("npm run seed:run", "Seeding database directly")) {
    log("\\n🎉 Database seeded successfully!", "green");
    return true;
  } else {
    log("\\n❌ Database seeding failed. Please check the errors above.", "red");
    return false;
  }
}

async function runTests() {
  log("\\n🧪 API Testing Options", "bright");
  log("======================", "bright");

  const testChoice = await askQuestion(
    "Do you want to run API tests to verify the setup? (y/n): "
  );

  if (testChoice === "y" || testChoice === "yes") {
    log("\\n🚀 Starting the server for testing...", "cyan");
    log(
      "   Please make sure the server is running in another terminal:",
      "yellow"
    );
    log("   npm run start:dev", "yellow");

    const serverReady = await askQuestion(
      "\\nIs the server running and ready? (y/n): "
    );

    if (serverReady === "y" || serverReady === "yes") {
      if (
        runCommand("npm run test:api:full", "Running comprehensive API tests")
      ) {
        log(
          "\\n🎉 All API tests passed! Your setup is working correctly.",
          "green"
        );
        return true;
      } else {
        log(
          "\\n⚠️  Some API tests failed. Please check the server and database.",
          "yellow"
        );
        return false;
      }
    } else {
      log("\\n⏸️  API testing skipped.", "yellow");
      return true;
    }
  } else {
    log("\\n⏸️  API testing skipped.", "yellow");
    return true;
  }
}

async function showMainMenu() {
  log("\\n🏗️  Kaha Hostel Database Setup", "bright");
  log("===============================", "bright");
  log("");
  log("Choose your setup method:", "cyan");
  log("");
  log("1. 🏗️  Migration Mode (Recommended for Production)", "blue");
  log("   - Uses TypeORM migrations for schema management", "blue");
  log("   - Version controlled database changes", "blue");
  log("   - Safe for production deployments", "blue");
  log("");
  log("2. ⚡ Synchronization Mode (Development Only)", "yellow");
  log("   - Automatically syncs entities with database", "yellow");
  log("   - Fast setup for development", "yellow");
  log("   - May cause data loss - not for production!", "yellow");
  log("");
  log("3. 📊 Database Status (Check current state)", "magenta");
  log("");
  log("4. 🆘 Help & Documentation", "cyan");
  log("");

  const choice = await askQuestion("Enter your choice (1-4): ");

  switch (choice) {
    case "1":
      return "migration";
    case "2":
      return "sync";
    case "3":
      return "status";
    case "4":
      return "help";
    default:
      log("\\n❌ Invalid choice. Please enter 1, 2, 3, or 4.", "red");
      return await showMainMenu();
  }
}

function showHelp() {
  log("\\n📖 Database Setup Help", "bright");
  log("======================", "bright");
  log("");
  log("🏗️  Migration Mode:", "cyan");
  log("   - Best for: Production, team development, version control");
  log("   - Pros: Safe, reversible, version controlled");
  log("   - Cons: Requires manual migration creation for complex changes");
  log("");
  log("⚡ Synchronization Mode:", "cyan");
  log("   - Best for: Quick development, prototyping, testing");
  log("   - Pros: Fast, automatic, no migration files needed");
  log("   - Cons: Can cause data loss, not suitable for production");
  log("");
  log("📁 Files Created:", "cyan");
  log("   - Migration files: src/database/migrations/*.ts");
  log("   - Entity files: src/*/entities/*.entity.ts");
  log("   - Configuration: src/database/data-source.ts");
  log("");
  log("🔧 Manual Commands:", "cyan");
  log("   - npm run migration:run    # Run migrations");
  log("   - npm run schema:sync      # Synchronize schema");
  log("   - npm run seed:run         # Seed sample data");
  log("   - npm run test:api:full    # Test API endpoints");
  log("");
  log("📚 Documentation:", "cyan");
  log("   - See MIGRATION-GUIDE.md for detailed instructions");
  log("   - Check .env.example for environment configuration");
}

async function showStatus() {
  log("\\n📊 Database Status Check", "bright");
  log("========================", "bright");

  // Check database connection
  const connected = showDatabaseStatus();

  if (connected) {
    // Show existing tables
    listTables();

    // Show migration status
    showMigrationStatus();

    log("\\n📈 Quick Stats:", "cyan");
    try {
      // Try to get some basic stats if tables exist
      const statsQuery = `
        SELECT 
          (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public') as table_count,
          (SELECT COUNT(*) FROM students WHERE 1=1) as student_count,
          (SELECT COUNT(*) FROM rooms WHERE 1=1) as room_count
      `;

      const output = execSync(
        `npm run typeorm -- query "${statsQuery}" -d src/database/data-source.ts`,
        {
          stdio: "pipe",
          encoding: "utf8",
          cwd: __dirname,
        }
      );

      log(output, "blue");
    } catch (error) {
      log(
        "Could not retrieve database statistics (tables may not exist yet)",
        "yellow"
      );
    }
  }
}

async function main() {
  try {
    checkEnvironment();

    const choice = await showMainMenu();

    switch (choice) {
      case "migration":
        const migrationSuccess = await setupWithMigrations();
        if (migrationSuccess) {
          await seedDatabase();
          await runTests();
        }
        break;

      case "sync":
        const syncSuccess = await setupWithSync();
        if (syncSuccess) {
          await seedDatabase();
          await runTests();
        }
        break;

      case "status":
        await showStatus();
        break;

      case "help":
        showHelp();
        break;
    }

    log("\\n✨ Database setup process completed!", "green");
    log("\\n📚 Next steps:", "cyan");
    log("   1. Start the server: npm run start:dev", "blue");
    log("   2. Test the API: npm run test:api:full", "blue");
    log("   3. Check the documentation: MIGRATION-GUIDE.md", "blue");
  } catch (error) {
    log(`\\n❌ Setup failed: ${error.message}`, "red");
    process.exit(1);
  }
}

// Handle errors gracefully
process.on("uncaughtException", (error) => {
  log(`\\n❌ Uncaught Exception: ${error.message}`, "red");
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  log(`\\n❌ Unhandled Rejection at: ${promise}, reason: ${reason}`, "red");
  process.exit(1);
});

if (require.main === module) {
  main();
}

module.exports = { main, setupWithMigrations, setupWithSync };
