import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export function ProjectCard({
  title,
  description,
  stack,
}: {
  title: string;
  description: string;
  stack: readonly string[];
}) {
  return (
    <Card className="h-full">
      <CardContent className="space-y-5 p-0">
        <div className="space-y-3">
          <h3 className="font-serif text-3xl font-semibold tracking-[-0.04em]">
            {title}
          </h3>
          <p className="text-sm leading-7 text-muted">{description}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {stack.map((item) => (
            <Badge key={item}>{item}</Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
