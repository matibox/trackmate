import Telemetry from '../_components/Telemetry';
import TelemetryNav from '../_components/TelemetryNav';
import TelemetryUpload from './_components/TelemetryUpload';

export default function TelemetryPage() {
  return (
    <>
      <TelemetryNav />
      <Telemetry />
      <TelemetryUpload />
    </>
  );
}
