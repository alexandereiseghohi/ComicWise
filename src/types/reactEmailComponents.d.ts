// Narrow definitions for `@react-email/components` surface used by the app
declare module "@react-email/components" {
  import type * as React from "react";

  export interface ImgProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    src?: string;
    alt?: string;
    width?: string | number;
    height?: string | number;
  }

  export const Img: React.FC<ImgProps>;

  export interface HeadingProps {
    children?: React.ReactNode;
    as?: string | React.ElementType;
    style?: React.CSSProperties;
  }

  export const Heading: React.FC<HeadingProps>;
  export const Body: React.FC<any>;
  export const Button: React.FC<any>;
  export const Container: React.FC<any>;
  export const Head: React.FC<any>;
  export const Hr: React.FC<any>;
  export const Html: React.FC<any>;
  export const Link: React.FC<any>;
  export const Preview: React.FC<any>;
  export const Section: React.FC<any>;
  export const Text: React.FC<any>;

  export function render(email: React.ReactElement): string;

  export default {} as any;
}
