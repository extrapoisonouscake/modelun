import { useState } from "react";

export function useFormErrorMessage() {
  const [errorMessage, setErrorMessage] = useState<string | null | undefined>(
    null
  );
  const node = errorMessage ? (
    <p className="text-destructive">{errorMessage}</p>
  ) : null;
  return {
    errorMessage,
    setErrorMessage,
    errorMessageNode: node,
  };
}
