/**
 * Validate Order Action
 *
 * Validates an order with the Domino's API before placing it
 */

/**
 * Handler for validateOrder action
 *
 * @param {Object} params - Action parameters
 * @param {Object} sessionManager - Session manager instance
 * @returns {Promise<Object>} Action result
 */
export async function validateOrder(params, sessionManager) {
  try {
    const { orderId } = params;

    // Get the order from the session
    const order = sessionManager.getOrder(orderId);
    if (!order) {
      throw new Error(`Order not found: ${orderId}`);
    }

    // Check if the order has items
    if (!order.products || order.products.length === 0) {
      throw new Error("Order has no items");
    }

    try {
      // Validate the order with Domino's API
      await order.validate();

      // Print the entire order object to the console
      console.dir(order, { depth: null });

      // Update the order in the session
      sessionManager.updateOrder(orderId, order);

      // Return a serializable JSON representation of the order
      if (typeof order.toJSON === "function") {
        return order.toJSON();
      } else if (order.payload) {
        return order.payload;
      } else {
        // Fallback: deep clone (may lose non-serializable fields)
        return JSON.parse(JSON.stringify(order));
      }
    } catch (error) {
      // If validation fails, provide information about the failure
      let serializableOrder;
      if (order) {
        if (typeof order.toJSON === "function") {
          serializableOrder = order.toJSON();
        } else if (order.payload) {
          serializableOrder = order.payload;
        } else {
          serializableOrder = JSON.parse(JSON.stringify(order));
        }
      }
      return {
        error: error.message,
        order: serializableOrder
      };
    }
  } catch (error) {
    throw new Error(`Failed to validate order: ${error.message}`);
  }
}
