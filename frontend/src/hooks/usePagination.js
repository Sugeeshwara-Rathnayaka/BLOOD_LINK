import { useState } from "react";

export default function usePagination(items, itemsPerPage = 10) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(items.length / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;

  const currentItems = items.slice(startIndex, startIndex + itemsPerPage);

  const nextPage = () => {
    setCurrentPage((page) => Math.min(page + 1, totalPages || 1));
  };

  const previousPage = () => {
    setCurrentPage((page) => Math.max(page - 1, 1));
  };

  return {
    currentPage,
    totalPages,
    currentItems,
    nextPage,
    previousPage,
    setCurrentPage,
  };
}
