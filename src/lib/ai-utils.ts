const AI_TIMEOUT_MS = 30_000; // 30 seconds

export class AITimeoutError extends Error {
  constructor() {
    super(
      "The AI is taking too long to respond. Please try again."
    );
    this.name = "AITimeoutError";
  }
}

export class AIGenerationError extends Error {
  constructor(originalError: unknown) {
    const message =
      originalError instanceof Error && originalError.message.includes("rate")
        ? "Too many requests. Please wait a moment and try again."
        : "Something went wrong generating a response. Please try again.";
    super(message);
    this.name = "AIGenerationError";
  }
}

/**
 * Creates an AbortSignal that times out after the configured duration.
 * Pass this to generateObject's `abortSignal` option.
 */
export function aiAbortSignal(): AbortSignal {
  return AbortSignal.timeout(AI_TIMEOUT_MS);
}

/**
 * Wraps an AI generation call with timeout and error normalization.
 */
export async function withAIErrorHandling<T>(
  fn: (signal: AbortSignal) => Promise<T>
): Promise<T> {
  const signal = aiAbortSignal();
  try {
    return await fn(signal);
  } catch (error) {
    if (error instanceof DOMException && error.name === "TimeoutError") {
      throw new AITimeoutError();
    }
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new AITimeoutError();
    }
    throw new AIGenerationError(error);
  }
}
