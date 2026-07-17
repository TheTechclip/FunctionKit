import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, type Mock, test, vi } from "vitest";
import { useGeolocation } from "@/packages/hooks/useGeolocation";

describe("useGeolocation", () => {
	let mockGeolocation: {
		getCurrentPosition: Mock;
		watchPosition: Mock;
		clearWatch: Mock;
	};

	beforeEach(() => {
		mockGeolocation = {
			getCurrentPosition: vi.fn((success) =>
				success({
					coords: {
						latitude: 37.5665,
						longitude: 126.978,
						accuracy: 10,
						altitude: null,
						altitudeAccuracy: null,
						heading: null,
						speed: null,
					},
					timestamp: Date.now(),
				}),
			),
			watchPosition: vi.fn(),
			clearWatch: vi.fn(),
		};
		Object.defineProperty(navigator, "geolocation", {
			value: mockGeolocation,
			writable: true,
			configurable: true,
		});
	});

	test("returns default state", () => {
		const { result } = renderHook(() => useGeolocation());
		expect(result.current.loading).toBe(false);
		expect(result.current.error).toBeNull();
		expect(result.current.data).toBeNull();
	});

	test("getCurrentPosition fetches location and updates state", () => {
		const { result } = renderHook(() => useGeolocation());
		act(() => {
			result.current.getCurrentPosition();
		});
		expect(mockGeolocation.getCurrentPosition).toHaveBeenCalledOnce();
		expect(result.current.loading).toBe(false);
		expect(result.current.data?.latitude).toBe(37.5665);
	});

	test("getCurrentPosition with mount behavior GET", () => {
		renderHook(() => useGeolocation({ mountBehavior: "get" }));
		expect(mockGeolocation.getCurrentPosition).toHaveBeenCalled();
	});

	test("mount behavior GET calls getCurrentPosition with geoOptions", () => {
		renderHook(() => useGeolocation({ mountBehavior: "get", enableHighAccuracy: true }));
		expect(mockGeolocation.getCurrentPosition).toHaveBeenCalledWith(
			expect.any(Function),
			expect.any(Function),
			expect.objectContaining({ enableHighAccuracy: true }),
		);
	});

	test("clears existing watch before starting new tracking", () => {
		mockGeolocation.watchPosition = vi.fn(() => 789);
		const { result } = renderHook(() => useGeolocation());
		act(() => {
			result.current.startTracking();
		});
		act(() => {
			result.current.startTracking();
		});
		expect(mockGeolocation.clearWatch).toHaveBeenCalledWith(789);
	});

	test("startTracking returns early when geolocation unsupported", () => {
		const origGeolocation = navigator.geolocation;
		Object.defineProperty(navigator, "geolocation", {
			value: undefined,
			writable: true,
			configurable: true,
		});
		const { result } = renderHook(() => useGeolocation());
		act(() => {
			result.current.startTracking();
		});
		expect(result.current.error).toBe("Geolocation is not supported by this environment.");
		Object.defineProperty(navigator, "geolocation", {
			value: origGeolocation,
			writable: true,
			configurable: true,
		});
	});

	test("startTracking calls watchPosition", () => {
		const watchSuccess = vi.fn();
		mockGeolocation.watchPosition = vi.fn((success) => {
			watchSuccess.mockImplementation(() =>
				success({
					coords: {
						latitude: 37.5,
						longitude: 127.0,
						accuracy: 5,
						altitude: null,
						altitudeAccuracy: null,
						heading: null,
						speed: null,
					},
					timestamp: Date.now(),
				}),
			);
		});
		const { result } = renderHook(() => useGeolocation());
		act(() => {
			result.current.startTracking();
		});
		expect(mockGeolocation.watchPosition).toHaveBeenCalled();
	});

	test("startTracking with mount behavior WATCH", () => {
		mockGeolocation.watchPosition = vi.fn((success) =>
			success({
				coords: {
					latitude: 37.5,
					longitude: 127.0,
					accuracy: 5,
					altitude: null,
					altitudeAccuracy: null,
					heading: null,
					speed: null,
				},
				timestamp: Date.now(),
			}),
		);
		renderHook(() => useGeolocation({ mountBehavior: "watch" }));
		expect(mockGeolocation.watchPosition).toHaveBeenCalled();
	});

	test("stopTracking clears watch and sets isTracking to false", () => {
		mockGeolocation.watchPosition = vi.fn(() => 123);
		const { result } = renderHook(() => useGeolocation());
		act(() => {
			result.current.startTracking();
		});
		act(() => {
			result.current.stopTracking();
		});
		expect(mockGeolocation.clearWatch).toHaveBeenCalledWith(123);
		expect(result.current.isTracking).toBe(false);
	});

	test("stopTracking does nothing when no watch is active", () => {
		const { result } = renderHook(() => useGeolocation());
		act(() => {
			result.current.stopTracking();
		});
		expect(mockGeolocation.clearWatch).not.toHaveBeenCalled();
	});

	test("clears watch on unmount when tracking", () => {
		mockGeolocation.watchPosition = vi.fn(() => 456);
		const { unmount } = renderHook(() => useGeolocation({ mountBehavior: "watch" }));
		unmount();
		expect(mockGeolocation.clearWatch).toHaveBeenCalledWith(456);
	});

	test("handles unsupported geolocation", () => {
		const origGeolocation = navigator.geolocation;
		Object.defineProperty(navigator, "geolocation", {
			value: undefined,
			writable: true,
			configurable: true,
		});
		const { result } = renderHook(() => useGeolocation());
		act(() => {
			result.current.getCurrentPosition();
		});
		expect(result.current.error).toBe("Geolocation is not supported by this environment.");
		Object.defineProperty(navigator, "geolocation", {
			value: origGeolocation,
			writable: true,
			configurable: true,
		});
	});

	test("handles geolocation error", () => {
		mockGeolocation.getCurrentPosition = vi.fn((_success, error) =>
			error?.({ message: "User denied geolocation" }),
		);
		const { result } = renderHook(() => useGeolocation());
		act(() => {
			result.current.getCurrentPosition();
		});
		expect(result.current.error).toBe("User denied geolocation");
	});
});
