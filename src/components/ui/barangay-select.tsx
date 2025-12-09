"use client";

import { forwardRef, useState, useRef, useEffect } from "react";
import { MapPin, ChevronDown, Search, Check } from "lucide-react";
import { cn } from "@/lib/utils";
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
        const [isOpen, setIsOpen] = useState(false);
        const [searchQuery, setSearchQuery] = useState("");
        const containerRef = useRef<HTMLDivElement>(null);
        const searchInputRef = useRef<HTMLInputElement>(null);

        // Filter barangays based on search
        const filteredBarangays = PANABO_BARANGAYS.filter((barangay) =>
            barangay.toLowerCase().includes(searchQuery.toLowerCase())
        );

        // Close dropdown when clicking outside
        useEffect(() => {
            function handleClickOutside(event: MouseEvent) {
                if (
                    containerRef.current &&
                    !containerRef.current.contains(event.target as Node)
                ) {
                    setIsOpen(false);
                }
            }

            document.addEventListener("mousedown", handleClickOutside);
            return () => document.removeEventListener("mousedown", handleClickOutside);
        }, []);

        // Focus search input when dropdown opens
        useEffect(() => {
            if (isOpen && searchInputRef.current) {
                searchInputRef.current.focus();
            }
        }, [isOpen]);

        const handleSelect = (barangay: Barangay) => {
            onChange?.(barangay);
            setIsOpen(false);
            setSearchQuery("");
        };

        return (
            <div ref={containerRef} className="relative">
                <button
                    ref={ref}
                    type="button"
                    onClick={() => !disabled && setIsOpen(!isOpen)}
                    disabled={disabled}
                    className={cn(
                        "w-full h-11 px-3 pl-10 flex items-center justify-between",
                        "rounded-lg border bg-white text-sm transition-colors",
                        "focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500",
                        "disabled:opacity-50 disabled:cursor-not-allowed",
                        error
                            ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                            : "border-neutral-200 hover:border-neutral-300",
                        !value && "text-neutral-500"
                    )}
                >
                    <MapPin className="absolute left-3 w-5 h-5 text-neutral-400" />
                    <span className="truncate text-left flex-1">
                        {value || placeholder}
                    </span>
                    <ChevronDown
                        className={cn(
                            "w-4 h-4 text-neutral-400 transition-transform",
                            isOpen && "rotate-180"
                        )}
                    />
                </button>

                {/* Dropdown */}
                {isOpen && (
                    <div className="absolute z-50 w-full mt-1 bg-white rounded-lg border border-neutral-200 shadow-lg overflow-hidden">
                        {/* Search input */}
                        <div className="p-2 border-b border-neutral-100">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search barangay..."
                                    className="w-full h-9 pl-9 pr-3 rounded-md border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                                />
                            </div>
                        </div>

                        {/* Options list */}
                        <div className="max-h-60 overflow-y-auto">
                            {filteredBarangays.length === 0 ? (
                                <div className="px-3 py-4 text-sm text-neutral-500 text-center">
                                    No barangay found
                                </div>
                            ) : (
                                filteredBarangays.map((barangay) => (
                                    <button
                                        key={barangay}
                                        type="button"
                                        onClick={() => handleSelect(barangay)}
                                        className={cn(
                                            "w-full px-3 py-2.5 text-left text-sm flex items-center justify-between",
                                            "hover:bg-primary-50 transition-colors",
                                            value === barangay && "bg-primary-50 text-primary-700"
                                        )}
                                    >
                                        <span>{barangay}</span>
                                        {value === barangay && (
                                            <Check className="w-4 h-4 text-primary-600" />
                                        )}
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {/* Hidden input for form submission */}
                {required && (
                    <input
                        type="hidden"
                        value={value || ""}
                        required={required}
                    />
                )}
            </div>
        );
    }
);

BarangaySelect.displayName = "BarangaySelect";
