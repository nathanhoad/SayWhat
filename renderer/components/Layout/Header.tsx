interface IHeaderProps {
  children?: any;
}

export default function Header({ children }: IHeaderProps) {
  return (
    <>
      <div className="Header">{children}</div>

      <style jsx>{`
        .Header {
          height: 2rem;
          flex-grow: 0;
          flex-shrink: 0;
          overflow: hidden;
          display: flex;
          background: var(--color-header-background);
          color: white;
        }

        .Header :global(button) {
          padding: 0 0.5rem;
          background: none;
          border: none;
          color: white;
          font-family: var(--font-family-sans-serif);
          font-size: 0.7rem;
          line-height: 2rem;
          cursor: pointer;
          white-space: nowrap;
        }
        .Header :global(button:hover) {
          background-color: rgba(255, 255, 255, 0.1);
        }

        .Header :global(button[data-icon]) {
          padding-left: 2rem;
          background-repeat: no-repeat;
          background-position: 0.5rem 48%;
          background-size: 1rem 1rem;
        }

        .Header :global(button[data-icon="menu"]) {
          background-image: url(./images/MenuButton.svg);
        }

        .Header :global(button[data-icon="add"]) {
          background-image: url(./images/AddButton.svg);
        }

        .Header :global(input) {
          background: var(--color-header-input-background);
          padding: 0 0.5rem;
          border: 0.6px solid var(--color-header-background);
          width: 20rem;
        }
        .Header :global(input:focus) {
          background: white;
        }
      `}</style>
    </>
  );
}
