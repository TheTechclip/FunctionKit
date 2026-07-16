"use client";

import { useEffect, useState } from "react";

export function useViewportHeight() {
	const [height, setHeight] = useState(0);

	useEffect(() => {
		const update = () =>
			setHeight(window.visualViewport?.height ?? window.innerHeight);

		update();
		window.visualViewport?.addEventListener("resize", update);
		window.addEventListener("resize", update);

		return () => {
			window.visualViewport?.removeEventListener("resize", update);
			window.removeEventListener("resize", update);
		};
	}, []);

	return { height };
}
