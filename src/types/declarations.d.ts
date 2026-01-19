declare module "eslint-plugin-drizzle";
declare module "eslint-plugin-security";
declare module "fs-extra";
declare module "react-image-crop/dist/ReactCrop.css";
// CSS module declarations
declare module "*.css" {
  const content: Record<string, string>;
  export default content;
}
