import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import './CustomSelect.css';

export default function CustomSelect({ options, value, onChange, placeholder, icon: Icon, required }) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const selectedOption = options.find(opt => opt.value === value);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (optionValue) => {
        onChange(optionValue);
        setIsOpen(false);
    };

    return (
        <div className={`custom-select-container ${isOpen ? 'is-open' : ''}`} ref={dropdownRef}>
            <div 
                className={`custom-select-trigger ${!value ? 'is-placeholder' : ''}`} 
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="trigger-content">
                    {Icon && <Icon size={16} className="trigger-icon" />}
                    <span className="trigger-text">
                        {selectedOption ? selectedOption.label : placeholder}
                    </span>
                </div>
                <ChevronDown size={16} className={`chevron-icon ${isOpen ? 'rotate' : ''}`} />
            </div>

            {isOpen && (
                <div className="custom-select-dropdown">
                    {options.map((option) => (
                        <div 
                            key={option.value} 
                            className={`custom-select-option ${value === option.value ? 'is-selected' : ''}`}
                            onClick={() => handleSelect(option.value)}
                        >
                            {option.label}
                        </div>
                    ))}
                    {options.length === 0 && (
                        <div className="custom-select-no-options">No options available</div>
                    )}
                </div>
            )}
            
            {required && !value && (
                <input 
                    tabIndex={-1} 
                    autoComplete="off" 
                    style={{ opacity: 0, height: 0, width: 0, position: 'absolute' }} 
                    required 
                    value="" 
                    readOnly 
                />
            )}
        </div>
    );
}
