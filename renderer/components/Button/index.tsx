import { MouseEvent } from "react";
import cn from "classnames";

interface Props {
  type?: "button" | "submit" | "reset";
  appearance?: "Save" | "Cancel";
  disabled?: boolean;
  title?: string;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  children?: any;
}

export default function Button({ type, appearance = "Save", disabled, title, ...props }: Props) {
  function onClick(event: MouseEvent<HTMLButtonElement>) {
    if (!props.onClick) return;

    event.stopPropagation();
    event.preventDefault();

    props.onClick(event);
  }

  return (
    <>
      <button
        className={cn("Button", appearance)}
        type={type ?? "button"}
        onClick={onClick}
        disabled={disabled}
        title={title}>
        {props.children}
      </button>

      <style jsx>{`
        .Button {
          border: none;
          border-radius: 0.1rem;
          font-family: var(--font-family-sans-serif);
          font-size: 0.8rem;
          line-height: 0.8rem;
          height: 2rem;
          padding: 0 1rem;
          cursor: pointer;
          white-space: nowrap;
          user-select: none;
        }
        .Button:disabled {
          filter: grayscale(0.8);
          opacity: 0.8;
          cursor: not-allowed;
        }

        .Save {
          background: var(--color-save-button-background);
          color: var(--color-save-button-text);
        }

        .Cancel {
          background: none;
          color: #111;
          text-decoration: underline;
          font-weight: bold;
        }
      `}</style>
    </>
  );
}
