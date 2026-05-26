import CasesClient from "./CasesClient";

type PageProps = {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function CasesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const capture = params?.capture;
  const initialCaptureViewerOnly = Array.isArray(capture)
    ? capture.includes("viewer")
    : capture === "viewer";

  return <CasesClient initialCaptureViewerOnly={initialCaptureViewerOnly} />;
}
