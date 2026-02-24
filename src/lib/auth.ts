import { betterAuth } from "better-auth";
import { organization, admin } from "better-auth/plugins";
import { Pool } from "pg";

const dbUrl = process.env.DATABASE_URL || "";
const needsSsl = dbUrl.includes("rlwy.net") || (dbUrl.includes("railway") && !dbUrl.includes("railway.internal"));

const pool = new Pool({
  connectionString: dbUrl,
  ssl: needsSsl ? { rejectUnauthorized: false } : false,
});

export const auth = betterAuth({
  database: pool,
  trustedOrigins: [
    process.env.BETTER_AUTH_URL || "http://localhost:3000",
    "https://www.edge-ai.space",
    "https://edge-ai.space",
  ],
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  user: {
    additionalFields: {
      buildingType: {
        type: "string",
        required: false,
        defaultValue: "other",
        input: true,
      },
    },
  },
  plugins: [
    organization(),
    admin(),
  ],
});

export type Session = typeof auth.$Infer.Session;
