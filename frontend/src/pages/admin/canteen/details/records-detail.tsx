import { useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { format, parseISO } from "date-fns";
import { useFetchRecordsDetail } from "@/services/api/queries";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TableSkeleton } from "@/components/shared/page-loader/loaders";
import { PageHeading } from "@/components/typography/heading";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatisticsTable } from "./statistics-table";

interface Record {
  id: number;
  submitedAt: string;
  student: {
    id: number;
    name: string;
  };
  class: {
    id: number;
    name: string;
  };
  amount: number;
  hasPaid: boolean;
  isAbsent: boolean;
}

export default function TeacherRecordsDetail() {
  const { teacherId } = useParams();
  const {
    data: records,
    isLoading,
    error,
  } = useFetchRecordsDetail(teacherId ? parseInt(teacherId) : 0);

  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const groupedRecords = useMemo(() => {
    if (!records) return {};
    return records.reduce(
      (acc: { [key: string]: Record[] }, record: Record) => {
        const date = format(parseISO(record.submitedAt), "yyyy-MM-dd");
        if (!acc[date]) {
          acc[date] = [];
        }
        acc[date].push(record);
        return acc;
      },
      {}
    );
  }, [records]);

  const availableDates = useMemo(() => {
    return Object.keys(groupedRecords).sort((a, b) => b.localeCompare(a));
  }, [groupedRecords]);

  const mostRecentDate = availableDates[0];

  const currentDate = selectedDate || mostRecentDate;

  if (isLoading)
    return (
      <div className="p-5">
        <PageHeading>Canteen Record Details</PageHeading>
        <TableSkeleton />
      </div>
    );
  if (error) return <p>Error loading teacher records</p>;

  // Calculate statistics
  const calculateStats = (records: Record[]) => {
    const totalPaid = records
      .filter((record) => record.hasPaid)
      .reduce((sum, record) => sum + record.amount, 0);

    const totalUnpaid = records
      .filter((record) => !record.hasPaid && !record.isAbsent)
      .reduce((sum, record) => sum + record.amount, 0);

    const totalOutstanding = totalPaid + totalUnpaid;

    return { totalPaid, totalUnpaid, totalOutstanding };
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <PageHeading>Canteen Record Details</PageHeading>
        <Button onClick={() => window.history.back()}>Back to Summary</Button>
      </div>

      <div className="mb-4 flex items-center space-x-3">
        <h2 className="text-xl font-semibold mb-2">Select Date</h2>
        <Select
          value={currentDate}
          onValueChange={(value) => setSelectedDate(value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select date" />
          </SelectTrigger>
          <SelectContent>
            {availableDates.map((date) => (
              <SelectItem key={date} value={date}>
                {format(parseISO(date), "MMMM d, yyyy")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {currentDate && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">
            {format(parseISO(currentDate), "MMMM d, yyyy")}
          </h2>
          <Table className="w-full">
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Paid</TableHead>
                <TableHead>Absent</TableHead>
                <TableHead>Unpaid</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {groupedRecords[currentDate].map((record: Record) => (
                <TableRow key={record.id}>
                  <TableCell>{record?.student?.name}</TableCell>
                  <TableCell>₵{record?.amount?.toFixed(2)}</TableCell>
                  <TableCell>
                    <Checkbox checked={record?.hasPaid} disabled />
                  </TableCell>
                  <TableCell>
                    <Checkbox checked={record?.isAbsent} disabled />
                  </TableCell>
                  <TableCell>
                    <Checkbox
                      checked={!record?.hasPaid && !record?.isAbsent}
                      disabled
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="mt-4">
            <h3 className="text-xl font-semibold mb-2">Daily Statistics</h3>
            <StatisticsTable
              stats={calculateStats(groupedRecords[currentDate])}
            />
          </div>
        </div>
      )}

      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-2">Overall Statistics</h3>
        <StatisticsTable stats={calculateStats(records)} />
      </div>
    </div>
  );
}
