export function proxiesFromOrders(orders = []) {
  return orders.flatMap(order => {
    const delivery = order.delivery_data;
    if (delivery?.type !== 'static_proxy' || !Array.isArray(delivery.proxies)) return [];
    const count = Math.max(1, delivery.proxies.length);
    return delivery.proxies.map(proxy => ({
      ...proxy,
      orderId: order.id,
      userId: order.user_id,
      buyerEmail: order.buyer_email,
      country: delivery.country || proxy.country_code,
      days: delivery.days,
      salePrice: Number(order.total_price || 0) / count,
      supplierCost: Number(order.supplier_cost || 0) / count,
      purchasedAt: order.created_at,
    }));
  });
}

export function proxyStatus(proxy) {
  const expiry = Number(proxy.expire_time) * 1000;
  if (!expiry || Number.isNaN(expiry)) return 'unknown';
  if (expiry <= Date.now()) return 'expired';
  if (expiry - Date.now() < 3 * 86400000) return 'expiring';
  return 'active';
}

export function proxyLine(proxy) {
  return `${proxy.type || 'http'}://${proxy.user}:${proxy.password}@${proxy.host}:${proxy.port}`;
}
