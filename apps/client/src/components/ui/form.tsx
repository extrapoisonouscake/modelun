import * as LabelPrimitive from "@radix-ui/react-label";
import { Slot } from "@radix-ui/react-slot";
import * as React from "react";
import {
  Controller,
  ControllerProps,
  FieldPath,
  FieldValues,
  FormProvider,
  FormProviderProps,
  SubmitHandler,
  useFormContext,
  useFormState,
} from "react-hook-form";

import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

function Form<T extends FieldValues>({
  onSubmit,
  children,
  className,
  ...props
}: Pick<React.FormHTMLAttributes<HTMLFormElement>, "className"> & {
  onSubmit: SubmitHandler<T>; //!
} & FormProviderProps<T>) {
  return (
    <FormProvider {...props}>
      <form
        onSubmit={props.handleSubmit(onSubmit)}
        className={cn("flex flex-col gap-3", className)}
      >
        {children}
      </form>
    </FormProvider>
  );
}

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  name: TName;
};

const FormFieldContext = React.createContext<FormFieldContextValue>(
  {} as FormFieldContextValue
);

const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  ...props
}: ControllerProps<TFieldValues, TName>) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
};

const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext);
  const itemContext = React.useContext(FormItemContext);
  const { getFieldState } = useFormContext();
  const formState = useFormState({ name: fieldContext.name });
  const fieldState = getFieldState(fieldContext.name, formState);

  if (!fieldContext) {
    throw new Error("useFormField should be used within <FormField>");
  }

  const { id } = itemContext;

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  };
};

type FormItemContextValue = {
  id: string;
};

const FormItemContext = React.createContext<FormItemContextValue>(
  {} as FormItemContextValue
);

function FormItem({ className, ...props }: React.ComponentProps<"div">) {
  const id = React.useId();

  return (
    <FormItemContext.Provider value={{ id }}>
      <div
        data-slot="form-item"
        className={cn("grid gap-2", className)}
        {...props}
      />
    </FormItemContext.Provider>
  );
}
type FormLabelProps = React.ComponentPropsWithoutRef<
  typeof LabelPrimitive.Root
> & { required?: boolean; shouldShowError?: boolean };
function FormLabel({
  className,
  children,
  required,
  shouldShowError = true,
  ...props
}: FormLabelProps) {
  const { error, formItemId } = useFormField();

  const isShowingError = shouldShowError && !!error;
  return (
    <Label
      data-slot="form-label"
      data-error={isShowingError}
      className={cn("data-[error=true]:text-destructive-foreground", className)}
      htmlFor={formItemId}
      {...props}
    >
      {children}
      {required && <span className="text-destructive"> *</span>}
    </Label>
  );
}
type FormControlProps = React.ComponentPropsWithoutRef<typeof Slot> & {
  shouldShowError?: boolean;
};
function FormControl({ shouldShowError = true, ...props }: FormControlProps) {
  const { error, formItemId, name, formDescriptionId, formMessageId } =
    useFormField();

  const isShowingError = shouldShowError && !!error;
  return (
    <Slot
      data-slot="form-control"
      id={formItemId}
      aria-describedby={
        !isShowingError
          ? `${formDescriptionId}`
          : `${formDescriptionId} ${formMessageId}`
      }
      aria-invalid={isShowingError}
      {...props}
    />
  );
}

function FormDescription({ className, ...props }: React.ComponentProps<"p">) {
  const { formDescriptionId } = useFormField();

  return (
    <p
      data-slot="form-description"
      id={formDescriptionId}
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

function FormMessage({ className, ...props }: React.ComponentProps<"p">) {
  const { error, formMessageId } = useFormField();
  const body = error ? String(error?.message ?? "") : props.children;

  if (!body) {
    return null;
  }

  return (
    <p
      data-slot="form-message"
      id={formMessageId}
      className={cn("text-destructive-foreground text-sm", className)}
      {...props}
    >
      {body}
    </p>
  );
}

export {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useFormField,
};
