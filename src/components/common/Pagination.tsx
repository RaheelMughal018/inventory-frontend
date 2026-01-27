interface PaginationProps {
  currentPage: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
}

const Pagination = ({ currentPage, pageSize, total, onPageChange }: PaginationProps) => {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const handlePrev = () => {
    if (currentPage > 1) onPageChange(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) onPageChange(currentPage + 1);
  };

  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    // limit to first, last, current +/-1, and ellipsis
    if (i === 1 || i === totalPages || Math.abs(i - currentPage) <= 1) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== -1) {
      pages.push(-1); // marker for ellipsis
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handlePrev}
        disabled={currentPage === 1}
        className="px-3 py-1 rounded-md border text-sm disabled:opacity-50 dark:text-white"
      >
        Prev
      </button>
      {pages.map((p, idx) =>
        p === -1 ? (
          <span key={`ellipsis-${idx}`} className="px-2 text-sm text-gray-500">
            ...
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`px-3 py-1 rounded-md border text-sm ${
              p === currentPage
                ? "bg-blue-600 text-white border-blue-600"
                : "hover:bg-gray-100"
            }`}
          >
            {p}
          </button>
        )
      )}
      <button
        onClick={handleNext}
        disabled={currentPage === totalPages}
        className="px-3 py-1 rounded-md border text-sm disabled:opacity-50 dark:text-white"
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
