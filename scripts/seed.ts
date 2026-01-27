import seedData from "../src/lib/seeder";

async function main() {
  const result = await seedData();
  console.log("Seeder results:", result);
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
