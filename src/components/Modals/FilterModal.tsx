import { useState, useEffect } from "react";
import GlobalModal from "./GlobalModal";

interface AgeRangeModalProps {
    isOpen: boolean;
    onClose: () => void;
    minAge: number;
    maxAge: number;
    onApply: (
        minAge: number,
        maxAge: number,
        radius: number,
        interestGender: string
    ) => void;
    useAgeFilter: boolean;
    onToggleUseAgeFilter: (value: boolean) => void;
    radius: number;
    onRadiusChange: (value: number) => void;
    interestedIn: string;
}

export default function AgeRangeModal({
    isOpen,
    onClose,
    minAge,
    maxAge,
    onApply,
    useAgeFilter,
    onToggleUseAgeFilter,
    radius,
    interestedIn,
}: AgeRangeModalProps) {
    //  allow empty string for controlled <input type="number">
    const [MinAge, setMinAge] = useState<number | "">(minAge);
    const [MaxAge, setMaxAge] = useState<number | "">(maxAge);
    const [InterestGender, setInterestGender] = useState<string>(interestedIn || "All");
    const [localRadius, setLocalRadius] = useState<number>(radius || 20);
    const [error, setError] = useState<string>("");

    //  Reset values when modal opens
    useEffect(() => {
        setMinAge(minAge);
        setMaxAge(maxAge);
        setLocalRadius(radius || 20);
        setError("");
    }, [minAge, maxAge, radius, isOpen]);

    // Sync local InterestGender when prop changes or modal opens
    useEffect(() => {
        setInterestGender(interestedIn || "All");
    }, [interestedIn, isOpen]);

    //  Apply filters with proper validation
    const handleApply = () => {
        if (useAgeFilter) {
            if (MinAge === "" || MaxAge === "") {
                setError("Please enter both Min and Max age");
                return;
            }
            if (MinAge > MaxAge) {
                setError("Min age cannot be higher than Max age");
                return;
            }
        }
        setError("");
        onApply(
            Number(MinAge) || minAge,
            Number(MaxAge) || maxAge,
            localRadius,
            InterestGender
        );
    };

    return (
        <GlobalModal
            isOpen={isOpen}
            onClose={onClose}
            title="Change Filters"
            actions={
                <>
                    <button
                        className="btn bg-gray-200 text-gray-800"
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                    <button
                        className="btn bg-accent text-white hover:bg-accent/90"
                        onClick={handleApply}
                    >
                        Apply
                    </button>
                </>
            }
        >
            {/*  Age Filter Toggle */}
            <div className="flex items-center gap-2 mt-4">
                <input
                    type="checkbox"
                    checked={useAgeFilter}
                    onChange={(e) => onToggleUseAgeFilter(e.target.checked)}
                    className="checkbox checkbox-accent"
                    id="ageFilterCheckbox"
                />
                <label htmlFor="ageFilterCheckbox" className="text-sm font-medium">
                    Use Age Filter
                </label>
            </div>

            {/*  Age Range Inputs */}
            {useAgeFilter && (
                <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="flex flex-col">
                        <label className="mb-1 text-sm font-medium">Min Age</label>
                        <input
                            type="number"
                            value={MinAge}
                            min={18}
                            max={99}
                            onChange={(e) => {
                                const value = e.target.value === "" ? "" : Number(e.target.value);

                                if (value !== "" && (value < 18 || value > 99)) {
                                    setError("Min age must be between 18");
                                    return;
                                }

                                setError("");
                                setMinAge(value);
                            }}
                            className={`input w-full  ${error && MinAge === "" ? "border-red-500" : ""
                                }`}
                        />
                    </div>

                    <div className="flex flex-col">
                        <label className="mb-1 text-sm font-medium">Max Age</label>
                        <input
                            type="number"
                            value={MaxAge}
                            min={18}
                            max={99}
                            onChange={(e) =>
                                setMaxAge(
                                    e.target.value === "" ? "" : Number(e.target.value)
                                )
                            }
                            className={`input input-bordered w-full rounded-lg  ${error && MaxAge === "" ? "border-red-500" : ""
                                }`}
                        />
                    </div>
                </div>
            )}

            {/*  Error message */}
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

            {/*  Radius Slider */}
            <div className="flex flex-col mt-6">
                <label className="mb-1 text-sm font-medium">
                    Radius (km):{" "}
                    <span className="font-semibold">{localRadius}</span>
                </label>
                <input
                    type="range"
                    min={1}
                    max={500}
                    value={localRadius}
                    onChange={(e) => setLocalRadius(Number(e.target.value))}
                    className="range range-accent"
                />
            </div>

            {/*  Interested In Dropdown */}
            <div className="pt-6">
                <label
                    htmlFor="interestedIn"
                    className="text-sm font-medium mr-2"
                >
                    Interested In:
                </label>
                <select
                    id="interestedIn"
                    name="interestedIn"
                    value={InterestGender}
                    onChange={(e) => setInterestGender(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
                >
                    <option value="All">All</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                </select>
            </div>
        </GlobalModal>
    );
}
