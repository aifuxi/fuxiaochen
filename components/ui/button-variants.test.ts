import { expect, test } from "vitest";

import { buttonVariants } from "@/components/ui/button-variants";

test("default button variants use editorial framing", () => {
  const classes = buttonVariants();

  expect(classes).toContain("rounded-2xl");
  expect(classes).not.toContain("rounded-full");
  expect(classes).toContain("focus-visible:ring-4");
});
