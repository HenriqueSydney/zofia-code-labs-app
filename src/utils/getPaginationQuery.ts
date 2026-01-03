import { Pagination } from "../@types/Pagination";

export function getPaginationQuery(pagination?: Pagination) {
  let paginationQuery = {};
  if (pagination) {
    if (pagination.page) {
      paginationQuery = {
        skip: (pagination.page - 1) * (pagination.numberPerPage ?? 10),
        take: pagination.numberPerPage,
      };
    }

    if (pagination.numberPerPage) {
      paginationQuery = {
        skip: ((pagination.page ?? 1) - 1) * pagination.numberPerPage,
        take: pagination.numberPerPage,
      };
    }
  }
  return paginationQuery;
}
