import { useState, FormEvent, useEffect } from "react";
import Head from "next/head";

import useApplication from "../../hooks/useApplication";
import Button from "../Button";

export default function EditSequenceLayout() {
  const { selectedSequence, updateSequence } = useApplication();
  const [name, setName] = useState(selectedSequence?.name);

  useEffect(() => {
    function onKeyUp(event: KeyboardEvent) {
      if (event.code === "Escape") {
        window.close();
      }
    }
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  useEffect(() => {
    setName(selectedSequence?.name);
  }, [selectedSequence?.name]);

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    updateSequence({ ...selectedSequence, name });
    window.close();
  }

  return (
    <>
      <Head>
        <title>Edit Sequence</title>
      </Head>

      <form className="Layout" onSubmit={onSubmit}>
        <div>
          <label>Name</label>
          <input autoFocus value={name} onChange={e => setName(e.target.value)} data-testid="name-input" />
        </div>
        <div className="Spacer" />
        <div className="Actions">
          <Button type="submit" appearance="Save" data-testid="save-button">
            Save changes
          </Button>
          <Button appearance="Cancel" onClick={() => window.close()} data-testid="cancel-button">
            Cancel
          </Button>
        </div>
      </form>

      <style jsx>{`
        .Layout {
          padding: 0.5rem;
          display: flex;
          height: 100vh;
          flex-direction: column;

          font-family: var(--font-family-sans-serif);
          font-size: 0.7rem;
        }

        .Layout > div {
          padding: 0.2rem 0;
        }

        .Layout label {
          font-weight: bold;
          display: block;
          margin-bottom: 0.2rem;
        }

        .Layout input {
          width: 100%;
          border: 1px solid var(--color-line-dark);
          padding: 0.5rem;
          font-size: 0.7rem;
        }

        .Spacer {
          flex-grow: 1;
          flex-shrink: 1;
          height: 100%;
          min-height: 1rem;
        }

        .Actions {
          flex-grow: 0;
        }
      `}</style>
    </>
  );
}
