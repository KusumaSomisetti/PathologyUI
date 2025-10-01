// casesClient.ts
export type MissingFlags = {
    wbc: boolean;
    rbc: boolean;
    plt: boolean;
    wbc_distribution: boolean;
    field_view: boolean; // main
    fov: boolean;        // alias of field_view
    rbc_csv: boolean;    // alias of rbc
    plt_csv: boolean;    // alias of plt
};

export type MissingPayload = {
    urn_no: string;
    destination: string;
} & MissingFlags;

function getAuthToken(): string | null {
    try {
        const s = localStorage.getItem("currentUser");
        return s ? (JSON.parse(s).auth_token as string) : null;
    } catch {
        return null;
    }
}

function apiBase(): string {
    return (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "");
}

async function readResponse(res: Response) {
    const ct = res.headers.get("content-type") || "";
    let raw = "";
    try { raw = await res.text(); } catch { }
    let json: any = null;
    if (raw && ct.includes("application/json")) {
        try { json = JSON.parse(raw); } catch { }
    }
    return { raw, json };
}

export async function submitMissingFiles(
    testId: number | string,
    payload: {
        urn_no: string;
        destination: string;
        wbc: boolean; rbc: boolean; plt: boolean;
        wbc_distribution: boolean; field_view: boolean; fov: boolean;
        rbc_csv: boolean; plt_csv: boolean;
    }
): Promise<{ ok: boolean; message: string }> {
    const token = getAuthToken();
    const url = `${apiBase()}/patients/tests/${testId}/missing.json`;

    const jsonHeaders: Record<string, string> = { "Content-Type": "application/json" };
    if (token) jsonHeaders.Authorization = `Bearer ${token}`;

    const res1 = await fetch(url, {
        method: "POST",
        headers: jsonHeaders,
        body: JSON.stringify({ patient_test: { missing: payload } }),
    });
    const r1 = await readResponse(res1);
    if (res1.ok && (r1.json?.status === "success" || !r1.json)) {
        return { ok: true, message: r1.json?.message || "Saved" };
    }


    const msg =
        r1.json?.message ||
        r1.json?.error ||
        r1.raw ||
        `Failed (HTTP ${res1.status})`;
    return { ok: false, message: msg };
}
