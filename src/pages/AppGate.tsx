import CalculatorPage from "@/pages/CalculatorPage";
import V1Page from "@/pages/V1Page";
import { useVersion } from "@/contexts/VersionContext";

export default function AppGate() {
  const { version } = useVersion();
  return version === "v1" ? <V1Page /> : <CalculatorPage />;
}
