import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, type Mock, test, vi } from "vitest";
import { useGeolocation } from "@/web/packages/hooks/useGeolocation";

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
	test("gets an initial position before watching and stops when disabled", () => {
		mockGeolocation.watchPosition.mockReturnValue(42);
		const { result, rerender, unmount } = renderHook(
			({ enabled }) =>
				useGeolocation({
					enabled,
					mountBehavior: "get-then-watch",
					enableHighAccuracy: true,
					maximumAge: 0,
					timeout: 10_000,
				}),
			{ initialProps: { enabled: false } },
		);
		expect(mockGeolocation.getCurrentPosition).not.toHaveBeenCalled();
		rerender({ enabled: true });
		expect(mockGeolocation.getCurrentPosition).toHaveBeenCalledOnce();
		expect(mockGeolocation.watchPosition).toHaveBeenCalledOnce();
		expect(mockGeolocation.getCurrentPosition.mock.invocationCallOrder[0]).toBeLessThan(
			mockGeolocation.watchPosition.mock.invocationCallOrder[0],
		);
		const watchSuccess = mockGeolocation.watchPosition.mock.calls[0][0];
		rerender({ enabled: false });
		expect(mockGeolocation.clearWatch).toHaveBeenCalledWith(42);
		const data = result.current.data;
		act(() =>
			watchSuccess({ coords: { latitude: 0, longitude: 0, accuracy: 1 }, timestamp: Date.now() }),
		);
		expect(result.current.data).toBe(data);
		unmount();
	});

	test("does not start a watch from a late initial callback after unmount", () => {
		mockGeolocation.getCurrentPosition.mockImplementation(() => {});
		const { unmount } = renderHook(() => useGeolocation({ mountBehavior: "get-then-watch" }));
		const success = mockGeolocation.getCurrentPosition.mock.calls[0][0];
		unmount();
		act(() =>
			success({ coords: { latitude: 0, longitude: 0, accuracy: 1 }, timestamp: Date.now() }),
		);
		expect(mockGeolocation.watchPosition).not.toHaveBeenCalled();
	});

	test("ignores a late initial error after unmount without starting a watch", () => {
		mockGeolocation.getCurrentPosition.mockImplementation(() => {});
		const { unmount } = renderHook(() => useGeolocation({ mountBehavior: "get-then-watch" }));
		const error = mockGeolocation.getCurrentPosition.mock.calls[0][1];
		unmount();
		act(() => error({ code: 3, message: "late timeout" }));
		expect(mockGeolocation.watchPosition).not.toHaveBeenCalled();
	});

	test("clears get-then-watch on unmount and can recover from initial timeout", () => {
		mockGeolocation.getCurrentPosition.mockImplementation((_success, error) =>
			error({ code: 3, message: "timeout" }),
		);
		mockGeolocation.watchPosition.mockReturnValue(43);
		const { result, unmount } = renderHook(() =>
			useGeolocation({ mountBehavior: "get-then-watch" }),
		);
		expect(mockGeolocation.watchPosition).toHaveBeenCalledOnce();
		act(() =>
			mockGeolocation.watchPosition.mock.calls[0][0]({
				coords: { latitude: 37, longitude: 127, accuracy: 10 },
				timestamp: Date.now(),
			}),
		);
		expect(result.current.error).toBeNull();
		unmount();
		expect(mockGeolocation.clearWatch).toHaveBeenCalledWith(43);
	});
	test("reports current watch errors but ignores errors from a stopped watch", () => {
		mockGeolocation.watchPosition.mockImplementation(() => 44);
		const { result } = renderHook(() => useGeolocation({ mountBehavior: "watch" }));
		const error = mockGeolocation.watchPosition.mock.calls[0][1];
		act(() => error({ code: 3, message: "watch timeout" }));
		expect(result.current.error).toBe("watch timeout");
		act(() => result.current.stopTracking());
		act(() => error({ code: 2, message: "late unavailable" }));
		expect(result.current.error).toBe("watch timeout");
	});

	test("does not watch after the initial permission denial", () => {
		mockGeolocation.getCurrentPosition.mockImplementation((_success, error) =>
			error({ code: 1, message: "permission denied" }),
		);
		const { result } = renderHook(() => useGeolocation({ mountBehavior: "get-then-watch" }));
		expect(result.current.loading).toBe(false);
		expect(result.current.error).toBe("permission denied");
		expect(mockGeolocation.watchPosition).not.toHaveBeenCalled();
	});
});
