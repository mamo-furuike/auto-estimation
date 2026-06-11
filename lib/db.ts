import { neon } from "@neondatabase/serverless";

export function getSql() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error(
      "DATABASE_URL が設定されていません。`vercel env pull` で .env.local を取得してください。",
    );
  }

  return neon(databaseUrl);
}
