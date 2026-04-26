import Input from "../form/input/InputField";

interface DateRangeFilterProps {
  fromDate: string;
  toDate: string;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
  fromLabel?: string;
  toLabel?: string;
}

const DateRangeFilter: React.FC<DateRangeFilterProps> = ({
  fromDate,
  toDate,
  onFromChange,
  onToChange,
  fromLabel = "From",
  toLabel = "To",
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-2">
      <div className="w-full sm:w-40">
        <Input
          type="date"
          value={fromDate}
          onChange={(e) => onFromChange(e.target.value)}
          placeholder={fromLabel}
          max={toDate || undefined}
        />
      </div>
      <div className="w-full sm:w-40">
        <Input
          type="date"
          value={toDate}
          onChange={(e) => onToChange(e.target.value)}
          placeholder={toLabel}
          min={fromDate || undefined}
        />
      </div>
    </div>
  );
};

export default DateRangeFilter;
