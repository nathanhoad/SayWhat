import LinkToNode from "../LinkToNode";

import { INodeOption } from "../../../types";

interface Props {
  options?: INodeOption[];
}

export default function Options({ options }: Props) {
  return (
    <>
      {(options || []).map(option => {
        return (
          <div key={option.id} id={option.id} className="Option">
            {option.condition && (
              <span className="Condition" data-testid="condition">
                if {option.condition}
              </span>
            )}
            {option.prompt && (
              <span className="Prompt" data-testid="prompt">
                {option.prompt}
              </span>
            )}
            <LinkToNode fromOption={option} />
          </div>
        );
      })}

      <style jsx>{`
        .Option {
          margin-bottom: 0.1rem;
          display: flex;
          margin-bottom: 0.4rem;
        }

        .Prompt {
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
      `}</style>
    </>
  );
}
