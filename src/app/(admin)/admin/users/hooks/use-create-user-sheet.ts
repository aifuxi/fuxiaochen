import { parseAsBoolean, useQueryState } from "nuqs";

export const useCreateUserSheet = () => {
  const [isOpen, setIsOpen] = useQueryState(
    "create-user",
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
