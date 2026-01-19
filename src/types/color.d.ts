// Narrowed types for `color` used by the project
declare module "color" {
  export interface RGBObject {
    r: number;
    g: number;
    b: number;
    alpha?: number;
  }

  export interface Color {
    rgb(): { object(): RGBObject; array(): number[] };
    object(): RGBObject;
    array(): number[];
    hex(): string;
    toString(): string;
  }

  function Color(input?: any): Color;
  namespace Color {}
  export default Color;
}
