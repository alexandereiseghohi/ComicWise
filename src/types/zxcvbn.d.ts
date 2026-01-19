declare module "zxcvbn-ts/core" {
  export interface ZxcvbnResult {
    score: 0 | 1 | 2 | 3 | 4;
    guesses: number;
    guesses_log10: number;
    calc_time: number;
    feedatabaseack: {
      warning: string;
      suggestions: string[];
    };
    sequence: Array<{
      pattern: string;
      token: string;
      guesses: number;
    }>;
  }

  export interface ZxcvbnOptions {
    dictionary?: {
      userInputs?: string[];
    };
    graphs?: Record<string, unknown>;
    translations?: Record<string, unknown>;
  }

  export function zxcvbn(password: string, userInputs?: string[]): ZxcvbnResult;
  export function zxcvbnOptions(options: ZxcvbnOptions): void;
}

declare module "zxcvbn-ts/language-common" {
  export const dictionary: {
    passwords: string[];
    names: string[];
    surnames: string[];
  };
}

declare module "zxcvbn-ts/language-en" {
  export const dictionary: {
    passwords: string[];
    names: string[];
    surnames: string[];
  };
  export const translations: Record<string, string>;
}
