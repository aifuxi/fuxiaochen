import { parseAsBoolean, useQueryState } from "nuqs";

export const useCreateCategorySheet = () => {
  const [isOpen, setIsOpen] = useQueryState(
    "create-category",
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
