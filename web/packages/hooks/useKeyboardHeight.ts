"use client";

import { useEffect, useState } from "react";
import { subscribeKeyboardHeight } from "../utils/browser/subscribeKeyboardHeight";

export function useKeyboardHeight() {
	const [keyboardHeight, setKeyboardHeight] = useState(0);

	useEffect(() => {
		const { unsubscribe } = subscribeKeyboardHeight({
			callback: setKeyboardHeight,
			immediate: true,
		});
		return unsubscribe;
	}, []);

	return { keyboardHeight };
}
