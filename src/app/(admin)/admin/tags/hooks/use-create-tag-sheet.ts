import { parseAsBoolean, useQueryState } from "nuqs";

export const useCreateTagSheet = () => {
  const [isOpen, setIsOpen] = useQueryState(
    "create-tag",
    parseAsBoolean.withDefault(false).withOptions({ clearOnDefault: true }),
  );

  const openSheet = () => setIsOpen(true);
  const closeSheet = () => setIsOpen(false);

  return {
    isOpen,
    openSheet,
    closeSheet,
    setIsOpen,
  };
};
