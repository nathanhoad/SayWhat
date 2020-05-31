import { ApplicationProvider } from "../hooks/useApplication";
import EditSequenceLayout from "../components/EditSequenceLayout";

export default function Index() {
  return (
    <ApplicationProvider>
      <EditSequenceLayout />
    </ApplicationProvider>
  );
}
