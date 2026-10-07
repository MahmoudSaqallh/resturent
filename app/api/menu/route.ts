import { getMenu } from "@/features/menu/api";

/**
 * Full catalog as static JSON. Pages that start with a partial catalog (the
 * homepage) fetch this only when the visitor needs it: search, cart, a
 * product sheet, or an existing cart that must be priced.
 */
export const dynamic = "force-static";

export async function GET() {
  return Response.json(await getMenu());
}
