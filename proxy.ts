import { NextRequest, NextResponse } from "next/server";
import { authenticate } from "./lib/vps-auth.mjs";
export function proxy(request: NextRequest) {
  if (!authenticate(request.headers.get("authorization"))) {
    return new NextResponse("Préproduction Solaya — authentification requise", {status:401, headers:{"WWW-Authenticate":'Basic realm="Solaya preproduction", charset="UTF-8"',"Cache-Control":"no-store"}});
  }
  const response = NextResponse.next();
  response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}
