import { parseAsBoolean, parseAsString, useQueryState } from "nuqs";

export const useUpdateUserSheet = () => {
  const [isOpen, setIsOpen] = useQueryState(
    "update-user",
    parseAsBoolean.withDefault(false).withOptions({ clearOnDefault: true }),
  );
  const [email, setEmail] = useQueryState(
    "email",
    parseAsString.withDefault("").withOptions({ clearOnDefault: true }),
  );

  const openSheet = (value: string) => {
    void setIsOpen(true);
    void setEmail(value);
  };
  const closeSheet = () => {
    void setIsOpen(false);
    void setEmail(null);
  };

  return {
    email,
    setEmail,
    isOpen,
    openSheet,
    closeSheet,
    setIsOpen,
  };
};
