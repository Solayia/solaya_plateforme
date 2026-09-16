import { NextResponse } from "next/server";
export function GET(r: Request) {
 const origin = process.env.APP_ORIGIN || new URL(r.url).origin;
 const path = new URL(r.url).searchParams.get("return_to") || "/interne";
 const target = new URL(path, origin);
 return NextResponse.redirect(target.origin === origin ? target : new URL("/interne", origin));
}
