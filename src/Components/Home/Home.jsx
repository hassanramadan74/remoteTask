import React, { useMemo, useState } from "react";
import { useTable, useFilters, usePagination, useSortBy } from "react-table";
import { Helmet } from "react-helmet";
import { format, parseISO, getMonth, getYear, getWeek } from "date-fns";
import dataFile from "../../data/FMSCA_records.json";
import { Modal, Button } from "react-bootstrap";

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
  const [dateGroup, setDateGroup] = useState('none'); // State for grouping dates
  const [modalShow, setModalShow] = useState({}); // State for showing modals

  // Helper function to format and group dates
  const formatDate = (date, group) => {
    const parsedDate = parseISO(date);
    const formattedDate = format(parsedDate, 'yyyy-MM-dd HH:mm:ss');
    
    switch (group) {
      case 'month':
        return format(parsedDate, 'MMMM yyyy');
      case 'week':
        return `Week ${getWeek(parsedDate)}, ${getYear(parsedDate)}`;
      case 'year':
        return format(parsedDate, 'yyyy');
      default:
        return formattedDate;
    }
  };

  const data = useMemo(() => {
    return dataFile.FMSCA_records.map(record => ({
      ...record,
      created_dt: formatDate(record.created_dt, dateGroup),
      data_source_modified_dt: formatDate(record.data_source_modified_dt, dateGroup),
    }));
  }, [dateGroup]);

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
    useSortBy,
    usePagination
  );

  const handleShow = (columnId) => {
    setModalShow(prev => ({ ...prev, [columnId]: true }));
  };

  const handleClose = (columnId) => {
    setModalShow(prev => ({ ...prev, [columnId]: false }));
  };

  return (
    <>
      <Helmet>
        <title>Home</title>
      </Helmet>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <label className="mr-4">Group Dates By : </label>
          <select
            value={dateGroup}
            onChange={e => setDateGroup(e.target.value)}
            className="form-control w-auto d-inline"
          >
            <option value="none">None</option>
            <option value="month">Month</option>
            <option value="week">Week</option>
            <option value="year">Year</option>
          </select>
        </div>
      </div>
      <table {...getTableProps()} className="table">
        <thead className="thead-dark text-center">
          {headerGroups.map(headerGroup => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map(column => (
                <th {...column.getHeaderProps(column.getSortByToggleProps())}>
                  {column.render('Header')}
                  <div>
                    <Button
                      variant="link"
                      onClick={() => handleShow(column.id)}
                    >
                      Filter
                    </Button>
                  </div>
                  <span>
                    {column.isSorted
                      ? column.isSortedDesc
                        ? ' 🔽'
                        : ' 🔼'
                      : ''}
                  </span>
                  <Modal show={modalShow[column.id]} onHide={() => handleClose(column.id)}>
                    <Modal.Header closeButton>
                      <Modal.Title>Filter {column.render('Header')}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                      {column.canFilter ? column.render('Filter') : null}
                    </Modal.Body>
                    <Modal.Footer>
                      <Button variant="secondary" onClick={() => handleClose(column.id)}>
                        Close
                      </Button>
                    </Modal.Footer>
                  </Modal>
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
        <div className="pagination">
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
