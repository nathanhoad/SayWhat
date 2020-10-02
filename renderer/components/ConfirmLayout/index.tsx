import { useEffect } from "react";
import Head from "next/head";

import useApplication from "../../hooks/useApplication";
import Button from "../Button";

export default function ConfirmLayout() {
  const {
    userInterface: { confirmDialog },
    respondToConfirmDialog
  } = useApplication();

  function respond(button: string) {
    respondToConfirmDialog(button);
    window.close();
  }

  useEffect(() => {
    function onKeyUp(event: KeyboardEvent) {
      // Cancel on ESC
      if (event.code === "Escape") {
        respond(confirmDialog.buttons[confirmDialog.buttons.length - 1]);
      }
      // Confirm on Enter
      else if (event.code === "Enter") {
        respond(confirmDialog.buttons[0]);
      }
    }
    window.addEventListener("keyup", onKeyUp);

    return () => {
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  if (!confirmDialog) return null;

  return (
    <>
      <Head>
        <title>Confirm</title>
      </Head>

      <div className="Layout">
        <div data-testid="message">{confirmDialog.message}</div>
        <div className="Spacer" />
        <div className="Actions">
          {confirmDialog.buttons.map((button, index) => (
            <Button
              key={button}
              appearance={index === 0 ? "Save" : "Cancel"}
              onClick={() => respond(button)}
              data-testid={`${button}-button`}>
              {button}
            </Button>
          ))}
        </div>
      </div>

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
