declare module "cloudinary" {
  export interface ConfigOptions {
    cloud_name: string;
    api_key: string;
    api_secret: string;
    secure?: boolean;
  }

  export interface UploadOptions {
    folder?: string;
    public_id?: string;
    use_filename?: boolean;
    unique_filename?: boolean;
    resource_type?: "image" | "video" | "raw" | "auto";
    tags?: string[];
  }

  export interface UploadResult {
    public_id: string;
    version: number;
    signature: string;
    width: number;
    height: number;
    format: string;
    resource_type: string;
    created_at: string;
    bytes: number;
    type: string;
    url: string;
    secure_url: string;
  }

  export interface DestroyOptions {
    resource_type?: "image" | "video" | "raw";
    type?: string;
    invalidate?: boolean;
  }

  export interface DestroyResult {
    result: "ok" | "not found";
  }

  export interface SearchOptions {
    expression: string;
    max_results?: number;
    next_cursor?: string;
  }

  export interface SearchResult {
    total_count: number;
    resources: UploadResult[];
    next_cursor?: string;
  }

  export const v2: {
    config(options: ConfigOptions): void;
    uploader: {
      upload(file: string | Buffer, options?: UploadOptions): Promise<UploadResult>;
      destroy(publicId: string, options?: DestroyOptions): Promise<DestroyResult>;
    };
    search: {
      expression(expr: string): {
        max_results(number_: number): {
          execute(): Promise<SearchResult>;
        };
      };
    };
  };
}
