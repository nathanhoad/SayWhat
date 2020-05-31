import { useEffect } from "react";
import cn from "classnames";

interface IDrawerProps {
  isOpen: boolean;
  side?: "Left" | "Right";
  onClose: () => void;
  children: any;
}

export default function Drawer({ isOpen, onClose, children, side = "Right" }: IDrawerProps) {
  // Stop the body scrolling when we are open
  useEffect(() => {
    if (isOpen) {
      document.body.style.setProperty("overflow", "hidden");
    } else {
      document.body.style.removeProperty("overflow");
    }
    return () => {
      document.body.style.removeProperty("overflow");
    };
  }, [isOpen]);

  return (
    <>
      <div className={cn(side, { Open: isOpen })}>
        {isOpen && <div className="Overlay" onClick={() => onClose()} data-testid="overlay" />}
        <div className="Drawer">{children}</div>
      </div>

      <style jsx>{`
        .Overlay {
          width: 100%;
          height: 100vh;
          background: rgba(0, 0, 0, 0.3);
          position: fixed;
          top: 0;
          left: 0;
          z-index: 99;
        }

        .Drawer {
          position: fixed;
          z-index: 100;
          top: 0;
          width: 600px;
          height: 100vh;
          max-width: calc(100% - 20px);
          background: white;
          box-shadow: none;
          overflow: hidden;
          transition: transform 0.3s ease;
        }

        .Right .Drawer {
          right: 0;
          transform: translateX(101%);
        }

        .Left .Drawer {
          left: 0;
          transform: translateX(-101%);
        }

        .Open .Drawer {
          transform: translateX(0);
          box-shadow: 0 0 20px rgba(0, 0, 0, 0.4);
        }
      `}</style>
    </>
  );
}
