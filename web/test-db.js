const { Client } = require("@prisma/client/runtime/library");
const { execSync } = require("child_process");

const passwords = [
  "postgres",
  "admin",
  "root",
  "password",
  "123456",
  "teacherai_secret",
  "1234",
  "12345",
  "pass",
  "Postgres",
  "Admin",
  ""
];

const users = ["postgres", "teacherai"];

async function main() {
  for (const user of users) {
    for (const pass of passwords) {
      const url = `postgresql://${user}:${pass}@localhost:5432/postgres`;
      process.env.DATABASE_URL = url;
      try {
        const out = execSync(`npx prisma db execute --stdin --url "${url}"`, {
          input: "SELECT 1;",
          encoding: "utf-8",
          stdio: ["pipe", "pipe", "ignore"]
        });
        console.log(`FOUND_CREDENTIALS: user=${user} password=${pass}`);
        return;
      } catch (e) {
        // failed
      }
    }
  }
  console.log("NO_VALID_CREDENTIALS_FOUND");
}

main();
