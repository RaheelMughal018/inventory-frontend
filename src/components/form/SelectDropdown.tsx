// components/common/SelectDropdown.tsx
import React, { useState, useEffect, useRef } from "react";
import Label from "./Label";

interface SelectOption {
  id: string | number;
  name: string;
  [key: string]: any; // Allow additional properties
}

interface SelectDropdownProps {
  options: SelectOption[];
  value?: string | number;
  onChange: (value: string | number) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  searchable?: boolean;
  /** When searchable, called when user types in the search input (e.g. to trigger API search) */
  onSearchChange?: (term: string) => void;
  /** When true and onSearchChange is provided, options are from API (no client-side filter) */
  optionsAreFiltered?: boolean;
  error?: string;
  name?: string;
  displayKey?: string; // Custom display key (default: "name")
  valueKey?: string; // Custom value key (default: "id")
  className?: string; // Outer container class
  triggerClassName?: string; // Closed state trigger/button styling
  listClassName?: string; // Options list container (e.g. max-h-80 for taller dropdown in modals)
}

const SelectDropdown: React.FC<SelectDropdownProps> = ({
  options,
  value,
  onChange,
  label,
  placeholder = "Select an option...",
  required = false,
  disabled = false,
  searchable = true,
  onSearchChange,
  optionsAreFiltered = false,
  error,
  name,
  displayKey = "name",
  valueKey = "id",
  className = "",
  triggerClassName = "",
  listClassName,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Get selected option
  const selectedOption = options.find(
    (opt) => String(opt[valueKey]) === String(value),
  );

  // Filter options: use API-filtered list when optionsAreFiltered, else client-side filter
  const filteredOptions =
    searchable && optionsAreFiltered
      ? options
      : searchable
        ? options.filter((option) =>
            String(option[displayKey])
              .toLowerCase()
              .includes(searchTerm.toLowerCase()),
          )
        : options;

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchTerm("");
        setFocusedIndex(-1);
        onSearchChange?.("");
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen, onSearchChange]);

  // Focus input when dropdown opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSelect = (selectedValue: string | number) => {
    onChange(selectedValue);
    setIsOpen(false);
    setSearchTerm("");
    setFocusedIndex(-1);
    onSearchChange?.("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setFocusedIndex((prev) =>
          prev < filteredOptions.length - 1 ? prev + 1 : prev,
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setFocusedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (focusedIndex >= 0 && filteredOptions[focusedIndex]) {
          handleSelect(filteredOptions[focusedIndex][valueKey]);
        }
        break;
      case "Escape":
        setIsOpen(false);
        setSearchTerm("");
        setFocusedIndex(-1);
        break;
    }
  };

  const getDisplayValue = (option: SelectOption) => {
    return option[displayKey] || String(option[valueKey]);
  };

  return (
    <div className={`relative ${className}`}>
      {label && (
        <Label htmlFor={name}>
          {label} {required && <span className="text-red-500">*</span>}
        </Label>
      )}

      <div ref={dropdownRef} className="relative">
        <div
          onClick={() => !disabled && setIsOpen(!isOpen)}
          onKeyDown={handleKeyDown}
          className={`relative ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
          role="combobox"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-labelledby={label}
        >
          <input type="hidden" name={name} value={value || ""} readOnly />

          <div
            className={`h-11 w-full rounded-lg border ${
              error
                ? "border-red-300 dark:border-red-500"
                : "border-gray-300 dark:border-gray-700"
            } bg-transparent px-4 py-2.5 text-sm shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800 ${
              disabled
                ? "cursor-not-allowed bg-gray-50 dark:bg-gray-800"
                : "cursor-pointer"
            } ${triggerClassName}`}
          >
            {selectedOption ? (
              <span
                className="text-gray-800 dark:text-white/90 block min-w-0 truncate pr-6"
                title={getDisplayValue(selectedOption)}
              >
                {getDisplayValue(selectedOption)}
              </span>
            ) : (
              <span className="text-gray-400 dark:text-gray-400">
                {placeholder}
              </span>
            )}
            <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg
                className={`w-5 h-5 text-gray-500 transition-transform ${
                  isOpen ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </span>
          </div>
        </div>

        {error && (
          <p className="mt-1 text-xs text-red-500 dark:text-red-400">{error}</p>
        )}

        {isOpen && (
          <div
            className={`absolute z-50 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 dark:bg-gray-900 dark:border-gray-700 overflow-hidden ${listClassName ? "max-h-[min(24rem,70vh)]" : "max-h-60"}`}
            role="listbox"
          >
            {/* Search Input (if searchable) */}
            {searchable && (
              <div className="p-2 border-b border-gray-200 dark:border-gray-700 shrink-0">
                <input
                  ref={inputRef}
                  type="text"
                  placeholder={`Search ${label?.toLowerCase() || "options"}...`}
                  value={searchTerm}
                  onChange={(e) => {
                    const term = e.target.value;
                    setSearchTerm(term);
                    setFocusedIndex(-1);
                    onSearchChange?.(term);
                  }}
                  onKeyDown={handleKeyDown}
                  className="h-9 w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                />
              </div>
            )}

            {/* Options List */}
            <div className={`overflow-y-auto ${listClassName ?? "max-h-48"}`}>
              {filteredOptions.length === 0 ? (
                <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 text-center">
                  No options found
                </div>
              ) : (
                filteredOptions.map((option, index) => {
                  const optionValue = option[valueKey];
                  const isSelected = String(value) === String(optionValue);
                  const isFocused = index === focusedIndex;

                  return (
                    <div
                      key={optionValue}
                      className={`px-4 py-2 cursor-pointer transition-colors ${
                        isFocused || isSelected
                          ? "bg-blue-50 dark:bg-blue-900/20"
                          : "hover:bg-gray-50 dark:hover:bg-gray-800"
                      } ${isSelected ? "font-medium" : ""}`}
                      onClick={() => handleSelect(optionValue)}
                      role="option"
                      aria-selected={isSelected}
                    >
                      <span className="text-gray-800 dark:text-white/90">
                        {getDisplayValue(option)}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SelectDropdown;
