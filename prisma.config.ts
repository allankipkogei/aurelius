import { defineConfig } from "@prisma/config";
import * as dotenv from "dotenv";
import path from "path";

// Manually point to the .env file in the current directory
dotenv.config({ path: path.join(process.cwd(), ".env") });

export default defineConfig({
  datasource: {
    // Using ! ensures TypeScript knows it's there, 
    // and process.env is more reliable here than the env() helper
    url: process.env.DATABASE_URL!, 
  },
});