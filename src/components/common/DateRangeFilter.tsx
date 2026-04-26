import DatePicker from "../form/date-picker";

interface DateRangeFilterProps {
  fromDate: string;
  toDate: string;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
  fromPlaceholder?: string;
  toPlaceholder?: string;
  /** Optional unique suffix when more than one DateRangeFilter renders on the same page */
  idSuffix?: string;
}

/** Two flatpickr DatePickers wired as a from/to range. Emits ISO `YYYY-MM-DD` strings. */
const DateRangeFilter: React.FC<DateRangeFilterProps> = ({
  fromDate,
  toDate,
  onFromChange,
  onToChange,
  fromPlaceholder = "From date",
  toPlaceholder = "To date",
  idSuffix = "",
}) => {
  const fromId = `date-range-from${idSuffix ? `-${idSuffix}` : ""}`;
  const toId = `date-range-to${idSuffix ? `-${idSuffix}` : ""}`;

  return (
    <div className="flex flex-col sm:flex-row gap-2">
      <div className="w-full sm:w-44">
        <DatePicker
          id={fromId}
          placeholder={fromPlaceholder}
          defaultDate={fromDate || undefined}
          onChange={(_dates, dateStr) => onFromChange(dateStr || "")}
        />
      </div>
      <div className="w-full sm:w-44">
        <DatePicker
          id={toId}
          placeholder={toPlaceholder}
          defaultDate={toDate || undefined}
          onChange={(_dates, dateStr) => onToChange(dateStr || "")}
        />
      </div>
    </div>
  );
};

export default DateRangeFilter;
