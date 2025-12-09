"use client";

import { forwardRef, useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { PANABO_BARANGAYS, type Barangay } from "@/constants";

interface BarangaySelectProps {
    value?: string;
    onChange?: (value: Barangay) => void;
    error?: string;
    placeholder?: string;
    disabled?: boolean;
    required?: boolean;
}

export const BarangaySelect = forwardRef<HTMLButtonElement, BarangaySelectProps>(
    (
        {
            value,
            onChange,
            error,
            placeholder = "Select your barangay",
            disabled,
            required,
        },
        ref
    ) => {
        const [open, setOpen] = useState(false);

        return (
            <div className="relative">
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            ref={ref}
                            variant="outline"
                            role="combobox"
                            aria-expanded={open}
                            disabled={disabled}
                            className={cn(
                                "w-full justify-between h-11 px-3",
                                !value && "text-neutral-500 font-normal",
                                error
                                    ? "border-red-500 hover:border-red-500 focus:ring-red-500/20"
                                    : "border-neutral-200 hover:border-neutral-300 hover:bg-white",
                                "bg-white text-sm"
                            )}
                        >
                            <span className="truncate">
                                {value
                                    ? PANABO_BARANGAYS.find((barangay) => barangay === value)
                                    : placeholder}
                            </span>
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                        <Command>
                            <CommandInput placeholder="Search barangay..." />
                            <CommandList>
                                <CommandEmpty>No barangay found.</CommandEmpty>
                                <CommandGroup>
                                    {PANABO_BARANGAYS.map((barangay) => (
                                        <CommandItem
                                            key={barangay}
                                            value={barangay}
                                            onSelect={(currentValue) => {
                                                // value and currentValue might differ in case, but usually we want to preserve the constant value
                                                // Shadcn command usually lowercases value for search.
                                                // But let's find the original case from PANABO_BARANGAYS
                                                const original = PANABO_BARANGAYS.find(
                                                    (b) => b.toLowerCase() === currentValue.toLowerCase()
                                                );
                                                onChange?.((original || currentValue) as Barangay);
                                                setOpen(false);
                                            }}
                                        >
                                            <Check
                                                className={cn(
                                                    "mr-2 h-4 w-4",
                                                    value === barangay ? "opacity-100" : "opacity-0"
                                                )}
                                            />
                                            {barangay}
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>

                {/* Hidden input for form submission */}
                {required && (
                    <input
                        type="hidden"
                        value={value || ""}
                        required={required}
                        tabIndex={-1}
                    />
                )}
            </div>
        );
    }
);

BarangaySelect.displayName = "BarangaySelect";
