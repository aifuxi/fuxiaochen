"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { PreviewCard } from "../preview-card";

export function InputPreview() {
  return (
    <>
      <PreviewCard title="Input">
        <Input className="w-64" placeholder="Default input" />
        <Input className="w-64" placeholder="With value" defaultValue="Some text" />
        <Input className="w-64" placeholder="Disabled" disabled />
      </PreviewCard>

      <PreviewCard title="Textarea">
        <Textarea className="w-64" placeholder="Enter your message..." />
        <Textarea className="w-64" placeholder="Disabled" disabled />
      </PreviewCard>

      <PreviewCard title="Select">
        <Select>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select option" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">Option 1</SelectItem>
            <SelectItem value="2">Option 2</SelectItem>
            <SelectItem value="3">Option 3</SelectItem>
          </SelectContent>
        </Select>
        <Select>
          <SelectTrigger size="sm" className="w-48">
            <SelectValue placeholder="Small size" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">Option 1</SelectItem>
            <SelectItem value="2">Option 2</SelectItem>
          </SelectContent>
        </Select>
      </PreviewCard>

      <PreviewCard title="Checkbox">
        <div className="flex items-center gap-2">
          <Checkbox id="checked" defaultChecked />
          <Label htmlFor="checked">Checked</Label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox id="unchecked" />
          <Label htmlFor="unchecked">Unchecked</Label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox id="disabled" disabled />
          <Label htmlFor="disabled">Disabled</Label>
        </div>
      </PreviewCard>

      <PreviewCard title="Switch">
        <div className="flex items-center gap-2">
          <Switch id="switch-on" defaultChecked />
          <Label htmlFor="switch-on">On</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch id="switch-off" />
          <Label htmlFor="switch-off">Off</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch id="switch-disabled" disabled />
          <Label htmlFor="switch-disabled">Disabled</Label>
        </div>
      </PreviewCard>

      <PreviewCard title="RadioGroup">
        <RadioGroup defaultValue="option1">
          <div className="flex items-center gap-2">
            <RadioGroupItem value="option1" id="r1" />
            <Label htmlFor="r1">Option 1</Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="option2" id="r2" />
            <Label htmlFor="r2">Option 2</Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="option3" id="r3" />
            <Label htmlFor="r3">Option 3</Label>
          </div>
        </RadioGroup>
      </PreviewCard>

      <PreviewCard title="Label">
        <div className="space-y-2">
          <Label htmlFor="label-input">Label with Input</Label>
          <Input id="label-input" className="w-64" placeholder="Enter value" />
        </div>
      </PreviewCard>
    </>
  );
}
