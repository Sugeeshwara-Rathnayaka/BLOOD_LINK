import usePagination from "../../hooks/usePagination";

export default function DonorList({ donors }) {
  const { currentPage, totalPages, currentItems, nextPage, previousPage } =
    usePagination(donors, 10);

  return (
    <div>
      <h2>Blood Donors</h2>

      {currentItems.map((donor) => (
        <p key={donor._id}>
          {donor.name} — {donor.bloodGroup}
        </p>
      ))}

      <button onClick={previousPage} disabled={currentPage === 1}>
        Previous
      </button>

      <span>
        Page {currentPage} of {totalPages}
      </span>

      <button onClick={nextPage} disabled={currentPage >= totalPages}>
        Next
      </button>
    </div>
  );
}
