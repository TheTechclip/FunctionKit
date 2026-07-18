export type GeoCoordinates = { latitude: number; longitude: number };

const EARTH_RADIUS_METERS = 6_371_000;

function isValidCoordinates(value: GeoCoordinates | null | undefined): value is GeoCoordinates {
	return (
		!!value &&
		Number.isFinite(value.latitude) &&
		Number.isFinite(value.longitude) &&
		Math.abs(value.latitude) <= 90 &&
		Math.abs(value.longitude) <= 180
	);
}

function toRadians(degrees: number): number {
	return (degrees * Math.PI) / 180;
}

export function getDistanceMeters(
	from: GeoCoordinates | null | undefined,
	to: GeoCoordinates | null | undefined,
): number | null {
	if (!isValidCoordinates(from) || !isValidCoordinates(to)) return null;
	const latitudeDelta = toRadians(to.latitude - from.latitude);
	const longitudeDelta = toRadians(to.longitude - from.longitude);
	const haversine =
		Math.sin(latitudeDelta / 2) ** 2 +
		Math.cos(toRadians(from.latitude)) *
			Math.cos(toRadians(to.latitude)) *
			Math.sin(longitudeDelta / 2) ** 2;
	return EARTH_RADIUS_METERS * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
}

export function getDistanceKilometers(
	from: GeoCoordinates | null | undefined,
	to: GeoCoordinates | null | undefined,
): number | null {
	const meters = getDistanceMeters(from, to);
	return meters === null ? null : meters / 1_000;
}
