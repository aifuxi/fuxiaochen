import { cn } from "@/lib/utils";

interface WrapperProps
  extends React.HTMLAttributes<HTMLDivElement>,
    React.PropsWithChildren {}

export const Wrapper = ({ className, children, ...props }: WrapperProps) => {
  return (
    <div
      {...props}
      className={cn("max-w-screen-wrapper mx-auto px-6", className)}
    >
      {children}
    </div>
  );
};
