import { ApplicationProvider } from "../hooks/useApplication";
import ConfirmLayout from "../components/ConfirmLayout";

export default function Index() {
  return (
    <ApplicationProvider>
      <ConfirmLayout />
    </ApplicationProvider>
  );
}
