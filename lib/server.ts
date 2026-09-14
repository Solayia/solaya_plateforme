import {env} from "cloudflare:workers";import {getChatGPTUser} from "@/app/chatgpt-auth";
export function db(){if(!env.DB)throw Error("Stockage indisponible");return env.DB;}
export async function isAdmin(){const u=await getChatGPTUser();return !!u&&u.email.toLowerCase()==="kevindolie1@gmail.com";}
export function json(data:unknown,status=200){return Response.json(data,{status,headers:{"Cache-Control":"no-store"}});}
export function sameOrigin(r:Request){const origin=r.headers.get("origin");return !!origin&&origin===new URL(r.url).origin;}

