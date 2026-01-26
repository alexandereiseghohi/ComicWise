// ambient module declarations for modules without types
declare module "eslint-plugin-drizzle";
declare module "react-image-crop/dist/ReactCrop.css";

// allow importing raw CSS modules in TypeScript for the app
declare module "*.css" {
  const content: { [className: string]: string };
  export default content;
}
