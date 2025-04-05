import { useFormContext } from "react-hook-form";

import { WithRequired } from "@/types/utils";
import { forwardRef } from "react";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./form";
import { Input, InputProps } from "./input";
export type FormInputProps = WithRequired<InputProps, "name"> & {
  label: string;
  description?: string;
  shouldShowError?: boolean;
};
export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ name, description, label, shouldShowError = true, ...props }, ref) => {
    const context = useFormContext();
    return (
      <FormField
        control={context.control}
        name={name}
        render={({ field: { ref: fieldRef, ...rest } }) => (
          <FormItem>
            {label && (
              <FormLabel
                shouldShowError={shouldShowError}
                required={props.required}
              >
                {label}
              </FormLabel>
            )}
            <FormControl shouldShowError={shouldShowError}>
              <Input
                {...rest}
                ref={(e) => {
                  fieldRef(e);
                  if (ref) {
                    if ("current" in ref) {
                      ref.current = e;
                    } else {
                      ref(e);
                    }
                  }
                }}
                {...props}
                onChange={(e) => {
                  rest.onChange(e);
                  props.onChange?.(e);
                }}
              />
            </FormControl>
            {description && <FormDescription>{description}</FormDescription>}
            {shouldShowError && <FormMessage />}
          </FormItem>
        )}
      />
    );
  }
);
