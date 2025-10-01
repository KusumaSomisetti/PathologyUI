// casesClientReject.tsx
export async function rejectCase(
    id: number | string,
    body: any // { patient_test: { reject_reason: string } } OR FormData equivalent
): Promise<{ ok: boolean; message?: string }> {
    const userStr = localStorage.getItem("currentUser");
    const token = userStr ? JSON.parse(userStr).auth_token as string : "";

    const url = `${process.env.NEXT_PUBLIC_API_URL}/patients/tests/${id}/reject.json`;

    // If you’re sending JSON (matches what your modal calls now):
    const isJSON = !(body instanceof FormData);

    const res = await fetch(url, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            ...(isJSON ? { "Content-Type": "application/json" } : {}),
        },
        body: isJSON ? JSON.stringify(body) : body, // FormData passes through
    });

    // —— Robust parsing: handle empty/non-JSON bodies safely ——
    let payload: any = null;
    let text = "";
    try {
        text = await res.text();
        if (text && (res.headers.get("content-type") || "").includes("application/json")) {
            payload = JSON.parse(text);
        }
    } catch {
        // ignore parse errors; we'll fall back to plain text
    }

    if (res.ok) {
        return {
            ok: true,
            message:
                payload?.message ||
                payload?.notice ||
                "Case rejected",
        };
    }

    return {
        ok: false,
        message:
            payload?.error ||
            payload?.message ||
            text ||
            `Reject failed (HTTP ${res.status})`,
    };
}
