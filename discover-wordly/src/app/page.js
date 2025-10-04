import MapClientWrapper from "./components/MapClientWrapper";

export default function Home() {
  return (
    // Server component: renders layout and client wrapper for interactive parts
    <main
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 16,
        padding: "12px 24px",
        justifyContent: "flex-start", // ensure content starts nearer the top
      }}
    >
      {/* Map centered with a max width so it doesn't stretch too wide */}
      {/* Client wrapper handles interactive map + swipe deck */}
      <MapClientWrapper />
    </main>
  );
}
