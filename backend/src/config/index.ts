import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'default-secret-change-this',
  omniroute: {
    apiKey: process.env.OMNIROUTE_API_KEY || '',
    endpoint: process.env.OMNIROUTE_ENDPOINT || 'https://api.omniroute.ai',
  },
  database: {
    url: process.env.DATABASE_URL || '',
  },
};
