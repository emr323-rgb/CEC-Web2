import { runMigration } from "./server/migrations/add_name_to_users";

async function main() {
  try {
    await runMigration();
    console.log("Migration completed successfully");
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

main();