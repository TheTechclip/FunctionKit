"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type GeolocationData = {
	latitude: number;
	longitude: number;
	accuracy: number;
	altitude: number | null;
	altitudeAccuracy: number | null;
	heading: number | null;
	speed: number | null;
	timestamp: number;
};

const MOUNT_BEHAVIOR = { GET: "get", WATCH: "watch" } as const;

type MountBehavior = (typeof MOUNT_BEHAVIOR)[keyof typeof MOUNT_BEHAVIOR];

type UseGeolocationOptions = {
	mountBehavior?: MountBehavior;
	enableHighAccuracy?: boolean;
	timeout?: number;
	maximumAge?: number;
};

export function useGeolocation(options?: UseGeolocationOptions) {
	const [state, setState] = useState<{
		loading: boolean;
		error: string | null;
		data: GeolocationData | null;
	}>({
		loading: !!options?.mountBehavior,
		error: null,
		data: null,
	});
	const [isTracking, setIsTracking] = useState(false);
	const watchIdRef = useRef<number | null>(null);

	const isSupported = useCallback(() => {
		if (typeof window === "undefined" || !navigator.geolocation) {
			setState((prev) => ({
				...prev,
				loading: false,
				error: "Geolocation is not supported by this environment.",
			}));
			return false;
		}
		return true;
	}, []);

	const handleSuccess = useCallback((position: GeolocationPosition) => {
		const { coords } = position;
		setState((prev) => ({
			...prev,
			loading: false,
			error: null,
			data: {
				latitude: coords.latitude,
				longitude: coords.longitude,
				accuracy: coords.accuracy,
				altitude: coords.altitude,
				altitudeAccuracy: coords.altitudeAccuracy,
				heading: coords.heading,
				speed: coords.speed,
				timestamp: position.timestamp,
			},
		}));
	}, []);

	const handleError = useCallback((error: GeolocationPositionError) => {
		setState((prev) => ({
			...prev,
			loading: false,
			error: error.message,
		}));
	}, []);

	const geoOptions = useCallback(
		() => ({
			enableHighAccuracy: options?.enableHighAccuracy ?? false,
			maximumAge: options?.maximumAge ?? 0,
			timeout: options?.timeout ?? Infinity,
		}),
		[options?.enableHighAccuracy, options?.maximumAge, options?.timeout],
	);

	const getCurrentPosition = useCallback(() => {
		if (!isSupported()) return;
		setState((prev) => ({ ...prev, loading: true }));
		navigator.geolocation.getCurrentPosition(handleSuccess, handleError, geoOptions());
	}, [handleSuccess, handleError, geoOptions, isSupported]);

	const startTracking = useCallback(() => {
		if (!isSupported()) return;

		if (watchIdRef.current !== null) {
			navigator.geolocation.clearWatch(watchIdRef.current);
		}

		setState((prev) => ({ ...prev, loading: true }));

		watchIdRef.current = navigator.geolocation.watchPosition(
			(position) => {
				setIsTracking(true);
				handleSuccess(position);
			},
			handleError,
			geoOptions(),
		);
	}, [handleSuccess, handleError, geoOptions, isSupported]);

	const stopTracking = useCallback(() => {
		if (watchIdRef.current === null) return;
		navigator.geolocation.clearWatch(watchIdRef.current);
		watchIdRef.current = null;
		setIsTracking(false);
	}, []);

	useEffect(() => {
		if (options?.mountBehavior === MOUNT_BEHAVIOR.WATCH) {
			startTracking();
		} else if (options?.mountBehavior === MOUNT_BEHAVIOR.GET) {
			getCurrentPosition();
		}

		return () => {
			if (watchIdRef.current !== null) {
				navigator.geolocation.clearWatch(watchIdRef.current);
				watchIdRef.current = null;
			}
		};
	}, [options?.mountBehavior, getCurrentPosition, startTracking]);

	return {
		...state,
		getCurrentPosition,
		startTracking,
		stopTracking,
		isTracking,
	};
}
