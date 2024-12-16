import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, ChevronRightIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { CardsSkeleton } from "@/components/shared/page-loader/loaders";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useFetchSubmittedRecords,
  useFetchPrepayments,
} from "@/services/api/queries";

export default function CanteenRecords() {
  const navigate = useNavigate();
  const [date, setDate] = useState<Date>(new Date());
  const formattedDate = date.toISOString().split("T")[0];
  const {
    data: submittedRecords,
    isLoading,
    error,
  } = useFetchSubmittedRecords(formattedDate);
  const { data: prepayments, isLoading: prepaymentsLoading } =
    useFetchPrepayments(0); // Fetch all prepayments

  const handleViewRecords = (adminId: number) => {
    navigate(`/admin/canteen-records/${adminId}/records`, {
      state: { date },
    });
  };

  interface Record {
    hasPaid: boolean;
    amount: number;
    isAbsent: boolean;
  }

  const calculateTotals = (records: Record[]) => {
    const totalPaid = records.reduce(
      (sum, record) => sum + (record.hasPaid ? record.amount : 0),
      0
    );
    const totalUnpaid = records.reduce(
      (sum, record) =>
        sum + (!record.hasPaid && !record.isAbsent ? record.amount : 0),
      0
    );
    const totalAbsent = records.reduce(
      (sum, record) => sum + (record.isAbsent ? record.amount : 0),
      0
    );
    const totalAmount = totalPaid + totalUnpaid + totalAbsent;
    const paidCount = records.filter((record) => record.hasPaid).length;
    const unpaidCount = records.filter(
      (record) => !record.hasPaid && !record.isAbsent
    ).length;
    const absentCount = records.filter((record) => record.isAbsent).length;
    const totalStudents = paidCount + unpaidCount + absentCount;

    return {
      totalAmount,
      paidCount,
      unpaidCount,
      absentCount,
      totalStudents,
    };
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Canteen Records</h1>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-[240px] justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(newDate) => newDate && setDate(newDate)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Records</TabsTrigger>
          <TabsTrigger value="prepayments">Prepayments</TabsTrigger>
          <TabsTrigger value="owings">Owings</TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          {isLoading ? (
            <CardsSkeleton count={3} />
          ) : error ? (
            <p>Error loading submitted records</p>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {submittedRecords?.map(
                (group: {
                  admin: { id: number; name: string };
                  records: Record[];
                }) => {
                  const totals = calculateTotals(group.records);
                  return (
                    <Card
                      key={group.admin.id}
                      className="hover:bg-accent/50 transition-colors"
                    >
                      <CardHeader>
                        <CardTitle>{group.admin.name}</CardTitle>
                        <CardDescription className="text-lg">
                          <span className="">Gross:</span>{" "}
                          <span className="text-primary font-bold">
                            ₵{totals.totalAmount.toFixed(2)}
                          </span>
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          Paid: {totals.paidCount} | Unpaid:{" "}
                          {totals.unpaidCount} | Absent: {totals.absentCount}
                        </p>
                        <p className="text-sm text-muted-foreground mb-2">
                          Total Students: {totals.totalStudents}
                        </p>
                        <Button
                          variant="ghost"
                          className="w-full justify-between"
                          onClick={() => handleViewRecords(group.admin.id)}
                        >
                          View Records
                          <ChevronRightIcon className="h-4 w-4" />
                        </Button>
                      </CardContent>
                    </Card>
                  );
                }
              )}
            </div>
          )}
        </TabsContent>
        <TabsContent value="prepayments">
          {prepaymentsLoading ? (
            <CardsSkeleton count={3} />
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {prepayments?.map((prepayment: Prepayment) => (
                <Card
                  key={prepayment.id}
                  className="hover:bg-accent/50 transition-colors"
                >
                  <CardHeader>
                    <CardTitle>{prepayment.student.name}</CardTitle>
                    <CardDescription className="text-lg">
                      <span className="">Amount:</span>{" "}
                      <span className="text-primary font-bold">
                        ₵{prepayment.amount.toFixed(2)}
                      </span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Number of Days: {prepayment.numberOfDays}
                    </p>
                    <p className="text-sm text-muted-foreground mb-2">
                      Date Range: {format(new Date(prepayment.startDate), "PP")}{" "}
                      - {format(new Date(prepayment.endDate), "PP")}
                    </p>
                    <Button
                      variant="ghost"
                      className="w-full justify-between"
                      onClick={() =>
                        navigate(`/admin/prepayments/${prepayment.id}`)
                      }
                    >
                      View Records
                      <ChevronRightIcon className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        <TabsContent value="owings">
          {/* Implement owings tab content here */}
          <p>Owings tab content (to be implemented)</p>
        </TabsContent>
      </Tabs>
    </div>
  );
}
