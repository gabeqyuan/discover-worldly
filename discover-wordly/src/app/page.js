import MapClientWrapper from "./components/MapClientWrapper";

export default function Home() {
  return (
    // Server component: renders layout and client wrapper for interactive parts
    <div className="overflow-hidden">
      <MapClientWrapper />
    </div>
  );
}
