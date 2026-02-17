import * as React from "react";
import * as SlotPrimitive from "@radix-ui/react-slot";

const Slot = React.forwardRef<
  React.ElementRef<typeof SlotPrimitive.Slot>,
  React.ComponentPropsWithoutRef<typeof SlotPrimitive.Slot>
>(({ ...props }, ref) => <SlotPrimitive.Slot ref={ref} {...props} />);
Slot.displayName = SlotPrimitive.Root.displayName;

export { Slot };
