import { coupons } from "@/data/coupons";
import { restaurant } from "@/data/restaurant";
import { getMenu } from "@/features/menu/api";
import { createOrder, OrderError, parseOrderRequest } from "@/features/orders/create-order";
import type { OrderErrorResponse } from "@/types";

/**
 * Creates an order from the cart.
 *
 * Validation and pricing are real; persistence is not. Before launch, forward
 * the returned order to the restaurant's POS / database / notification
 * channel here, and return its real id and any preparation estimate.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return error(400, new OrderError("INVALID_REQUEST", "تعذّرت قراءة بيانات الطلب."));
  }

  try {
    const order = createOrder(parseOrderRequest(body), await getMenu(), restaurant, coupons, new Date());
    return Response.json({ order }, { status: 201 });
  } catch (cause) {
    if (cause instanceof OrderError) {
      const conflict: string[] = ["RESTAURANT_CLOSED", "ORDERING_PAUSED", "ITEM_UNAVAILABLE"];
      const status = conflict.includes(cause.code) ? 409 : 422;
      return error(status, cause);
    }
    console.error("Order creation failed", cause);
    return Response.json(
      { error: { code: "INVALID_REQUEST", message: "حدث خطأ غير متوقع." } } satisfies OrderErrorResponse,
      { status: 500 }
    );
  }
}

function error(status: number, cause: OrderError) {
  return Response.json(
    { error: { code: cause.code, message: cause.message, productIds: cause.productIds } } satisfies OrderErrorResponse,
    { status }
  );
}
