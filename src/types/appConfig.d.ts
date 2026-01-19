declare module "@/appConfig" {
  export const env: {
    CI: any;
    REDIS_DB: number;
    REDIS_TLS_ENABLED: boolean;
    DATABASE_URL: string;
    NEXTAUTH_SECRET: string;
    NEXTAUTH_URL: string;
    AUTH_URL: string;
    NEXT_PUBLIC_APP_URL: string;
    PORT: string;
    UPSTASH_REDIS_REST_URL: string;
    UPSTASH_REDIS_REST_TOKEN: string;
    REDIS_HOST?: string;
    REDIS_PORT?: string;
    REDIS_PASSWORD?: string;
    UPLOAD_PROVIDER: string;
    RESEND_API_KEY?: string;
    CLOUDINARY_CLOUD_NAME?: string;
    CLOUDINARY_API_KEY?: string;
    CLOUDINARY_API_SECRET?: string;
    AWS_ACCESS_KEY_ID?: string;
    AWS_SECRET_ACCESS_KEY?: string;
    AWS_S3_BUCKET?: string;
    AWS_S3_BUCKET_NAME?: string;
    AWS_REGION?: string;
    IMAGEKIT_PUBLIC_KEY?: string;
    IMAGEKIT_PRIVATE_KEY?: string;
    IMAGEKIT_URL_ENDPOINT?: string;
    GOOGLE_CLIENT_ID?: string;
    GOOGLE_CLIENT_SECRET?: string;
    NODE_ENV: "development" | "production" | "test";
  };

  export const isDevelopment: boolean;
  export const isProduction: boolean;
  export const isTest: boolean;

  export function checkRateLimit(
    identifier: string,
    options?: { limit?: number; window?: string }
  ): Promise<{
    success: boolean;
    allowed: boolean;
    limit: number;
    remaining: number;
    reset: number;
  }>;

  export function clearRateLimit(identifier: string): Promise<void>;

  export function getRateLimitStatus(identifier: string): Promise<{
    limit: number;
    remaining: number;
    reset: number;
  }>;

  const appConfig: {
    auth: any;
    name: string;
    url: string;
    description: string;
    session: {
      maxAge: number;
      updateAge: number;
    };
    rateLimit: {
      enabled: boolean;
      default: number;
      defaultLimit: number;
      defaultWindow: string;
      auth: number;
      email: number;
    };
    security: {
      maxLoginAttempts: number;
      bcryptRounds?: number;
      tokenExpiry?: {
        emailVerification?: number;
        passwordReset?: number;
      };
    };
    features: {
      emailVerification: boolean;
      email: boolean;
      twoFactor: boolean;
    };
    upload: {
      maxSize: number;
      allowedTypes: string[];
      enabled?: boolean;
      imageKit?: {
        publicKey: string;
        privateKey: string;
        urlEndpoint: string;
      };
    };
    email: {
      enabled: boolean;
      from: string;
      fromName: string;
      defaultTemplate: string;
      templates: Record<string, string>;
      provider: string;
      host: string;
      port: number;
      secure: boolean;
      auth: {
        user: string;
        pass: string;
      };
    };
    pagination?: {
      defaultLimit?: number;
      comicsPerPage?: number;
      chaptersPerPage?: number;
    };
    customPassword?: string;
  };

  export default appConfig;
}
