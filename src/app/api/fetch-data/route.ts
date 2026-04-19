import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const {
      apeKey,
      limit = 1000,
      mode = "time",
      mode2 = "30",
    } = await req.json();

    if (!apeKey) {
      return NextResponse.json(
        { error: "API key is required" },
        { status: 400 }
      );
    }

    const response = await fetch(
      `https://api.monkeytype.com/results?limit=${limit}`,
      {
        headers: {
          Authorization: `ApeKey ${apeKey}`,
        },
        // Disable Next.js caching for user-specific data
        cache: "no-store",
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      // Prefer a friendlier message for the common 401/403 case
      const friendly =
        response.status === 401 || response.status === 403
          ? "Invalid ApeKey. Double-check the key from monkeytype.com → Settings → Ape Keys."
          : `MonkeyType API error (${response.status}): ${errText.slice(0, 200)}`;
      return NextResponse.json(
        { error: friendly },
        { status: response.status }
      );
    }

    const data = await response.json();
    const allResults: any[] = Array.isArray(data.data) ? data.data : [];

    // Loose filter: handle mode2 being string OR number, and mode casing
    const filtered = allResults.filter((r: any) => {
      if (!r || typeof r.wpm !== "number") return false;
      const rMode = String(r.mode ?? "").toLowerCase();
      const rMode2 = String(r.mode2 ?? "");
      return rMode === String(mode).toLowerCase() && rMode2 === String(mode2);
    });

    // If the strict filter returns nothing but the account has results,
    // fall back to ALL time-mode results and let the client figure it out.
    // This prevents the "blank dashboard" state for users with no 30s tests.
    let finalResults = filtered;
    let fallbackUsed = false;
    if (finalResults.length === 0 && allResults.length > 0) {
      finalResults = allResults.filter(
        (r: any) =>
          r && typeof r.wpm === "number" && String(r.mode).toLowerCase() === "time"
      );
      fallbackUsed = finalResults.length > 0;
    }

    // Normalize: ensure every result has the fields analytics expects
    const normalized = finalResults.map((r: any) => ({
      wpm: Number(r.wpm) || 0,
      acc: Number(r.acc) || 0,
      consistency: Number(r.consistency) || 0,
      rawWpm: Number(r.rawWpm) || 0,
      mode: String(r.mode || "time"),
      mode2: String(r.mode2 || ""),
      timestamp: Number(r.timestamp) || Date.now(),
      language: String(r.language || "english"),
    }));

    return NextResponse.json({
      results: normalized,
      totalFetched: allResults.length,
      filteredCount: normalized.length,
      fallbackUsed,
      requestedMode: mode,
      requestedMode2: mode2,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
