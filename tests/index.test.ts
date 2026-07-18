import { describe, expect, test } from "vitest";
import {
	ScrolltoTop as barrelScrolltoTop,
	SwitchCase as barrelSwitchCase,
	useCheckInvisible as barrelUseCheckInvisible,
	useCheckScroll as barrelUseCheckScroll,
} from "@/index";
import { ScrolltoTop } from "@/packages/components/ScrolltoTop";
import { SwitchCase } from "@/packages/components/SwitchCase";
import { useCheckInvisible } from "@/packages/hooks/useCheckInvisible";
import { useCheckScroll } from "@/packages/hooks/useCheckScroll";

describe("root barrel", () => {
	test("exports the documented component and hook entry points", () => {
		expect(barrelSwitchCase).toBe(SwitchCase);
		expect(barrelScrolltoTop).toBe(ScrolltoTop);
		expect(barrelUseCheckInvisible).toBe(useCheckInvisible);
		expect(barrelUseCheckScroll).toBe(useCheckScroll);
	});
});
