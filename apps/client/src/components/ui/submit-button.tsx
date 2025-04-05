import { useFormContext } from "react-hook-form";
import { Button, ButtonProps } from "./button";

export function SubmitButton(props: ButtonProps) {
  const {
    formState: { isDirty, isValid, isSubmitting, errors },
  } = useFormContext();
  return (
    <Button
      disabled={!isDirty || !isValid || props.disabled}
      type="submit"
      {...props}
      isLoading={props.isLoading || isSubmitting}
    />
  );
}
