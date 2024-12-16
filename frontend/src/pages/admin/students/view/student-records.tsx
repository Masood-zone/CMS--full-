import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";

export const StudentRecordsTable: React.FC<StudentRecordsTableProps> = ({
  records,
  studentName,
}) => {
  return (
    <Table className="border rounded-lg w-full">
      <TableCaption>{studentName}'s Records</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Prepaid</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {records.map((record: StudentRecord) => (
          <TableRow key={record.id}>
            <TableCell>
              {record?.submitedAt
                ? format(new Date(record.submitedAt), "PP")
                : "N/A"}
            </TableCell>
            <TableCell>Gh₵{record?.amount?.toFixed(2)}</TableCell>
            <TableCell>
              {record.isAbsent ? "Absent" : record.hasPaid ? "Paid" : "Unpaid"}
            </TableCell>
            <TableCell>{record.isPrepaid ? "Yes" : "No"}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
