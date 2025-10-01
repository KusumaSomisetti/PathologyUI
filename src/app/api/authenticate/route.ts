import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
            "Access-Control-Max-Age": "86400",
        },
    });
}

export async function POST(req: Request) {
    const payload = await req.json();

    const upstream = await fetch("https://api.livo.ai/authenticate.json", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
        },
        body: JSON.stringify(payload),
    });

    // Read body safely even if empty
    const text = await upstream.text();
    const contentType = upstream.headers.get("content-type") ?? "application/json";

    // If the body is empty but not OK, create a minimal diagnostic
    const body =
        text?.length
            ? text
            : !upstream.ok
                ? JSON.stringify({ error: upstream.statusText || "Unauthorized" })
                : "";

    return new NextResponse(body, {
        status: upstream.status,
        headers: {
            "Content-Type": contentType,
            "Cache-Control": "no-store",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Expose-Headers": "*",
        },
    });
}
