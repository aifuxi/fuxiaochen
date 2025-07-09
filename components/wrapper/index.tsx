import { cn } from "@/lib/utils";

interface WrapperProps
  extends React.HTMLAttributes<HTMLDivElement>,
    React.PropsWithChildren {}

export const Wrapper = ({ className, children, ...props }: WrapperProps) => {
  return (
    <div {...props} className={cn("mx-auto max-w-[1200px] px-6", className)}>
      {children}
    </div>
  );
};
