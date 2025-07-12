import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

const env = createEnv({
  server: {
    NODE_ENV: z.enum(["development", "production"]),
    AUTH_SECRET: z.string(),
    API_URL: z.string(),
    INACTIVITY_TIME: z.string().optional().default("15"),
  },
  // onValidationError: (error: ZodError) => {
  //   console.error(
  //     "❌ Invalid environment variables:",
  //     error.flatten().fieldErrors
  //   );
  //   process.exit(1);
  // },
  emptyStringAsUndefined: true,
  experimental__runtimeEnv: process.env,
});

export default env;
