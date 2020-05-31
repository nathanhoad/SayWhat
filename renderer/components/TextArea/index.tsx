import { useEffect, useRef } from "react";

interface TextAreaProps {
  value: string;
  placeholder?: string;
  onChange: (text: string) => void;
}

export default function TextArea({ value, ...props }: TextAreaProps) {
  const base = useRef(null);

  useEffect(() => {
    base.current.style.height = "auto";
    base.current.style.height = base.current.scrollHeight + 4 + "px";
  }, [value]);

  return (
    <textarea
      ref={base}
      value={value}
      placeholder={props.placeholder}
      onChange={e => props.onChange(e.target.value)}
      autoCorrect="off"
      spellCheck="false"
    />
  );
}
