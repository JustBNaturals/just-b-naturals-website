// Existing live-site delivery terms, shared by checkout and trusted orders.
export const LOCAL_DELIVERY_MAX_KM = 20;
export const LOCAL_DELIVERY_FEE_CENTS = 1000;
export const FREE_DELIVERY_THRESHOLD_CENTS = 7500;
export function localDeliveryFee(distanceKm, subtotalCents) {
  if (!Number.isFinite(distanceKm) || distanceKm <= 0 || distanceKm > LOCAL_DELIVERY_MAX_KM) throw new Error('Local delivery is available within 20 km of Aylmer.');
  if (!Number.isInteger(subtotalCents) || subtotalCents < 0) throw new Error('Invalid delivery subtotal.');
  return subtotalCents >= FREE_DELIVERY_THRESHOLD_CENTS ? 0 : LOCAL_DELIVERY_FEE_CENTS;
}
