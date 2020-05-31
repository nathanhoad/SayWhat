interface ISectionProps {
  className?: string;
  children?: any;
}

export default function Section({ children }: ISectionProps) {
  return (
    <>
      <div className="Section">{children}</div>

      <style jsx>{`
        .Section {
          height: 100%;
          overflow: hidden;
          overflow-y: scroll;
        }
      `}</style>
    </>
  );
}
