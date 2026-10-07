import { restaurant } from "@/data/restaurant";

/**
 * Table QR codes: /t/{branchId}/{table} → the menu in dine-in mode.
 * The client validates the table again and keeps it for this visit only.
 */
export async function GET(request: Request, { params }: RouteContext<"/t/[branch]/[table]">) {
  const { branch, table } = await params;
  const url = new URL("/menu", request.url);
  if (/^[A-Za-z0-9-]{1,10}$/.test(table)) url.searchParams.set("table", table);
  if (restaurant.branches.some((b) => b.id === branch)) url.searchParams.set("branch", branch);
  return Response.redirect(url, 307);
}
