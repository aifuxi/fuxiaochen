import { Breadcrumb, Typography } from "@douyinfe/semi-ui-19";

interface Props extends React.PropsWithChildren {
  title: string;
  routes: React.ComponentProps<typeof Breadcrumb>["routes"];
}

export default function ContentLayout({ children, routes, title }: Props) {
  return (
    <div className="px-4">
      <Breadcrumb className="mb-4" routes={routes} />

      <Typography.Title heading={4}>{title}</Typography.Title>

      {children}
    </div>
  );
}
