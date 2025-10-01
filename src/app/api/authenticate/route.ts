import { NextResponse } from "next/server";

export const dynamic = "force-dynamic"; // do not cache, avoids stale auth
// export const runtime = "edge"; // optional — you can enable Edge runtime if you like

export async function OPTIONS() {
    // You’re same-origin, so CORS isn’t required — but this keeps dev tools quiet.
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
        headers: { "Content-Type": "application/json" },
        // If the upstream needs cookies or auth headers from the request, forward them here.
        body: JSON.stringify(payload),
    });

    // Read raw text to pass-through whatever the upstream returns
    const text = await upstream.text();

    return new NextResponse(text, {
        status: upstream.status,
        headers: {
            "Content-Type": upstream.headers.get("content-type") ?? "application/json",
            // not needed for same-origin, but fine:
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Expose-Headers": "*",
        },
    });
}
