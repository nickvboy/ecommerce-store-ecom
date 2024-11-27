import { useState } from 'react';
import { Slider } from "../components/ui/slider";

function PriceRangeSlider({ min, max, onChange }) {
  const [value, setValue] = useState([min, max]);

  const handleValueChange = (newValue) => {
    setValue(newValue);
    onChange(newValue);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <input 
            type="number" 
            value={value[0]}
            onChange={(e) => handleValueChange([parseInt(e.target.value), value[1]])}
            className="w-16 bg-bg-200 text-text-100 text-sm border-none focus:ring-0"
          />
        </div>
        <div className="flex items-center">
          <input 
            type="number"
            value={value[1]}
            onChange={(e) => handleValueChange([value[0], parseInt(e.target.value)])}
            className="w-16 bg-bg-200 text-text-100 text-sm border-none focus:ring-0"
          />
        </div>
      </div>
      
      <Slider
        defaultValue={value}
        max={max}
        min={min}
        step={1}
        value={value}
        onValueChange={handleValueChange}
        className="[&_[role=slider]]:bg-text-100"
      />
    </div>
  );
}

export default PriceRangeSlider; 