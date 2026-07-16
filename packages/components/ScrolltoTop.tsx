"use client";

import { useEffect } from "react";

export function ScrolltoTop() {
	useEffect(() => {
		window.scrollTo(0, 0);
	});
}
