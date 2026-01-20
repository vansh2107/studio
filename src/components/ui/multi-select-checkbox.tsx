
"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "./badge"
import { Checkbox } from "./checkbox"

export interface Option {
  value: string
  label: string
}

interface MultiSelectCheckboxProps {
  options: Option[]
  selected: string[]
  onChange: React.Dispatch<React.SetStateAction<string[]>>
  className?: string
  placeholder?: string
}

function MultiSelectCheckbox({
  options,
  selected,
  onChange,
  className,
  placeholder = "Select members...",
  ...props
}: MultiSelectCheckboxProps) {
  const [open, setOpen] = React.useState(false)

  const handleSelect = (value: string) => {
    // If user clicks "all", it should toggle between all or none.
    if (value === "all") {
      onChange(selected.includes("all") ? [] : ["all"])
      return
    }

    // If "all" is currently selected, and user clicks an individual item,
    // the new selection should be all items *except* the one clicked.
    let newSelection: string[]
    if (selected.includes("all")) {
      newSelection = options
        .filter((option) => option.value !== "all" && option.value !== value)
        .map((option) => option.value)
    } else {
      // Standard toggle logic
      newSelection = selected.includes(value)
        ? selected.filter((item) => item !== value)
        : [...selected, value]
    }

    // If all individual items are selected, switch to "all"
    const allItemValues = options.filter(o => o.value !== 'all').map(o => o.value);
    if (newSelection.length === allItemValues.length) {
      onChange(["all"])
    } else {
      onChange(newSelection)
    }
  }

  const isAllSelected = selected.includes("all");

  const selectedLabels = options
    .filter((option) => !isAllSelected && selected.includes(option.value))
    .map((option) => option.label)


  return (
    <Popover open={open} onOpenChange={setOpen} {...props}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between h-auto min-h-10", className)}
          onClick={() => setOpen(!open)}
        >
          <div className="flex gap-1 flex-wrap">
            {isAllSelected ? (
              <Badge variant="secondary">All Members</Badge>
            ) : selectedLabels.length > 0 ? (
               selectedLabels.length > 2 ? (
                <Badge variant="secondary">{selectedLabels.length} members selected</Badge>
               ) : (
                selectedLabels.map(label => (
                    <Badge variant="secondary" key={label}>{label}</Badge>
                ))
               )
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </div>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
        <Command>
          <CommandInput placeholder="Search members..." />
          <CommandList>
            <CommandEmpty>No member found.</CommandEmpty>
            <CommandGroup>
              <CommandItem
                onSelect={() => handleSelect("all")}
                className="flex items-center"
              >
                <Checkbox
                  id="select-all"
                  checked={isAllSelected}
                  className="mr-2"
                />
                <label htmlFor="select-all" className="cursor-pointer flex-1">All Members</label>
              </CommandItem>
              {options.filter(option => option.value !== 'all').map((option) => {
                const isSelected = isAllSelected || selected.includes(option.value)
                return (
                  <CommandItem
                    key={option.value}
                    onSelect={() => handleSelect(option.value)}
                    className="flex items-center"
                  >
                    <Checkbox
                      id={option.value}
                      checked={isSelected}
                      className="mr-2"
                    />
                     <label htmlFor={option.value} className="cursor-pointer flex-1">{option.label}</label>
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

export { MultiSelectCheckbox }
