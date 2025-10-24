import { cn } from "@/lib/utils";

export function AdminContentLayout({
  className,
  children,
  header,
  ...props
}: React.ComponentProps<"div"> & { header?: React.ReactNode }) {
  return (
    <div
      {...props}
      className={cn(
        "mx-auto flex max-w-wrapper flex-col gap-y-6 px-10",
        className,
      )}
    >
      {header}
      {children}
    </div>
  );
}
