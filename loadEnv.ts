// server/loadEnv.ts
import * as dotenv from 'dotenv';
import path from 'path';

// Explicitly configure dotenv to look for the file in the project root
dotenv.config({ path: path.resolve(import.meta.dirname, '..', '.env') });

// Now, import and run your main application file
import './index.ts';