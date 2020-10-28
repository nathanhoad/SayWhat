import { useState, useEffect, MouseEvent } from "react";
import cn from "classnames";

import { linesToText, textToLines, responsesToText, textToResponses } from "../../lib/nodeParser";
import useApplication from "../../hooks/useApplication";
import TextArea from "../TextArea";
import Button from "../Button";
import Lines from "./Lines";
import Responses from "./Responses";

import { copyToClipboard } from "../../lib/util";

import { INode } from "../../../types";

interface Props {
  node: INode;
  onClick?: () => void;
}

export default function Node({ node, onClick }: Props) {
  const { selectedSequence, selectNode, selectedNode, updateNode, removeNode } = useApplication();

  const [isEditing, setIsEditing] = useState(node.updatedAt === null);

  const [justCopied, setJustCopied] = useState(false);

  const [name, setName] = useState(node.name);
  const [linesText, setLinesText] = useState(linesToText(node.lines));
  const [responsesText, setResponsesText] = useState(responsesToText(node.responses, selectedSequence?.nodes));

  const [error, setError] = useState(null);

  // Keep our editing in sync
  useEffect(() => {
    setError(null);
    setName(node.name);
    setLinesText(linesToText(node.lines));
    setResponsesText(responsesToText(node.responses, selectedSequence?.nodes));
  }, [node.name, node.lines, node.responses]);

  function onNodeClick() {
    if (!isEditing && typeof onClick === "function") onClick();
  }

  function onSave() {
    try {
      setError(null);

      const lines = textToLines(linesText, selectedSequence?.nodes);
      const responses = textToResponses(responsesText, selectedSequence?.nodes);

      updateNode({
        ...node,
        name,
        lines,
        responses
      });

      setIsEditing(false);
      selectNode(node);
    } catch (err) {
      setError(err);
    }
  }

  function onCancel() {
    if (!node.updatedAt) {
      removeNode(node, false);
    } else {
      setIsEditing(false);
      selectNode(node);
    }
  }

  function onDelete(event: MouseEvent) {
    event.stopPropagation();
    removeNode(node);
  }

  function copyNodeId() {
    copyToClipboard(node.id);
    setJustCopied(true);
    setTimeout(() => setJustCopied(false), 1500);
  }

  return (
    <>
      <div className="Wrapper" data-node-id={node.id} onDoubleClick={() => setIsEditing(true)}>
        <div
          id={node.id}
          className={cn("Node", { Active: selectedNode?.id === node.id })}
          onClick={() => onNodeClick()}
          data-testid="node">
          <header>
            {!isEditing && (
              <>
                <h2 data-testid="title">{name}</h2>{" "}
                <span
                  title="Copy to clipboard"
                  role="button"
                  onClick={() => copyNodeId()}
                  data-copied="Copied!"
                  className={justCopied ? "just-copied" : null}
                  data-testid="copy-to-clipboard-button">
                  {node.id}
                </span>
              </>
            )}
            {isEditing && (
              <input
                autoFocus
                className="Name"
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                data-testid="name-input"
              />
            )}
          </header>

          <section className="Lines">
            {!isEditing && <Lines lines={node.lines} />}
            {isEditing && (
              <>
                <TextArea
                  value={linesText}
                  onChange={text => setLinesText(text)}
                  placeholder="Enter some dialogue..."
                  data-testid="lines-input"
                />
                {error && error.type === "lines" && (
                  <div className="Error" style={{ top: `${error.line - 1}rem` }} data-testid="lines-error">
                    <span>{error.message}</span>
                  </div>
                )}
              </>
            )}
          </section>

          <hr />

          <section className="Responses">
            {isEditing && (
              <>
                <TextArea
                  value={responsesText}
                  onChange={text => setResponsesText(text)}
                  placeholder="Enter some responses..."
                  data-testid="responses-input"
                />
                {error && error.type === "responses" && (
                  <div className="Error" style={{ top: `${error.line - 1}rem` }} data-testid="responses-error">
                    <span>{error.message}</span>
                  </div>
                )}
              </>
            )}
            {!isEditing && <Responses responses={node.responses} />}
          </section>

          {isEditing && (
            <section className="Actions">
              <Button appearance="Save" onClick={() => onSave()} data-testid="save-button">
                Save changes
              </Button>

              <Button appearance="Cancel" onClick={() => onCancel()} data-testid="cancel-button">
                Disregard any changes
              </Button>
            </section>
          )}

          {!isEditing && (
            <div className="Tools">
              <button onClick={() => setIsEditing(true)} data-testid="edit-button">
                Edit
              </button>
              <button onClick={e => onDelete(e)} data-testid="delete-button">
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .Wrapper {
          padding-top: 3rem;
        }

        .Node {
          position: relative;
          font-size: 1rem;

          background: white;
          border: 1px solid var(--color-line);
          border-radius: 0.1rem;
          padding: 1rem 2rem 1rem 2rem;
          transition: box-shadow 0.2s ease;
          user-select: none;
        }

        .Active {
          box-shadow: 0 2px 4px var(--color-shadow);
          border-color: var(--color-line-dark);
        }

        header {
          margin: 0 0 40px 0;
        }

        header input {
          font-size: 1.1rem;
          color: var(--color-node-name);
          font-weight: bold;
        }

        header h2 {
          font-size: 1.1rem;
          color: var(--color-node-name);
          font-weight: bold;
          display: inline-block;
        }

        header span {
          font-size: 11px;
          color: var(--color-line-dark);
          display: block;
          line-height: 10px;
          cursor: pointer;
        }
        header span:hover {
          color: black;
        }
        header span.just-copied:after {
          content: attr(data-copied);
          color: var(--color-save-button-background);
          font-weight: bold;
          margin-left: 4px;
        }

        .Wrapper :global(input),
        .Wrapper :global(textarea) {
          font-family: "Courier New", Courier, monospace;
          font-size: 0.7rem;
          font-weight: bold;
          line-height: 1rem;
          width: 100%;
          border: none;
          resize: none;
        }

        hr {
          border: none;
          height: 0;
          margin: 1rem -2rem 0 -2rem;
          padding: 1rem 2rem 0 2rem;
          border-top: 1px solid var(--color-line);
        }

        .Lines,
        .Responses {
          font-family: var(--font-family-sans-serif);
          font-size: 0.7rem;
          line-height: 1.1rem;
          position: relative;
        }

        .Error {
          position: absolute;
          top: 0;
          left: 0;
          transform: translateX(-105%);
          line-height: 1rem;
          font-size: 10px;
          font-weight: bold;
          color: white;
          background: rgb(107, 6, 6);
          padding: 0 0.4rem;
          border-radius: 0.1rem;

          animation-name: highlightError;
          animation-duration: 1s;
          animation-iteration-count: infinite;
        }
        .Error span {
          position: relative;
          z-index: 10;
        }
        .Error:before {
          content: "";
          width: 0.6rem;
          height: 0.6rem;
          transform-origin: 50% 50%;
          transform: translateY(-50%) rotate(45deg);
          background: rgb(107, 6, 6);
          position: absolute;
          right: -0.1rem;
          top: 50%;
          z-index: 9;
        }

        @keyframes highlightError {
          0%,
          100% {
            transform: translateX(-105%);
          }
          50% {
            transform: translateX(-110%);
          }
        }

        .Actions {
          margin: 1rem -2rem -0.5rem -2rem;
          padding: 1rem 2rem 1rem 2rem;
          font-size: 0.8rem;
          user-select: none;
        }
        .Actions button {
          margin-right: 3px;
        }

        .Actions span {
          display: inline-block;
          margin-left: 3px;
        }
        .Actions span[role="button"] {
          text-decoration: underline;
          cursor: pointer;
          font-weight: bold;
          color: black;
        }

        .Tools {
          position: absolute;
          top: 1rem;
          right: 1rem;
          line-height: 1rem;
        }
        .Tools button {
          background: none;
          border: none;
          line-height: 1.4rem;
          font-size: 0.7rem;
          padding: 0 0.7rem;
          font-family: var(--font-family-sans-serif);
          cursor: pointer;
        }
        .Tools button:hover {
          background-color: var(--color-line-light);
        }
      `}</style>
    </>
  );
}
