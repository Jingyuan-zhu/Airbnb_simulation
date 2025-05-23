import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
} from "@mui/material";

export default function LazyTable({
  route,
  columns,
  defaultPageSize,
  rowsPerPageOptions,
}) {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1); // 1 indexed
  const [pageSize, setPageSize] = useState(defaultPageSize ?? 10);

  useEffect(() => {
    const separator = route.includes("?") ? "&" : "?";
    fetch(`${route}${separator}page=${page}&page_size=${pageSize}`)
      .then((res) => res.json())
      .then((resJson) => {
        // Normalize response to an array
        setData(Array.isArray(resJson) ? resJson : []);
      })
      .catch((err) => {
        console.error("Error fetching data:", err);
        setData([]); // Set empty array on error
      });
  }, [route, page, pageSize]);

  const handleChangePage = (e, newPage) => {
    if (newPage < page || data.length === pageSize) {
      setPage(newPage + 1);
    }
  };

  const handleChangePageSize = (e) => {
    const newPageSize = e.target.value;
    setPageSize(parseInt(newPageSize));
    setPage(1);
  };

  const defaultRenderCell = (col, row) => {
    return <div>{row[col.field]}</div>;
  };

  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            {columns.map((col) => (
              <TableCell key={col.headerName}>{col.headerName}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.length > 0 ? (
            data.map((row, idx) => (
              <TableRow key={idx}>
                {columns.map((col) => (
                  <TableCell key={col.headerName}>
                    {col.renderCell
                      ? col.renderCell(row)
                      : defaultRenderCell(col, row)}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} align="center">
                No data available
              </TableCell>
            </TableRow>
          )}
        </TableBody>
        <TablePagination
          rowsPerPageOptions={rowsPerPageOptions ?? [5, 10, 25]}
          count={-1}
          rowsPerPage={pageSize}
          page={page - 1}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangePageSize}
        />
      </Table>
    </TableContainer>
  );
}
