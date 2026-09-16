import {database} from "@/lib/sqlite.mjs";import {getChatGPTUser} from "@/app/chatgpt-auth";
export function db(){return database();}
export async function isAdmin(){const u=await getChatGPTUser();return !!u&&u.email.toLowerCase()==="kevindolie1@gmail.com";}
export function json(data:unknown,status=200){return Response.json(data,{status,headers:{"Cache-Control":"no-store"}});}
export function sameOrigin(r:Request){const origin=r.headers.get("origin");return !!origin&&origin===(process.env.APP_ORIGIN || new URL(r.url).origin);}

