import useApplication from "../../hooks/useApplication";
import SequencesList from "../SequencesList";
import Sequence from "../Sequence";
import Drawer from "../Drawer";

export default function Layout() {
  const { userInterface, closeSequencesList } = useApplication();

  return (
    <>
      <Drawer
        side="Left"
        isOpen={userInterface.isSequencesListOpen}
        onClose={() => closeSequencesList()}
        data-testid="drawer">
        <SequencesList />
      </Drawer>

      <Sequence />
    </>
  );
}
