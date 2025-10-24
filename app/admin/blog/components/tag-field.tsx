"use client";

import * as React from "react";

import { CirclePlus } from "lucide-react";

import { type Tag } from "@/types/tag";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";

interface Props {
  tags: Tag[];
  value: string[];
  onChange: (value: string[]) => void;
}

export function TagField(props: Props) {
  const { value, onChange, tags } = props;
  const [open, setOpen] = React.useState(false);

  return (
    <div>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="justify-start">
            <CirclePlus />
            <span>标签</span>
            {value.length > 0 && (
              <>
                <Separator orientation="vertical" />
                {value
                  .map((id) => tags.find((r) => r.id === id))
                  .map((el) => (
                    <Badge key={el?.id}>{el?.name}</Badge>
                  ))}
              </>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0" side="bottom" align="start">
          <Command>
            <CommandList>
              <CommandGroup>
                {tags.map((tag) => (
                  <CommandItem
                    key={tag.id}
                    value={tag.id}
                    onSelect={(v) => {
                      onChange(
                        value.includes(v)
                          ? value.filter((el) => el !== v)
                          : [...value, v],
                      );
                    }}
                  >
                    <Checkbox checked={value.includes(tag.id)} />
                    {tag.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
