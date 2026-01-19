declare module "imagekit" {
  export interface ImageKitOptions {
    publicKey: string;
    privateKey: string;
    urlEndpoint: string;
  }

  export interface UploadOptions {
    file: string | Buffer;
    fileName: string;
    folder?: string;
    useUniqueFileName?: boolean;
    tags?: string[];
    responseFields?: string[];
  }

  export interface UploadResponse {
    fileId: string;
    name: string;
    url: string;
    thumbnailUrl: string;
    height: number;
    width: number;
    size: number;
    filePath: string;
    fileType: string;
  }

  export interface DeleteFileOptions {
    fileId: string;
  }

  export interface ListFilesOptions {
    path?: string;
    searchQuery?: string;
    skip?: number;
    limit?: number;
  }

  export interface FileObject {
    fileId: string;
    name: string;
    filePath: string;
    url: string;
    thumbnailUrl?: string;
    height?: number;
    width?: number;
    size: number;
    fileType: string;
    createdAt: string;
    updatedAt: string;
  }

  export default class ImageKit {
    getAuthenticationParameters(): { token: string; expire: number; signature: string } {
      throw new Error("Method not implemented.");
    }
    url(argument0: { path: string; transformation: { [key: string]: string | number }[] }): string {
      throw new Error("Method not implemented.");
    }
    getFileMetadata(fileId: string) {
      throw new Error("Method not implemented.");
    }
    constructor(options: ImageKitOptions);
    upload(options: UploadOptions): Promise<UploadResponse>;
    deleteFile(options: DeleteFileOptions): Promise<void>;
    listFiles(options?: ListFilesOptions): Promise<FileObject[]>;
    getFileDetails(fileId: string): Promise<FileObject>;
  }
}
