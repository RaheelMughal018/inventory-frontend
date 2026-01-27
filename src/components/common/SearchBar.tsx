import { FormEvent } from "react";
import Input from "../form/input/InputField";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder?: string;
}

const SearchBar = ({ value, onChange, onSubmit, placeholder }: SearchBarProps) => {
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-3 items-center w-full sm:w-auto">
      <div className="w-full sm:w-64">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || "Search..."}
        />
      </div>
      <button
        type="submit"
        className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700 transition-colors"
      >
        Search
      </button>
    </form>
  );
};

export default SearchBar;
