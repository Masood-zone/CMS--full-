import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";

export function StatisticsTable({ stats }: StatisticsTableProps) {
  return (
    <Table>
      <TableBody>
        <TableRow>
          <TableCell className="font-bold">Total Paid:</TableCell>
          <TableCell className="text-green-500">
            ₵{stats.totalPaid.toFixed(2)}
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="font-bold">Total Unpaid:</TableCell>
          <TableCell
            className={
              stats.totalUnpaid === 0 ? "text-gray-500" : "text-red-500"
            }
          >
            ₵{stats.totalUnpaid.toFixed(2)}
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="font-bold">Total Outstanding:</TableCell>
          <TableCell
            className={
              stats.totalOutstanding === 0 ? "text-gray-500" : "text-blue-500"
            }
          >
            ₵{stats.totalOutstanding.toFixed(2)}
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}
