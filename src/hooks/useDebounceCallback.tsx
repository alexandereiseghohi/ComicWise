"use client";

import { useEffect, useMemo, useRef } from "react";

export interface DebouncedState<T extends (...args: any[]) => any> {
  (...args: Parameters<T>): ReturnType<T> | undefined;
  cancel(): void;
  flush(): ReturnType<T> | undefined;
  pending(): boolean;
}

interface DebounceOptions {
  leading?: boolean;
  trailing?: boolean;
  maxWait?: number;
}

export function useDebounceCallback<T extends (...args: any[]) => any>(
  func: T,
  delay: number,
  options: DebounceOptions = {}
): DebouncedState<T> {
  const { leading = false, trailing = true, maxWait } = options;
  const funcRef = useRef(func);
  const lastCallTime = useRef<number>(0);
  const lastInvokeTime = useRef<number>(0);
  const timerId = useRef<NodeJS.Timeout | undefined>(undefined);
  const lastArgs = useRef<Parameters<T> | undefined>(undefined);
  const lastThis = useRef<any>(undefined);
  const result = useRef<ReturnType<T> | undefined>(undefined);

  funcRef.current = func;

  const invokeFunc = (time: number) => {
    const args = lastArgs.current!;
    const thisArg = lastThis.current;

    lastArgs.current = undefined;
    lastThis.current = undefined;
    lastInvokeTime.current = time;
    result.current = funcRef.current.apply(thisArg, args);
    return result.current;
  };

  const leadingEdge = (time: number) => {
    lastInvokeTime.current = time;
    timerId.current = setTimeout(timerExpired, delay);
    return leading ? invokeFunc(time) : result.current;
  };

  const remainingWait = (time: number) => {
    const timeSinceLastCall = time - lastCallTime.current;
    const timeSinceLastInvoke = time - lastInvokeTime.current;
    const timeWaiting = delay - timeSinceLastCall;

    return maxWait !== undefined
      ? Math.min(timeWaiting, maxWait - timeSinceLastInvoke)
      : timeWaiting;
  };

  const shouldInvoke = (time: number) => {
    const timeSinceLastCall = time - lastCallTime.current;
    const timeSinceLastInvoke = time - lastInvokeTime.current;

    return (
      lastCallTime.current === 0 ||
      timeSinceLastCall >= delay ||
      timeSinceLastCall < 0 ||
      (maxWait !== undefined && timeSinceLastInvoke >= maxWait)
    );
  };

  const timerExpired = (): ReturnType<T> | undefined => {
    const time = Date.now();
    if (shouldInvoke(time)) {
      return trailingEdge(time);
    }
    timerId.current = setTimeout(timerExpired, remainingWait(time));
    return undefined;
  };

  const trailingEdge = (time: number) => {
    timerId.current = undefined;

    if (trailing && lastArgs.current) {
      return invokeFunc(time);
    }
    lastArgs.current = undefined;
    lastThis.current = undefined;
    return result.current;
  };

  const cancel = () => {
    if (timerId.current !== undefined) {
      clearTimeout(timerId.current);
    }
    lastInvokeTime.current = 0;
    lastArgs.current = undefined;
    lastCallTime.current = 0;
    lastThis.current = undefined;
    timerId.current = undefined;
  };

  const flush = () => {
    return timerId.current === undefined ? result.current : trailingEdge(Date.now());
  };

  const pending = () => {
    return timerId.current !== undefined;
  };

  const debounced = function (this: any, ...args: Parameters<T>): ReturnType<T> | undefined {
    const time = Date.now();
    const isInvoking = shouldInvoke(time);

    lastArgs.current = args;
    lastThis.current = this;
    lastCallTime.current = time;

    if (isInvoking) {
      if (timerId.current === undefined) {
        return leadingEdge(lastCallTime.current);
      }
      if (maxWait) {
        timerId.current = setTimeout(timerExpired, delay);
        return invokeFunc(lastCallTime.current);
      }
    }
    if (timerId.current === undefined) {
      timerId.current = setTimeout(timerExpired, delay);
    }
    return result.current;
  } as DebouncedState<T>;

  debounced.cancel = cancel;
  debounced.flush = flush;
  debounced.pending = pending;

  useEffect(() => {
    return () => {
      cancel();
    };
  }, []);

  return useMemo(() => debounced, [delay, leading, trailing, maxWait]);
}

export default useDebounceCallback;
