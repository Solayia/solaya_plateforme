type Result = {meta:{changes:number}};
interface Statement { bind(...args:unknown[]):Statement; first<T=Record<string,unknown>>():T|null; all<T=Record<string,unknown>>():{results:T[]}; run():Result; }
interface Database { prepare(sql:string):Statement; batch(statements:Statement[]):Result[]; close():void; }
export function database():Database;
export function openDatabase(filename:string,migrationDir?:string):Database;
