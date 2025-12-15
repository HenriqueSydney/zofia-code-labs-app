import React, { forwardRef, ForwardRefRenderFunction } from "react";
import { FieldError } from "react-hook-form";


import { Textarea as ShadnTextarea } from "./ui/textarea";
import { ErrorMessage } from "./ErrorMessage";
import { cn } from "@/utils/twMerge";

interface TextareaTextProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: FieldError;
}

const TextareaBase: ForwardRefRenderFunction<
  HTMLTextAreaElement,
  TextareaTextProps
> = ({ label = "", error = null, ...rest }, ref) => {
  return (
    <div className="w-full flex flex-col gap-2">
      {label && (
        <div>
          <label>{label}</label>
        </div>
      )}

      <ShadnTextarea
        className={cn(
          "flex-1 px-4 py-2 rounded-md bg-background border border-border transition-all duration-300",
          "text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary",
          "focus:border-primary resize-none",
          error && "border-destructive shadow-glow"
        )}
        ref={ref}
        {...rest}
      ></ShadnTextarea>

      <ErrorMessage errorMessage={error?.message} />
    </div>
  );
};

export const Textarea = forwardRef(TextareaBase);
