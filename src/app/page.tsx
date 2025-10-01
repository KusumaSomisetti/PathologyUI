import { Suspense } from "react";
import Topbar from "./Components/Topbar";
import Login from "./Components/Login";

type PageProps = {
  searchParams?: { [key: string]: string | string[] | undefined };
};

export default function Page({ searchParams }: PageProps) {
  const returnUrl = (searchParams?.returnUrl as string) ?? "/cases";

  return (
    <div className="min-h-dvh bg-white flex flex-col">
      <Topbar />
      <main className="flex-1 overflow-auto">
        {/* No hook in child now, just pass the value */}
        <Suspense fallback={null}>
          <Login returnUrl={returnUrl} />
        </Suspense>
      </main>
    </div>
  );
}
