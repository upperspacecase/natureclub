"use client";

import { forwardRef } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

/**
 * Dark-themed date + time picker.
 *
 * Props:
 *  - value       : Date object or null
 *  - onChange     : (date: Date | null) => void
 *  - placeholder  : string
 */
export default function DateTimePicker({ value, onChange, placeholder }) {
    // Custom input — full-width clickable area
    const CustomInput = forwardRef(function CustomInputInner(
        { value: displayValue, onClick },
        ref
    ) {
        return (
            <button
                type="button"
                ref={ref}
                onClick={onClick}
                className="nc-dt-trigger w-full rounded-[5px] border border-white/35 bg-white/[0.04] px-4 py-3 text-left text-sm outline-none transition-colors focus:border-white/70 hover:border-white/50"
            >
                {displayValue ? (
                    <span className="text-white">{displayValue}</span>
                ) : (
                    <span className="text-white/60">
                        {placeholder || "Pick a date & time"}
                    </span>
                )}
            </button>
        );
    });

    return (
        <div className="nc-datepicker-wrapper">
            <DatePicker
                selected={value}
                onChange={onChange}
                showTimeSelect
                timeIntervals={15}
                timeCaption="Time"
                dateFormat="MMMM d, yyyy — h:mm aa"
                minDate={new Date()}
                placeholderText={placeholder || "Pick a date & time"}
                customInput={<CustomInput />}
                popperPlacement="bottom-start"
                popperModifiers={[
                    {
                        name: "offset",
                        options: { offset: [0, 8] },
                    },
                    {
                        name: "preventOverflow",
                        options: { boundary: "viewport" },
                    },
                ]}
                calendarClassName="nc-dark-calendar"
                showPopperArrow={false}
            />
        </div>
    );
}
