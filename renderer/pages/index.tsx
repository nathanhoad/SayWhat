import { ApplicationProvider } from "../hooks/useApplication";
import ApplicationLayout from "../components/ApplicationLayout";

export default function Index() {
  return (
    <ApplicationProvider>
      <ApplicationLayout />
    </ApplicationProvider>
  );
}
