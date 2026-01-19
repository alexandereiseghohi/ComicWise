"use client";

import debounce from "lodash.debounce";
import * as React from "react";

import { useUnmount } from "@/hooks/use-unmount";

interface DebounceOptions {
  leading?: boolean;
  trailing?: boolean;
  maxWait?: number;
}

interface ControlFunctions {
  cancel(): void;
  flush(): void;
  isPending(): boolean;
}

export type DebouncedState<T extends (...args: never[]) => unknown> = ((
  ...args: Parameters<T>
) => ReturnType<T> | undefined) &
  ControlFunctions;

export function useDebounceCallback<T extends (...args: never[]) => unknown>(
  function_: T,
  delay = 500,
  options?: DebounceOptions
): DebouncedState<T> {
  const debouncedFunction = React.useRef<ReturnType<typeof debounce>>(null);

  useUnmount(() => {
    if (debouncedFunction.current) {
      debouncedFunction.current.cancel();
    }
  });

  const debounced = React.useMemo(() => {
    const debouncedFunctionInstance = debounce(function_, delay, options);

    const wrappedFunction: DebouncedState<T> = (...args: Parameters<T>) => {
      return debouncedFunctionInstance(...args);
    };

    wrappedFunction.cancel = () => {
      debouncedFunctionInstance.cancel();
    };

    wrappedFunction.isPending = () => {
      return !!debouncedFunction.current;
    };

    wrappedFunction.flush = () => {
      return debouncedFunctionInstance.flush();
    };

    return wrappedFunction;
  }, [function_, delay, options]);

  React.useEffect(() => {
    debouncedFunction.current = debounce(function_, delay, options);
  }, [function_, delay, options]);

  return debounced;
}
