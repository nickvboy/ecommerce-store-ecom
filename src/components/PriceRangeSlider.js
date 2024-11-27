import { useState } from 'react';
import { Slider } from "../components/ui/slider";

function PriceRangeSlider({ min, max, onChange }) {
  const [localValue, setLocalValue] = useState([min, max]);

  const handleValueChange = (newValue) => {
    setLocalValue(newValue);
  };

  const handleValueCommit = (newValue) => {
    setLocalValue(newValue);
    onChange(newValue);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <input 
            type="number" 
            value={localValue[0]}
            onChange={(e) => {
              const newValue = [parseInt(e.target.value), localValue[1]];
              setLocalValue(newValue);
              onChange(newValue);
            }}
            className="w-16 bg-bg-200 text-text-100 text-sm border-none focus:ring-0"
          />
        </div>
        <div className="flex items-center">
          <input 
            type="number"
            value={localValue[1]}
            onChange={(e) => {
              const newValue = [localValue[0], parseInt(e.target.value)];
              setLocalValue(newValue);
              onChange(newValue);
            }}
            className="w-16 bg-bg-200 text-text-100 text-sm border-none focus:ring-0"
          />
        </div>
      </div>
      
      <Slider
        defaultValue={localValue}
        max={max}
        min={min}
        step={1}
        value={localValue}
        onValueChange={handleValueChange}
        onValueCommit={handleValueCommit}
        className="[&_[role=slider]]:bg-text-100"
      />
    </div>
  );
}

export default PriceRangeSlider; 