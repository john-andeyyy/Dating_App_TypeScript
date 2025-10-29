import { useState, useEffect } from "react";
import GlobalModal from "./GlobalModal";
interface AgeRangeModalProps {
    isOpen: boolean;
    onClose: () => void;
    minAge: number;
    maxAge: number;
    onApply: (minAge: number, maxAge: number, radius: number) => void;
    useAgeFilter: boolean;
    onToggleUseAgeFilter: (value: boolean) => void;
    radius: number;
    onRadiusChange: (value: number) => void;
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
}: AgeRangeModalProps) {
    const [localMin, setLocalMin] = useState<number>(minAge);
    const [localMax, setLocalMax] = useState<number>(maxAge);
    const [localRadius, setLocalRadius] = useState<number>(radius || 20);

    useEffect(() => {
        setLocalMin(minAge);
        setLocalMax(maxAge);
        setLocalRadius(radius || 20);
    }, [minAge, maxAge, radius, isOpen]);

    return (
        // Modal for changing age range and radius
        <GlobalModal
            isOpen={isOpen}
            onClose={onClose}
            title="Change Age Range & Radius"
            actions={
                <>
                    <button className="btn bg-accent text-white" onClick={onClose}>
                        Cancel
                    </button>
                    <button
                        className="btn bg-accent text-white"
                        onClick={() => onApply(localMin, localMax, localRadius)}
                    >
                        Apply
                    </button>

                </>
            }
        >
            <div className="flex items-center gap-2 mt-4">
                <input
                    type="checkbox"
                    checked={useAgeFilter}
                    onChange={(e) => onToggleUseAgeFilter(e.target.checked)}
                    className="checkbox checkbox-accent"
                    id="ageFilterCheckbox"
                />
                <label htmlFor="ageFilterCheckbox">Use Age Filter</label>
            </div>

            {useAgeFilter && (
                <div className="flex justify-between gap-4 mt-4">
                    <div className="flex flex-col">
                        <label className="mb-1">Min Age</label>
                        <input
                            type="number"
                            value={localMin}
                            disabled={!useAgeFilter}
                            min={18}
                            max={99}
                            onChange={(e) => setLocalMin(Number(e.target.value))}
                            className="input input-bordered w-24 rounded-lg focus:border-pink-500 focus:ring focus:ring-pink-500/20"
                        />
                    </div>

                    <div className="flex flex-col">
                        <label className="mb-1">Max Age</label>
                        <input
                            type="number"
                            value={localMax}
                            disabled={!useAgeFilter}
                            min={18}
                            max={99}
                            onChange={(e) => setLocalMax(Number(e.target.value))}
                            className="input input-bordered w-24 rounded-lg focus:border-pink-500 focus:ring focus:ring-pink-500/20"
                        />
                    </div>
                </div>
            )}

            {/* // Radius slider */}
            <div className="flex flex-col mt-4">
                <label className="mb-1">Radius (km): {localRadius}</label>
                <input
                    type="range"
                    min={1}
                    max={1000}
                    value={localRadius}
                    onChange={(e) => setLocalRadius(Number(e.target.value))}
                    className="range range-accent"
                />
            </div>
        </GlobalModal>
    );
}
