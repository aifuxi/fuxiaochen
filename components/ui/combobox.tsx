'use client';

import * as React from 'react';

// 源代码来自：https://github.com/shadcn-ui/ui/issues/927#issuecomment-1788084995
// 根据自己需要做了部分修改
import { Check, ChevronDown, XSquare } from 'lucide-react';

import { cn } from '@/lib/utils';

import { Badge } from './badge';
import { Button } from './button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from './command';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { ScrollArea } from './scroll-area';

export type ComboboxOption = {
  value: string;
  label: string;
};

type ComboboxPropsSingle = {
  options: ComboboxOption[];
  emptyText?: string;
  clearable?: boolean;
  selectPlaceholder?: string;
  searchPlaceholder?: string;
  multiple?: false;
  value?: string;
  onValueChange?: (value: string) => void;
};

type ComboboxPropsMultiple = {
  options: ComboboxOption[];
  emptyText?: string;
  clearable?: boolean;
  selectPlaceholder?: string;
  searchPlaceholder?: string;
  multiple: true;
  value?: string[];
  onValueChange?: (value: string[]) => void;
};

export type ComboboxProps = ComboboxPropsSingle | ComboboxPropsMultiple;

export const handleSingleSelect = (
  props: ComboboxPropsSingle,
  option: ComboboxOption,
) => {
  if (props.clearable) {
    props.onValueChange?.(option.value === props.value ? '' : option.value);
  } else {
    props.onValueChange?.(option.value);
  }
};

export const handleMultipleSelect = (
  props: ComboboxPropsMultiple,
  option: ComboboxOption,
) => {
  if (props.value?.includes(option.value)) {
    if (!props.clearable && props.value.length === 1) return false;
    props.onValueChange?.(
      props.value.filter((value) => value !== option.value),
    );
  } else {
    props.onValueChange?.([...(props.value ?? []), option.value]);
  }
};

export const Combobox = React.forwardRef(
  (props: ComboboxProps, ref: React.ForwardedRef<HTMLInputElement>) => {
    const [open, setOpen] = React.useState(false);

    const tagMap = React.useMemo(() => {
      return new Map<string, string>(
        props?.options?.map((el) => [el.value, el.label]) ?? [],
      );
    }, [props?.options]);

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            role="combobox"
            variant="outline"
            aria-expanded={open}
            className="w-full justify-between hover:bg-secondary/20 active:scale-100"
          >
            <span className="line-clamp-1 text-left font-normal">
              {/* 多选 */}
              {props.multiple &&
                props.value &&
                Boolean(props.value.length) &&
                props.value?.map((el) => (
                  <Badge key={el} className="mr-2">
                    {tagMap.get(el)}
                  </Badge>
                ))}

              {/* 单选 */}
              {!props.multiple &&
                props.value &&
                props.value !== '' &&
                props?.options?.find((option) => option.value === props.value)
                  ?.label}

              {/* 空态 */}
              {(!props.value || props.value.length === 0) &&
                (props.selectPlaceholder ?? 'Select an option')}
            </span>
            <div className="flex h-full items-center shrink-0">
              {/* 多选时，显示清除全部按钮 */}
              {props.multiple && (
                <XSquare
                  className={cn(
                    'ml-2 h-4 w-4 opacity-50 hover:opacity-80 transition-opacity',
                  )}
                  onClick={(e) => {
                    props.onValueChange?.([]);

                    // 阻止冒泡，防止触发外层按钮的点击事件
                    e.stopPropagation();
                  }}
                />
              )}
              <ChevronDown
                className={cn(
                  'ml-2 h-4 w-4 rotate-0 opacity-50 transition-transform',
                  open && 'rotate-180',
                )}
              />
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="p-0">
          <Command>
            <CommandInput
              ref={ref}
              placeholder={props.searchPlaceholder ?? 'Search for an option'}
            />
            <CommandEmpty>{props.emptyText ?? 'No results found'}</CommandEmpty>
            <CommandGroup>
              <ScrollArea>
                <div className="max-h-60">
                  {props?.options?.map((option) => (
                    <CommandItem
                      key={option.value}
                      value={option.value.toLowerCase().trim()}
                      onSelect={(selectedValue) => {
                        const option = props?.options?.find(
                          (option) =>
                            option.value.toLowerCase().trim() === selectedValue,
                        );

                        if (!option) return null;

                        if (props.multiple) {
                          handleMultipleSelect(props, option);
                        } else {
                          handleSingleSelect(props, option);

                          setOpen(false);
                        }
                      }}
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4 opacity-0',
                          !props.multiple &&
                            props.value === option.value &&
                            'opacity-100',
                          props.multiple &&
                            props.value?.includes(option.value) &&
                            'opacity-100',
                        )}
                      />
                      {option.label}
                    </CommandItem>
                  ))}
                </div>
              </ScrollArea>
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    );
  },
);

Combobox.displayName = 'Combobox';
