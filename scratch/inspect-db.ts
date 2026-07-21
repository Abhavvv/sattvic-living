import { db } from "../src/lib/db";

async function main() {
  console.log("--- Users ---");
  const users = await db.user.findMany();
  console.log(users);

  console.log("\n--- Sessions ---");
  const sessions = await db.session.findMany();
  console.log(sessions);

  console.log("\n--- Accounts ---");
  const accounts = await db.account.findMany();
  console.log(accounts);
}

main()
  .catch((err) => console.error(err))
  .finally(() => db.$disconnect());
