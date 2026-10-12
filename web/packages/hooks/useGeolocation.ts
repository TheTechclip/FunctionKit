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

const MOUNT_BEHAVIOR = { GET: "get", WATCH: "watch", GET_THEN_WATCH: "get-then-watch" } as const;

type MountBehavior = (typeof MOUNT_BEHAVIOR)[keyof typeof MOUNT_BEHAVIOR];

type UseGeolocationOptions = {
	mountBehavior?: MountBehavior;
	enabled?: boolean;
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
	const trackingGenerationRef = useRef(0);

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
		if (options?.enabled === false || !isSupported()) return;
		setState((prev) => ({ ...prev, loading: true }));
		navigator.geolocation.getCurrentPosition(handleSuccess, handleError, geoOptions());
	}, [handleSuccess, handleError, geoOptions, isSupported, options?.enabled]);

	const startTracking = useCallback(() => {
		if (options?.enabled === false || !isSupported()) return;

		if (watchIdRef.current !== null) {
			navigator.geolocation.clearWatch(watchIdRef.current);
		}

		setState((prev) => ({ ...prev, loading: true }));

		const generation = ++trackingGenerationRef.current;
		watchIdRef.current = navigator.geolocation.watchPosition(
			(position) => {
				if (trackingGenerationRef.current !== generation) return;
				setIsTracking(true);
				handleSuccess(position);
			},
			(error) => {
				if (trackingGenerationRef.current === generation) handleError(error);
			},
			geoOptions(),
		);
	}, [handleSuccess, handleError, geoOptions, isSupported, options?.enabled]);

	const stopTracking = useCallback(() => {
		trackingGenerationRef.current++;
		if (watchIdRef.current === null) return;
		navigator.geolocation.clearWatch(watchIdRef.current);
		watchIdRef.current = null;
		setIsTracking(false);
	}, []);

	useEffect(() => {
		let active = true;
		if (options?.enabled !== false) {
			if (options?.mountBehavior === MOUNT_BEHAVIOR.GET_THEN_WATCH && isSupported()) {
				setState({ loading: true, error: null, data: null });
				navigator.geolocation.getCurrentPosition(
					(position) => {
						if (!active) return;
						handleSuccess(position);
						startTracking();
					},
					(error) => {
						if (!active) return;
						handleError(error);
						if (error.code !== 1) startTracking();
					},
					geoOptions(),
				);
			} else if (options?.mountBehavior === MOUNT_BEHAVIOR.WATCH) {
				startTracking();
			} else if (options?.mountBehavior === MOUNT_BEHAVIOR.GET) {
				getCurrentPosition();
			}
		}
		return () => {
			active = false;
			stopTracking();
		};
	}, [
		options?.enabled,
		options?.mountBehavior,
		getCurrentPosition,
		startTracking,
		stopTracking,
		isSupported,
		handleSuccess,
		handleError,
		geoOptions,
	]);

	return {
		...state,
		getCurrentPosition,
		startTracking,
		stopTracking,
		isTracking,
	};
}
