import dotenv from 'dotenv';

dotenv.config();

// load all the env's and crash the server is something is missing
const requiredEnvVars = ['MONGO_URI', 'JWT_SECRET'] as const;

for (const key of requiredEnvVars) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

export const config = {
  port:        parseInt(process.env.PORT ?? '5000', 10),
  mongoUri:    process.env.MONGO_URI as string,
  jwtSecret:   process.env.JWT_SECRET as string,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  nodeEnv:     process.env.NODE_ENV ?? 'development',
};
