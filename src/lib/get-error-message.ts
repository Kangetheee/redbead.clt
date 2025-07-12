import { AxiosError } from "axios";

interface ErrorWithMessage {
  message: string;
}

interface ResponseErrorWithMessage {
  response: { data: { message: string } };
}
interface ResponseWithDataErrorMessage {
  response: { data: { error: { message: string } } };
}

function isErrorWithMessage(error: unknown): error is ErrorWithMessage {
  return (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as Record<string, unknown>).message === "string"
  );
}

function isResponseWithErrorMessage(
  error: unknown
): error is ResponseErrorWithMessage {
  return (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as Record<string, Record<string, Record<string, unknown>>>)
      .response?.data?.message === "string"
  );
}

function isResponseWithDataErrorMessage(
  error: unknown
): error is ResponseWithDataErrorMessage {
  return (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (
      error as Record<
        string,
        Record<string, Record<string, Record<string, unknown>>>
      >
    ).response?.data?.error?.message === "string"
  );
}

function toErrorWithMessage(maybeError: unknown): string {
  if (maybeError instanceof AxiosError) {
    const error = maybeError.response?.data.message || maybeError.message;
    if (Array.isArray(error)) return error.join(" • ");
    return error;
  }
  if (isResponseWithDataErrorMessage(maybeError))
    return maybeError.response.data.error.message;
  if (isResponseWithErrorMessage(maybeError))
    return maybeError.response.data.message;
  if (isErrorWithMessage(maybeError)) return maybeError.message;

  try {
    return new Error(JSON.stringify(maybeError)).message;
  } catch {
    // fallback in case there's an error stringifying the maybeError
    // like with circular references for example.
    return new Error(String(maybeError)).message;
  }
}

export function getErrorMessage(error: unknown) {
  return toErrorWithMessage(error).replace(/\\"([^\\]+)\\"/g, "$1");
}

// interface RootObject {
//   message: string[];
//   error: string;
//   statusCode: number;
// }
