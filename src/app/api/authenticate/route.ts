import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

async function postJSON(body: any) {
    return fetch("https://api.livo.ai/authenticate.json", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(body),
    });
}

async function postForm(form: URLSearchParams) {
    return fetch("https://api.livo.ai/authenticate.json", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
        body: form.toString(),
    });
}

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
    const incoming = await req.json().catch(() => ({} as any));
    const email =
        incoming?.authentication?.email ?? incoming?.user?.email ?? incoming?.email ?? "";
    const password =
        incoming?.authentication?.password ?? incoming?.user?.password ?? incoming?.password ?? "";

    // Try 1) JSON { user: { email, password } }
    let res = await postJSON({ user: { email, password } });
    if (res.status === 401 || res.status === 422) {
        // Try 2) form-encoded user[email], user[password]
        const form = new URLSearchParams();
        form.set("user[email]", email);
        form.set("user[password]", password);
        const res2 = await postForm(form);
        if (res2.ok) res = res2;
        else if (res2.status === 401 || res2.status === 422) {
            // Try 3) simple JSON { email, password }
            const res3 = await postJSON({ email, password });
            if (res3.ok) res = res3;
            else res = res2; // keep the last failure with its body
        } else {
            res = res2;
        }
    }

    const text = await res.text();
    const contentType = res.headers.get("content-type") ?? "application/json";
    const body = text?.length ? text : res.ok ? "" : JSON.stringify({ error: res.statusText || "Unauthorized" });

    return new NextResponse(body, {
        status: res.status,
        headers: {
            "Content-Type": contentType,
            "Cache-Control": "no-store",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Expose-Headers": "*",
        },
    });
}
