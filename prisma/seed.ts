import { prisma } from "@/lib/prisma";
import { runSeeds } from "./seeds";

async function main() {
  await runSeeds(prisma);
}

main()
  .then(async () => {
    console.info("Seed completed successfully");
    process.exit(0);
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
