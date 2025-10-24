"use client";

import * as React from "react";

import { CirclePlus } from "lucide-react";

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

import { ROLES, ROLE_LABEL_MAP } from "@/constants";

interface RoleOption {
  label: string;
  value: string;
}

interface Props {
  value: string[];
  onChange: (value: string[]) => void;
}

export function FilterRoleTag(props: Props) {
  const { value, onChange } = props;
  const [open, setOpen] = React.useState(false);

  const roles: RoleOption[] = [
    {
      label: ROLE_LABEL_MAP[ROLES.admin],
      value: ROLES.admin,
    },
    {
      label: ROLE_LABEL_MAP[ROLES.visitor],
      value: ROLES.visitor,
    },
  ];

  return (
    <div>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="justify-start">
            <CirclePlus />
            <span>角色</span>
            {value.length > 0 && (
              <>
                <Separator orientation="vertical" />
                {value
                  .map((role) => roles.find((r) => r.value === role)?.label)
                  .map((el) => (
                    <Badge key={el}>{el}</Badge>
                  ))}
              </>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0" side="bottom" align="start">
          <Command>
            <CommandList>
              <CommandGroup>
                {roles.map((role) => (
                  <CommandItem
                    key={role.value}
                    value={role.value}
                    onSelect={(v) => {
                      onChange(
                        value.includes(v)
                          ? value.filter((el) => el !== v)
                          : [...value, v],
                      );
                    }}
                  >
                    <Checkbox checked={value.includes(role.value)} />
                    {role.label}
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
