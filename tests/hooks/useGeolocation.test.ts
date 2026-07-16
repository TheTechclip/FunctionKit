import { describe, test, expect, vi, beforeEach, type Mock } from "vitest";
import { renderHook, act } from "@testing-library/react";
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

	test("getCurrentPosition fetches location", () => {
		const { result } = renderHook(() => useGeolocation());
		act(() => { result.current.getCurrentPosition(); });
		expect(mockGeolocation.getCurrentPosition).toHaveBeenCalledOnce();
	});
});
