import cn from "classnames";

interface ISpacerProps {
  expand?: boolean;
  children?: any;
}

export default function Spacer({ children, expand = false }: ISpacerProps) {
  return (
    <>
      <div className={cn("Spacer", { Expand: expand })}>{children}</div>

      <style jsx>{`
        .Spacer {
          min-width: 2rem;
        }
        .Spacer.Expand {
          flex-grow: 1;
          width: 100%;
        }
      `}</style>
    </>
  );
}
