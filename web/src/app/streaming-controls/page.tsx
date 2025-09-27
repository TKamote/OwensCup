import StreamingControls from "../../components/StreamingControls";
import Navigation from "../../components/Navigation";

export default function StreamingControlsPage() {
  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gray-900 p-8">
        <div className="w-4/5 mx-auto">
          <StreamingControls />
        </div>
      </div>
    </>
  );
}
