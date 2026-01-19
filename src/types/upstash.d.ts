declare module "upstash/redis" {
  export interface RedisConfig {
    url: string;
    token: string;
  }

  /**
   *
   */
  export class Redis {
    /**
     *
     */
    constructor(config: RedisConfig);
    /**
     *
     */
    get<T = string>(key: string): Promise<T | null>;
    /**
     *
     */
    set(
      key: string,
      value: string | number | object,
      options?: { ex?: number; px?: number; nx?: boolean; xx?: boolean }
    ): Promise<"OK" | null>;
    /**
     *
     */
    del(...keys: string[]): Promise<number>;
    /**
     *
     */
    incr(key: string): Promise<number>;
    /**
     *
     */
    decr(key: string): Promise<number>;
    /**
     *
     */
    expire(key: string, seconds: number): Promise<number>;
    /**
     *
     */
    ttl(key: string): Promise<number>;
    /**
     *
     */
    exists(...keys: string[]): Promise<number>;
    /**
     *
     */
    keys(pattern: string): Promise<string[]>;
    /**
     *
     */
    flushdatabase(): Promise<"OK">;
  }
}

declare module "upstash/qstash" {
  export interface QStashConfig {
    token: string;
  }

  export interface PublishOptions {
    url: string;
    body?: string | object;
    headers?: Record<string, string>;
    delay?: number;
    notBefore?: number;
    retries?: number;
  }

  export interface PublishResponse {
    messageId: string;
  }

  export interface VerifyOptions {
    signature: string;
    body: string;
    url: string;
  }

  /**
   *
   */
  export class Client {
    /**
     *
     */
    constructor(config: QStashConfig);
    /**
     *
     */
    publishJSON(options: PublishOptions): Promise<PublishResponse>;
    /**
     *
     */
    verify(options: VerifyOptions): Promise<boolean>;
  }

  /**
   *
   */
  export class Receiver {
    /**
     *
     */
    constructor(options: { currentSigningKey: string; nextSigningKey: string });
    /**
     *
     */
    verify(options: { signature: string; body: string; url?: string }): Promise<boolean>;
  }
}
