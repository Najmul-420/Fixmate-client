import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "@better-auth/mongo-adapter";

const client = new MongoClient(process.env.MONGODB_URI as string);
const db = client.db("fixmate");

const allowedOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:5000",
  process.env.BETTER_AUTH_URL,
  process.env.CLIENT_URL,
  process.env.NEXT_PUBLIC_APP_URL,
].filter((origin): origin is string => Boolean(origin && origin.trim()));

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:5000",
  secret: process.env.BETTER_AUTH_SECRET,
  trustedOrigins: allowedOrigins,
  database: mongodbAdapter(db, {
    client,
  }),
  user: {
    additionalFields: {
      role: {
        type: ["customer", "technician", "admin"],
        input: true,
        defaultValue: "customer",
      },
      phone: { type: "string", required: false, input: true },
      area: { type: "string", required: false, input: true },
      bio: { type: "string", required: false, input: true },
    },
  },
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {},
});