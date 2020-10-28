import LinkToNode from "../LinkToNode";

import { INodeResponse } from "../../../types";

interface Props {
  responses?: Array<INodeResponse>;
}

export default function Responses({ responses }: Props) {
  return (
    <>
      {(responses || []).map(response => {
        return (
          <div key={response.id} id={response.id} className="Response">
            {response.condition && (
              <span className="Condition" data-testid="condition">
                if {response.condition}
              </span>
            )}
            {response.prompt && (
              <span className="Prompt" data-testid="prompt">
                {response.prompt}
              </span>
            )}
            <LinkToNode from={response} />
          </div>
        );
      })}

      <style jsx>{`
        .Response {
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
