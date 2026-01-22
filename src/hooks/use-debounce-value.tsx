"use client";

import type { DebouncedState } from "@/hooks/use-debounce-callback";
import { useDebounceCallback } from "@/hooks/use-debounce-callback";
import { useEffect, useMemo, useRef, useState } from "react";

interface UseDebounceValueOptions<T> {
  leading?: boolean;
  trailing?: boolean;
  maxWait?: number;
  equalityFn?(left: T, right: T): boolean;
}

/**
 * Custom hook that returns a debounced version of the provided value, along with a function to update it.
 * param initialValue The value to be debounced
 * param delay The delay in milliseconds before the value is updated (default is 500ms)
 * param options Optional configurations for the debouncing behavior
 * returns An array containing the debounced value and the function to update it
 * @param initialValue
 * @param delay
 * @param options
 */
export function useDebounceValue<T>(
  initialValue: T | (() => T),
  delay: number,
  options?: UseDebounceValueOptions<T>
): [T, DebouncedState<(value: T) => void>] {
  const memoEq = useMemo(
    () => options?.equalityFn ?? ((left: T, right: T) => left === right),
    [options?.equalityFn]
  );
  const unwrappedInitialValue = initialValue instanceof Function ? initialValue() : initialValue;
  const [debouncedValue, setDebouncedValue] = useState<T>(unwrappedInitialValue);
  const previousValueRef = useRef<T | undefined>(unwrappedInitialValue);

  const updateDebouncedValue = useDebounceCallback(setDebouncedValue, delay, options);

  // Update the debounced value if the initial value changes — perform this
  // after render to avoid reading/modifying refs during render.
  useEffect(() => {
    if (!memoEq(previousValueRef.current as T, unwrappedInitialValue)) {
      updateDebouncedValue(unwrappedInitialValue);
      previousValueRef.current = unwrappedInitialValue;
    }
  }, [unwrappedInitialValue, memoEq, updateDebouncedValue]);

  return [debouncedValue, updateDebouncedValue];
}
