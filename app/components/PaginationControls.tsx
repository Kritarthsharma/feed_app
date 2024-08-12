interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPreviousPage: () => void;
  onNextPage: () => void;
}

const PaginationControls: React.FC<PaginationControlsProps> = ({
  currentPage,
  totalPages,
  onPreviousPage,
  onNextPage,
}) => {
  return (
    <div className="flex justify-between mt-4">
      <button
        className="bg-gray-300 text-black px-4 py-2 rounded"
        onClick={onPreviousPage}
        disabled={currentPage === 1}
      >
        Previous
      </button>
      <span className="text-black">
        Page {currentPage} of {totalPages}
      </span>
      <button
        className="bg-gray-300 text-black px-4 py-2 rounded"
        onClick={onNextPage}
        disabled={currentPage === totalPages}
      >
        Next
      </button>
    </div>
  );
};

export default PaginationControls;
