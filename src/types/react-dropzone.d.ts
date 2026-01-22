// Minimal react-dropzone types needed by the project
declare module "react-dropzone" {
  import type * as React from "react";

  export interface FileWithPath extends File {
    path?: string;
  }

  export type DropEvent = React.DragEvent<HTMLElement> | React.SyntheticEvent<any>;

  export interface DropzoneOptions {
    multiple?: boolean;
    accept?: string | Record<string, string[]>;
  }

  export function useDropzone(options?: DropzoneOptions): {
    getRootProps(props?: any): any;
    getInputProps(props?: any): any;
    open(): void;
    acceptedFiles: FileWithPath[];
    isDragActive: boolean;
    isDragAccept: boolean;
    isDragReject: boolean;
    fileRejections: Array<any>;
  };

  export const Dropzone: React.FC<any>;
  export default useDropzone;
}
