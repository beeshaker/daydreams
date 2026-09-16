export class TimeoutError extends Error {
  constructor(message = "Request timed out") {
    super(message);
    this.name = "TimeoutError";
  }
}

/**
 * `fetch` with an upper bound on how long it may hang. If the caller
 * already passes its own `init.signal`, both signals are honored — an
 * abort from either one aborts the request, and only our own timeout
 * firing is reported as a `TimeoutError` (an abort from the caller's own
 * signal surfaces as the normal `AbortError`/whatever `fetch` throws for
 * it).
 */
export async function fetchWithTimeout(
  input: string | URL,
  init: RequestInit = {},
  timeoutMs = 9000,
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  const callerSignal = init.signal;
  const onCallerAbort = () => controller.abort();
  if (callerSignal) {
    if (callerSignal.aborted) controller.abort();
    else callerSignal.addEventListener("abort", onCallerAbort);
  }

  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } catch (error) {
    const callerAborted = callerSignal?.aborted ?? false;
    if (controller.signal.aborted && !callerAborted) {
      throw new TimeoutError();
    }
    throw error;
  } finally {
    clearTimeout(timeout);
    if (callerSignal) callerSignal.removeEventListener("abort", onCallerAbort);
  }
}
