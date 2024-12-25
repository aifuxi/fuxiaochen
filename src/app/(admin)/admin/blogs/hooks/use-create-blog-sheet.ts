import { parseAsBoolean, useQueryState } from "nuqs";

export const useCreateBlogSheet = () => {
  const [isOpen, setIsOpen] = useQueryState(
    "create-blog",
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
