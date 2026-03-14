function parsePagination(query) {
  const offset = Number.parseInt(query.offset, 10);
  const limits = Number.parseInt(query.limits, 10);

  return {
    offset: Number.isNaN(offset) ? 1 : offset,
    limits: Number.isNaN(limits) ? 10 : limits
  };
}

function toDbOffset(offset, limits) {
  const page = Math.max(1, offset);
  const size = Math.max(1, limits);
  return (page - 1) * size;
}

function formatPagination(list, total, offset, limits) {
  return {
    list,
    total,
    offset,
    limits
  };
}

module.exports = { parsePagination, formatPagination, toDbOffset };
