/**
 * @file app/api/users/search/route.ts
 * @description 사용자 검색 API
 * GET: 사용자 이름 또는 이름으로 검색
 */

import { NextRequest, NextResponse } from "next/server";
import { getServiceRoleClient } from "@/lib/supabase/service-role";

/**
 * GET: 사용자 검색
 * Query: q (검색어, 필수)
 */
export async function GET(request: NextRequest) {
  try {
    console.group("[Users Search API] 사용자 검색 시작");

    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("query") || searchParams.get("q"); // query 또는 q 모두 지원

    if (!query || !query.trim()) {
      console.error("[Users Search API] 검색어 누락");
      console.groupEnd();
      return NextResponse.json(
        { error: "검색어가 필요합니다." },
        { status: 400 }
      );
    }

    const searchQuery = query.trim().toLowerCase();
    console.log("검색어:", searchQuery);

    const supabase = getServiceRoleClient();

    // 사용자 검색 (name 또는 username에서 검색)
    // ILIKE를 사용하여 대소문자 구분 없이 검색
    const { data, error } = await supabase
      .from("users")
      .select("id, clerk_id, name, username, avatar_url")
      .or(`name.ilike.%${searchQuery}%,username.ilike.%${searchQuery}%`)
      .order("name", { ascending: true })
      .limit(20);

    if (error) {
      console.error("[Users Search API] 검색 실패:", error);
      console.groupEnd();
      return NextResponse.json(
        { error: "검색 중 오류가 발생했습니다.", details: error.message },
        { status: 500 }
      );
    }

    console.log("[Users Search API] 검색 성공:", data?.length || 0);
    console.groupEnd();

    return NextResponse.json({
      success: true,
      data: data || [],
    });
  } catch (error) {
    console.error("[Users Search API] 예기치 않은 오류:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

