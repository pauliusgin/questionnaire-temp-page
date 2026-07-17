import { ReactNode } from "react";

const inputClasses =
  "w-full rounded-sm border border-line bg-surface px-3 py-2 text-[15px] text-foreground outline-none transition-colors placeholder:text-muted/50 focus:border-accent";

type QuestionProps = {
  index: number;
  title: string;
  hint?: string;
  children: ReactNode;
};

export function Question({ index, title, hint, children }: QuestionProps) {
  return (
    <section className="border-t border-line pt-8">
      <div className="flex gap-4">
        <span className="mt-1 font-serif text-sm text-muted tabular-nums">
          {String(index).padStart(2, "0")}
        </span>
        <div className="flex-1 space-y-4">
          <div className="space-y-1.5">
            <h2 className="font-serif text-xl leading-snug text-foreground">
              {title}
            </h2>
            {hint ? <p className="text-sm text-muted">{hint}</p> : null}
          </div>
          {children}
        </div>
      </div>
    </section>
  );
}

const MAX_TEXT_LENGTH = 3000;

type TextAreaFieldProps = {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  maxLength?: number;
};

export function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
  rows = 4,
  maxLength = MAX_TEXT_LENGTH,
}: TextAreaFieldProps) {
  const nearLimit = value.length > maxLength - 200;
  return (
    <label className="block space-y-1.5">
      {label ? (
        <span className="text-xs uppercase tracking-wider text-muted">
          {label}
        </span>
      ) : null}
      <textarea
        className={`${inputClasses} resize-y leading-relaxed`}
        value={value}
        rows={rows}
        maxLength={maxLength}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
      {nearLimit ? (
        <span className="block text-right text-xs text-muted tabular-nums">
          {value.length} / {maxLength}
        </span>
      ) : null}
    </label>
  );
}

type TextFieldProps = {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: "text" | "email";
};

export function TextField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: TextFieldProps) {
  return (
    <label className="block space-y-1.5">
      {label ? (
        <span className="text-xs uppercase tracking-wider text-muted">
          {label}
        </span>
      ) : null}
      <input
        className={inputClasses}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

type NumberFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  min?: number;
  placeholder?: string;
};

export function NumberField({
  label,
  value,
  onChange,
  min = 0,
  placeholder,
}: NumberFieldProps) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs uppercase tracking-wider text-muted">
        {label}
      </span>
      <input
        className={inputClasses}
        type="number"
        inputMode="numeric"
        min={min}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

type ChoiceProps = {
  label?: string;
  options: readonly string[];
  value: string;
  onChange: (value: string) => void;
};

export function SingleChoice({ label, options, value, onChange }: ChoiceProps) {
  return (
    <div className="space-y-2">
      {label ? (
        <span className="block text-xs uppercase tracking-wider text-muted">
          {label}
        </span>
      ) : null}
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const selected = value === option;
          return (
            <button
              key={option}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(selected ? "" : option)}
              className={`rounded-full border px-3.5 py-1.5 text-sm transition-colors ${
                selected
                  ? "border-accent bg-accent-soft text-accent"
                  : "border-line bg-surface text-muted hover:border-accent/40"
              }`}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}

type MultiChoiceProps = {
  label?: string;
  options: readonly string[];
  values: string[];
  onChange: (values: string[]) => void;
};

export function MultiChoice({
  label,
  options,
  values,
  onChange,
}: MultiChoiceProps) {
  const toggle = (option: string) => {
    if (values.includes(option)) {
      onChange(values.filter((item) => item !== option));
      return;
    }
    onChange([...values, option]);
  };

  return (
    <div className="space-y-2">
      {label ? (
        <span className="block text-xs uppercase tracking-wider text-muted">
          {label}{" "}
          <span className="normal-case">— pažymėkite visus tinkamus</span>
        </span>
      ) : null}
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const selected = values.includes(option);
          return (
            <button
              key={option}
              type="button"
              aria-pressed={selected}
              onClick={() => toggle(option)}
              className={`rounded-full border px-3.5 py-1.5 text-sm transition-colors ${
                selected
                  ? "border-accent bg-accent-soft text-accent"
                  : "border-line bg-surface text-muted hover:border-accent/40"
              }`}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}
