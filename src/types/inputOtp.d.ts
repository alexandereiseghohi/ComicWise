// Minimal types for `input-otp` used by the app
declare module "input-otp" {
  import type * as React from "react";

  export interface OTPInputContextType {
    value: string;
    onChange?(v: string): void;
    slots?: any;
  }

  export const OTPInputContext: React.Context<OTPInputContextType>;

  export interface OTPProps extends React.InputHTMLAttributes<HTMLInputElement> {
    length?: number;
  }

  export const OTPInput: React.FC<OTPProps>;

  export default OTPInput;
}
