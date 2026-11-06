import { createClient } from "@supabase/supabase-js";

import { env } from "../../core/config/env.js";
import type { Database } from "./database.types.js";

export const supabase = createClient<Database>(
  env.SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  },
);
