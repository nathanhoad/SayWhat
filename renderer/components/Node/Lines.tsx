import { INodeLine } from "../../../types";

interface Props {
  lines: INodeLine[];
}

export default function Lines({ lines }: Props) {
  return (
    <>
      {(lines || []).map(line => {
        if (line.dialogue === "") return <div key={line.id} className="BlankLine" data-testid="blank" />;

        return (
          <div key={line.id} className="Line">
            {line.condition && (
              <span className="Condition" data-testid="condition">
                if {line.condition}
              </span>
            )}
            {line.character && (
              <span className="Character" data-testid="character">
                {line.character}:
              </span>
            )}
            {line.dialogue && (
              <span className="Dialogue" data-testid="dialogue">
                {line.dialogue}
              </span>
            )}
            {line.mutation && (
              <span className="Mutation" data-testid="mutation">
                do {line.mutation}
              </span>
            )}
          </div>
        );
      })}

      <style jsx>{`
        .Line {
          margin-bottom: 0.2rem;
          display: flex;
        }

        .BlankLine {
          margin-bottom: 1rem;
        }

        .Condition {
          flex-shrink: 0;
          display: inline-block;
          border-radius: 3px;
          background: var(--color-condition-background);
          color: var(--color-condition-text);
          padding: 0 0.25rem;
          margin-right: 0.3rem;
        }

        .Character {
          flex-shrink: 0;
          display: inline-block;
          margin-right: 0.2rem;
          font-weight: bold;
        }

        .Dialogue {
          flex-grow: 1;
        }

        .Mutation {
          flex-shrink: 0;
          display: inline-block;
          border-radius: 3px;
          background: var(--color-mutation-background);
          color: var(--color-mutation-text);
          padding: 0 0.25rem;
        }
      `}</style>
    </>
  );
}
