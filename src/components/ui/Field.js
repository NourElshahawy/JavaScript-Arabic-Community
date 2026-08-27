import { forwardRef } from "react";

export function Field({ label, htmlFor, hint, error, children }) {
  return (
    <div className="field">
      {label ? (
        <label className="field__label" htmlFor={htmlFor}>
          {label}
        </label>
      ) : null}
      {children}
      {error ? <span className="field__error">{error}</span> : hint ? <span className="field__hint">{hint}</span> : null}
    </div>
  );
}

export const Input = forwardRef(function Input({ error, className = "", ...props }, ref) {
  return <input ref={ref} className={`input ${error ? "input--error" : ""} ${className}`.trim()} {...props} />;
});

export const Textarea = forwardRef(function Textarea({ error, className = "", ...props }, ref) {
  return <textarea ref={ref} className={`textarea ${error ? "textarea--error" : ""} ${className}`.trim()} {...props} />;
});
