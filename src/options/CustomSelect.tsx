/**
 * Custom Select component with dropdown panel.
 * Replaces native <select> with a styled dropdown similar to antd.
 */
import React, { useState, useRef, useEffect } from "react";

interface SelectOption {
    value: string;
    label: string;
}

interface CustomSelectProps {
    value: string;
    options: SelectOption[];
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
    value,
    options,
    onChange,
    placeholder = "Select...",
    className = "",
}) => {
    const [open, setOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find((o) => o.value === value);

    // Close on outside click
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        if (open) {
            document.addEventListener("mousedown", handleClick);
        }
        return () => document.removeEventListener("mousedown", handleClick);
    }, [open]);

    // Close on Escape
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setOpen(false);
        };
        if (open) {
            document.addEventListener("keydown", handleKey);
        }
        return () => document.removeEventListener("keydown", handleKey);
    }, [open]);

    return (
        <div className={`custom-select ${className} ${open ? "open" : ""}`} ref={containerRef}>
            <button
                type="button"
                className="custom-select-trigger"
                onClick={() => setOpen(!open)}
                aria-expanded={open}
                aria-haspopup="listbox"
            >
                <span className={`custom-select-value ${!selectedOption ? "placeholder" : ""}`}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <svg
                    className="custom-select-arrow"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                >
                    <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6z" />
                </svg>
            </button>

            {open && (
                <div className="custom-select-dropdown" role="listbox">
                    {options.map((option) => (
                        <div
                            key={option.value}
                            className={`custom-select-option ${option.value === value ? "selected" : ""}`}
                            role="option"
                            aria-selected={option.value === value}
                            onClick={() => {
                                onChange(option.value);
                                setOpen(false);
                            }}
                        >
                            <span className="custom-select-option-label">{option.label}</span>
                            {option.value === value && (
                                <svg
                                    className="custom-select-check"
                                    width="14"
                                    height="14"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                >
                                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                                </svg>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
