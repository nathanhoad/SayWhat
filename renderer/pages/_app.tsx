import { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <style global jsx>{`
        * {
          box-sizing: border-box;
          outline: none;
        }

        html,
        body {
          margin: 0;
          padding: 0;
          background: var(--color-background);
          font-family: var(--font-family-sans-serif);
          font-size: 1.1em;
        }

        button,
        *[role="button"] {
          user-select: none;
        }

        :root {
          --font-family-code: "Courier New", Courier, monospace;
          --font-family-sans-serif: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu",
            "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", Arial, sans-serif;

          --color-background: #f9f9f9;
          --color-shadow: rgba(83, 90, 107, 0.2);

          --color-header-background: #333;
          --color-header-input-background: #ccc;

          --color-list-selected-background: #0b3e77;
          --color-list-selected-foreground: #fff;
          --color-list-hover-background: #eee;

          --color-line-light: #eee;
          --color-line: #ccc;
          --color-line-dark: #777;

          --color-node-name: #19508e;

          --color-button-background: #ddd;
          --color-button-text: #111;

          --color-save-button-background: #1c7f29;
          --color-save-button-text: #fff;

          --primary-colour: rgb(13, 75, 105);
          --primary-darker-colour: black;

          --color-condition-background: rgb(177, 54, 5);
          --color-condition-text: white;

          --color-mutation-background: #175131;
          --color-mutation-text: white;

          --main-width: 880px;
        }
      `}</style>
      <Component {...pageProps} />
    </>
  );
}
