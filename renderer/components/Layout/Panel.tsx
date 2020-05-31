interface IPanelProps {
  children?: any;
}

export default function Panel({ children }: IPanelProps) {
  return (
    <>
      <div className="Panel">{children}</div>

      <style jsx>{`
        .Panel {
          height: 100vh;
          display: flex;
          flex-direction: column;
        }
      `}</style>
    </>
  );
}
