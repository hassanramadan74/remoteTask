import React, { useMemo } from "react";
import { useTable, useFilters, usePagination } from "react-table";
import ReactPaginate from "react-paginate";
import { Helmet } from "react-helmet";
import dataFile from "../../data/FMSCA_records.json";


function DefaultColumnFilter({
  column: { filterValue, preFilteredRows, setFilter },
}) {
  const count = preFilteredRows.length;

  return (
    <input
      value={filterValue || ''}
      onChange={e => {
        setFilter(e.target.value || undefined); 
      }}
      placeholder={`Search ${count} records...`}
      className="form-control"
    />
  );
}

export default function Home() {
  const data = useMemo(() => dataFile.FMSCA_records, []);

  const columns = useMemo(() => [
    { Header: 'Created Date', accessor: 'created_dt', Filter: DefaultColumnFilter, filter: 'text' },
    { Header: 'Modified Date', accessor: 'data_source_modified_dt', Filter: DefaultColumnFilter, filter: 'text' },
    { Header: 'Entity Type', accessor: 'entity_type', Filter: DefaultColumnFilter, filter: 'text' },
    { Header: 'Legal Name', accessor: 'legal_name', Filter: DefaultColumnFilter, filter: 'text' },
    { Header: 'DBA Name', accessor: 'dba_name', Filter: DefaultColumnFilter, filter: 'text' },
    { Header: 'Physical Address', accessor: 'physical_address', Filter: DefaultColumnFilter, filter: 'text' },
    { Header: 'City', accessor: 'p_city', Filter: DefaultColumnFilter, filter: 'text' },
    { Header: 'State', accessor: 'p_state', Filter: DefaultColumnFilter, filter: 'text' },
    { Header: 'Zip Code', accessor: 'p_zip_code', Filter: DefaultColumnFilter, filter: 'text' },
    { Header: 'Phone', accessor: 'phone', Filter: DefaultColumnFilter, filter: 'text' },
    { Header: 'USDOT Number', accessor: 'usdot_number', Filter: DefaultColumnFilter, filter: 'text' },
    { Header: 'Power Units', accessor: 'power_units', Filter: DefaultColumnFilter, filter: 'text' },
    { Header: 'Drivers', accessor: 'drivers', Filter: DefaultColumnFilter, filter: 'text' },
    { Header: 'Mileage Year', accessor: 'mcs_150_mileage_year', Filter: DefaultColumnFilter, filter: 'text' },
    { Header: 'Record Status', accessor: 'record_status', Filter: DefaultColumnFilter, filter: 'text' }
  ], []);

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page,
    canPreviousPage,
    canNextPage,
    pageOptions,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    state: { pageIndex, pageSize }
  } = useTable(
    {
      columns,
      data,
      initialState: { pageIndex: 0, pageSize: 10 }
    },
    useFilters,
    usePagination
  );

  return (
    <>
      <Helmet>
        <title>Home</title>
      </Helmet>
      <table {...getTableProps()} className="table table-striped table-bordered">
        <thead className="thead-dark">
          {headerGroups.map(headerGroup => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map(column => (
                <th {...column.getHeaderProps()}>
                  {column.render('Header')}
                  <div>{column.canFilter ? column.render('Filter') : null}</div>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {page.map(row => {
            prepareRow(row);
            return (
              <tr {...row.getRowProps()}>
                {row.cells.map(cell => (
                  <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="d-flex justify-content-center align-items-center my-5">
      <div className="pagination ">
        <button onClick={() => gotoPage(0)} disabled={!canPreviousPage} className="btn btn-primary mx-1">
          {'<<'}
        </button>
        <button onClick={() => previousPage()} disabled={!canPreviousPage} className="btn btn-primary mx-1">
          {'<'}
        </button>
        <button onClick={() => nextPage()} disabled={!canNextPage} className="btn btn-primary mx-1">
          {'>'}
        </button>
        <button onClick={() => gotoPage(pageCount - 1)} disabled={!canNextPage} className="btn btn-primary mx-1">
          {'>>'}
        </button>
        <span className="mx-2">
          Page{' '}
          <strong>
            {pageIndex + 1} of {pageOptions.length}
          </strong>{' '}
        </span>
        <select
          value={pageSize}
          onChange={e => setPageSize(Number(e.target.value))}
          className="form-control w-auto d-inline"
        >
          {[10, 20, 30, 40, 50].map(pageSize => (
            <option key={pageSize} value={pageSize}>
              Show {pageSize}
            </option>
          ))}
        </select>
      </div>
      </div>
    </>
  );
}
