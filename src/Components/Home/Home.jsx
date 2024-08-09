import React, { useState, useMemo, useEffect } from "react";
import { MaterialReactTable } from "material-react-table";
import { format, parseISO } from "date-fns";
import dataFile from "../../data/FMSCA_records.json";
import { 
  TextField, Tabs, Tab, Box, Button, Modal, 
  Typography, Grid, Paper
} from "@mui/material";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import PivotTable  from 'react-pivottable';
import 'react-pivottable/pivottable.css';

export default function Home() {
  const [view, setView] = useState('table');
  const [tableData, setTableData] = useState(dataFile.FMSCA_records);
  const [chartData, setChartData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const savedData = localStorage.getItem('tableData');
    if (savedData) {
      setTableData(JSON.parse(savedData));
    }

    const savedColumns = localStorage.getItem('columns');
    if (savedColumns) {
      setColumns(JSON.parse(savedColumns));
    } else {
      const initialColumns = generateColumns();
      setColumns(initialColumns);
      localStorage.setItem('columns', JSON.stringify(initialColumns));
    }

    updateChartData(tableData);
  }, []);

  const generateColumns = () => {
    return [
      {
        accessorKey: 'usdot_number',
        header: 'USDOT Number',
        filterFn: 'equals',
      },
      {
        accessorKey: 'legal_name',
        header: 'Legal Name',
      },
      {
        accessorKey: 'dba_name',
        header: 'DBA Name',
      },
      {
        accessorKey: 'entity_type',
        header: 'Entity Type',
      },
      {
        accessorKey: 'physical_address',
        header: 'Physical Address',
      },
      {
        accessorKey: 'phone',
        header: 'Phone',
      },
      {
        accessorKey: 'power_units',
        header: 'Power Units',
        filterFn: 'between',
      },
      {
        accessorKey: 'drivers',
        header: 'Drivers',
        filterFn: 'between',
      },
      {
        accessorKey: 'mcs_150_form_date',
        header: 'MCS-150 Form Date',
        Cell: ({ cell }) => format(parseISO(cell.getValue()), 'yyyy-MM-dd'),
        filterFn: 'dateBetween',
      },
      {
        accessorKey: 'created_dt',
        header: 'Created Date',
        Cell: ({ cell }) => {
          const date = parseISO(cell.getValue());
          return format(date, 'yyyy-MM-dd HH:mm:ss');
        },
        filterFn: 'dateBetween',
      },
      {
        accessorKey: 'data_source_modified_dt',
        header: 'Last Modified Date',
        Cell: ({ cell }) => {
          const date = parseISO(cell.getValue());
          return format(date, 'yyyy-MM-dd HH:mm:ss');
        },
        filterFn: 'dateBetween',
      },
      {
        accessorKey: 'record_status',
        header: 'Record Status',
      },
    ];
  };

  const updateChartData = (filteredData) => {
    if (!Array.isArray(filteredData)) {
      console.error('filteredData is not an array:', filteredData);
      setChartData([]);
      return;
    }
  
    const outOfServiceByMonth = filteredData.reduce((acc, row) => {
      if (row && row.created_dt) {
        const date = parseISO(row.created_dt);
        const monthYear = format(date, 'yyyy-MM');
        acc[monthYear] = (acc[monthYear] || 0) + 1;
      }
      return acc;
    }, {});
  
    const chartData = Object.entries(outOfServiceByMonth)
      .map(([monthYear, count]) => ({
        monthYear,
        count,
      }))
      .sort((a, b) => a.monthYear.localeCompare(b.monthYear));
  
    setChartData(chartData);
  };

  const handleSaveData = (updatedData) => {
    setTableData(updatedData);
    localStorage.setItem('tableData', JSON.stringify(updatedData));
    updateChartData(updatedData);
  };

  const handleResetSettings = () => {
    const initialColumns = generateColumns();
    setColumns(initialColumns);
    localStorage.setItem('columns', JSON.stringify(initialColumns));
    setTableData(dataFile.FMSCA_records);
    localStorage.setItem('tableData', JSON.stringify(dataFile.FMSCA_records));
    updateChartData(dataFile.FMSCA_records);
  };

  const handleSaveView = () => {
    const currentView = {
      columns,
      filters: {}, // Implement filters state if needed
      sorting: {}, // Implement sorting state if needed
    };
    return currentView;
  };

  const handleLoadView = (view) => {
    setColumns(view.columns);
    // Implement loading filters and sorting if needed
  };

  return (
    <Box sx={{ width: '100%', typography: 'body1' }}>
      <Tabs value={view} onChange={(e, newValue) => setView(newValue)}>
        <Tab label="Table View" value="table" />
        <Tab label="Pivot View" value="pivot" />
      </Tabs>
      <Button onClick={() => setIsModalOpen(true)}>Save/Load View</Button>


      {view === 'table' && (
        <TableView 
          data={tableData} 
          setData={handleSaveData}
          columns={columns}
          setColumns={setColumns}
          chartData={chartData}
          updateChartData={updateChartData}
        />
      )}

      {view === 'pivot' && (
        <PivotView 
          data={tableData}
        />
      )}

      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400,
          bgcolor: 'background.paper',
          border: '2px solid #000',
          boxShadow: 24,
          p: 4,
        }}>
          <SaveLoadModal onSave={handleSaveView} onLoad={handleLoadView} />
        </Box>
      </Modal>
    </Box>
  );
}

function TableView({ data, setData, columns, setColumns, chartData, updateChartData }) {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Paper elevation={3} sx={{ p: 2 }}>
          <MaterialReactTable
            columns={columns}
            data={data}
            enableColumnFilters
            enableGlobalFilter
            enablePagination
            enableSorting
            enableColumnResizing
            enableColumnOrdering
            muiTableBodyCellEditTextFieldProps={({ cell }) => ({
              type: cell.column.id.includes('date') ? 'datetime-local' : 'text',
            })}
            onEditingRowSave={setData}
            onColumnFiltersChange={(updatedFilters) => {
              const filteredData = data.filter(row => {
                return updatedFilters.every(filter => {
                  if (!filter || !filter.id) return true;
                  const cellValue = row[filter.id];
                  const filterValue = filter.value;
                  
                  if (typeof filterValue === 'undefined' || filterValue === null) return true;
                  
                  if (filter.id.includes('date')) {
                    const date = parseISO(cellValue);
                    const [start, end] = filterValue.map(parseISO);
                    return date >= start && date <= end;
                  }
                  
                  return cellValue.toString().toLowerCase().includes(filterValue.toLowerCase());
                });
              });
              updateChartData(filteredData);
            }}
          />
        </Paper>
      </Grid>
      <Grid item xs={12}>
        <Paper elevation={3} sx={{ p: 2, height: 400 }}>
          <Typography variant="h6">Companies Created per Month</Typography>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="monthYear" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>
    </Grid>
  );
}

function PivotView({ data }) {
  const [pivotState, setPivotState] = useState({});

  return (
    <Paper elevation={3} sx={{ p: 2 }}>
      <PivotTable
        data={data}
        onChange={s => setPivotState(s)}
        {...pivotState}
      />
    </Paper>
  );
}

function SaveLoadModal({ onSave, onLoad }) {
  const [viewName, setViewName] = useState('');
  const [savedViews, setSavedViews] = useState([]);

  useEffect(() => {
    const views = JSON.parse(localStorage.getItem('savedViews') || '[]');
    setSavedViews(views);
  }, []);

  const handleSave = () => {
    const newView = { name: viewName, state: onSave() };
    const views = [...savedViews, newView];
    localStorage.setItem('savedViews', JSON.stringify(views));
    setSavedViews(views);
    setViewName('');
  };

  const handleLoad = (view) => {
    onLoad(view.state);
  };

  return (
    <Box>
      <Typography id="modal-modal-title" variant="h6" component="h2">
        Save/Load View
      </Typography>
      <TextField
        value={viewName}
        onChange={(e) => setViewName(e.target.value)}
        placeholder="View name"
        fullWidth
        margin="normal"
      />
      <Button onClick={handleSave} variant="contained" color="primary">Save View</Button>
      {savedViews.map((view) => (
        <Button 
          key={view.name} 
          onClick={() => handleLoad(view)}
          fullWidth
          variant="outlined"
          sx={{ mt: 1 }}
        >
          Load {view.name}
        </Button>
      ))}
    </Box>
  );
}