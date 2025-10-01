import Topbar from "./Components/Topbar";
import Login from "./Components/Login";

export default function Page() {
  return (
    <div className="min-h-dvh bg-white flex flex-col">
      <Topbar />
      {/* let content scroll on small screens */}
      <main className="flex-1 overflow-auto">
        <Login />
      </main>
    </div>
  );
}
