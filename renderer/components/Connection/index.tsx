import cn from "classnames";

import useNodes from "../../hooks/useNodes";
import { useState, useEffect } from "react";

interface Props {
  fromId: string;
  toId: string;
  direction?: "in" | "out";
  index?: number;
}

export default function Connection(props: Props) {
  const { byChildId } = useNodes();

  const [height, setHeight] = useState(0);
  const [end, setEnd] = useState(0);
  const [top, setTop] = useState(0);

  const index = typeof props.index === "undefined" ? 0 : props.index;

  useEffect(() => {
    const from = document.getElementById(props.fromId);
    const to = document.getElementById(props.toId);

    if (!from || !to) {
      setHeight(0);
      return;
    }

    const { offsetTop: fromY, offsetHeight: firstH } = from;
    const { offsetTop: secondY, offsetHeight: secondH } = to;

    // The true Y adds the parent element (responses or lines div) and the node element
    const fromParentTop = from.parentElement.offsetTop;
    const nodeTop = document.getElementById(byChildId[from.id]?.id)?.offsetTop;
    const firstY = fromParentTop + nodeTop + fromY;

    let y: number;
    let h: number;

    if (firstY < secondY) {
      // from is above to
      y = firstY + firstH * 0.5 - 2;
      h = secondY - y + secondH * 0.5 + 2;
      setEnd(h - 1.5);
    } else {
      // to is above from
      y = secondY + secondH * 0.5;
      h = firstY - y + firstH * 0.5;
      setEnd(1.5);
    }

    setTop(y);
    setHeight(h);
  }, [props]);

  if (height < 5) return null;

  return (
    <>
      <div
        className={cn("Connection", { In: props.direction === "in" })}
        style={{ top: `${top}px`, height: `${height}px`, width: `${30 + index * 15}px` }}>
        <div className="Line"></div>
        <div className="End" style={{ top: `${end}px` }}></div>
      </div>

      <style jsx>{`
        .Connection {
          position: absolute;
          left: 100%;
          width: 30px;
        }
        .Connection.In {
          /* Use transform to make sure that the indexed offset widths go to the left */
          transform-origin: 0 0;
          transform: scaleX(-1) translateX(var(--main-width));
        }

        .Line {
          border-top: 1px solid var(--color-node-name);
          border-right: 1px solid var(--color-node-name);
          border-bottom: 1px solid var(--color-node-name);
          border-top-right-radius: 0.3rem;
          border-bottom-right-radius: 0.3rem;
          width: 100%;
          height: 100%;
        }

        .Connection.In .Line {
          border-top: 1px solid var(--color-line);
          border-right: 1px solid var(--color-line);
          border-bottom: 1px solid var(--color-line);
        }

        .End {
          z-index: 100;
          position: absolute;
          width: 10px;
          height: 10px;
          background: var(--color-node-name);
          border-radius: 100px;
          transform: translate(-50%, -50%);
        }
      `}</style>
    </>
  );
}
