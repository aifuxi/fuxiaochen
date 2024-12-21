import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { formatToDatetime, localFormatDistanceToNow } from "@/utils/date";

type CreateTimeTooltipProps = {
  date: Date;
};

export const CreateTimeTooltip = ({ date }: CreateTimeTooltipProps) => {
  return (
    <Tooltip>
      <TooltipTrigger>{localFormatDistanceToNow(date)}</TooltipTrigger>
      <TooltipContent>
        <p>{formatToDatetime(date)}</p>
      </TooltipContent>
    </Tooltip>
  );
};
