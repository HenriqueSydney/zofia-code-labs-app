import { Pagination } from "../@types/Pagination";

export function getPaginationQuery(pagination?: Pagination) {
  let paginationQuery = {};
  if (pagination) {
    const page =
      pagination.page !== undefined ? Number(pagination.page) : undefined;
    const numberPerPage =
      pagination.numberPerPage !== undefined
        ? Number(pagination.numberPerPage)
        : undefined;

    if (page) {
      paginationQuery = {
        skip: (page - 1) * (numberPerPage ?? 10),
        take: numberPerPage,
      };
    }

    if (numberPerPage) {
      paginationQuery = {
        skip: ((page ?? 1) - 1) * numberPerPage,
        take: numberPerPage,
      };
    }
  }
  return paginationQuery;
}
