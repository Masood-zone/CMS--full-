import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  useCreatePrepayment,
  useDeleteResource,
  useFetchPrepayments,
  useFetchRecordsAmount,
  useFetchStudentsByClass,
  useUpdatePrepayment,
} from "@/services/api/queries";
import { TableSkeleton } from "@/components/shared/page-loader/loaders";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { CalendarIcon, Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { DateRange } from "react-day-picker";
import { differenceInDays } from "date-fns";
import { columns } from "./columns";

export function PrepaymentTable({ classId }: { classId: string }) {
  const { data: students } = useFetchStudentsByClass(parseInt(classId));
  const { data: prepayments, isLoading } = useFetchPrepayments(
    parseInt(classId)
  );
  const {
    data: price,
    isLoading: canteenPriceLoading,
    error: canteenPriceError,
  } = useFetchRecordsAmount();
  const { mutate: createPrepayment, isLoading: prepaymentLoading } =
    useCreatePrepayment();
  const { mutate: updatePrepayment } = useUpdatePrepayment();
  const { mutate: deletePrepayment } = useDeleteResource(
    "prepayments",
    "prepayments"
  );
  const { control, handleSubmit, reset, watch } = useForm({
    defaultValues: {
      studentId: "",
      dateRange: { from: undefined, to: undefined } as DateRange,
    },
  });
  const dateRange = watch("dateRange");
  const numberOfDays =
    dateRange.from && dateRange.to
      ? differenceInDays(dateRange.to, dateRange.from) + 1
      : 0;

  const canteenPrice = price?.setting?.value
    ? parseFloat(price.setting.value)
    : 0;
  const expectedAmount = numberOfDays * canteenPrice;

  const handlePrepaymentSubmit = async (data: CreatePrepayment) => {
    if (!data.dateRange.from || !data.dateRange.to) {
      toast.error("Please select a valid date range");
      return;
    }

    const prepaymentData = {
      ...data,
      startDate: data.dateRange.from.toISOString(),
      endDate: data.dateRange.to.toISOString(),
      numberOfDays,
      amount: expectedAmount,
      classId,
    };

    try {
      await createPrepayment(prepaymentData);
      toast.success("Prepayment created successfully");
    } catch (error) {
      console.log(error);
      toast.error("Failed to create prepayment");
    } finally {
      reset();
    }
  };
  const handleUpdate = async (data: Prepayment) => {
    try {
      await updatePrepayment(data);
    } catch (error) {
      console.log(error);
    }
  };
  const handleDelete = async (id: number) => {
    try {
      deletePrepayment(id);
    } catch (error) {
      console.log(error);
    }
  };

  if (isLoading) return <TableSkeleton />;

  return (
    <section className=" w-full">
      <Dialog>
        <DialogTrigger asChild>
          <Button className="mt-4">Setup Prepaid</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Prepayment</DialogTitle>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={handleSubmit(handlePrepaymentSubmit)}
          >
            <div className="flex items-center justify-between w-full">
              <Label htmlFor="canteenPrice">Canteen Price</Label>
              <div>
                {canteenPriceLoading && (
                  <span className="animate-spin">
                    <Loader2 />
                  </span>
                )}
                {Boolean(canteenPriceError) && (
                  <p className="text-red-500">Error fetching canteen price</p>
                )}
                <span className="text-2xl font-bold text-primary text-center px-2">
                  Gh₵{canteenPrice.toFixed(2)}
                </span>
              </div>
            </div>
            <div>
              <Label htmlFor="studentId">Student</Label>
              <Controller
                name="studentId"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a Student" />
                    </SelectTrigger>
                    <SelectContent>
                      {students?.map((student: Student) => (
                        <SelectItem
                          key={student.id}
                          value={student?.id?.toString() || ""}
                        >
                          {student.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div>
              <Label htmlFor="dateRange">Date Range</Label>
              <Controller
                name="dateRange"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value?.from ? (
                          field.value.to ? (
                            <>
                              {format(field.value.from, "LLL dd, y")} -{" "}
                              {format(field.value.to, "LLL dd, y")}
                            </>
                          ) : (
                            format(field.value.from, "LLL dd, y")
                          )
                        ) : (
                          <span>Pick a date range</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={field.value?.from}
                        selected={field.value}
                        onSelect={field.onChange}
                        numberOfMonths={2}
                      />
                    </PopoverContent>
                  </Popover>
                )}
              />
            </div>
            <div>
              <Label htmlFor="numberOfDays">Number of Days</Label>
              <Input type="number" value={numberOfDays} disabled />
            </div>
            <div>
              <Label htmlFor="amount">Expected Amount (Ghc)</Label>
              <Input type="number" value={expectedAmount.toFixed(2)} disabled />
            </div>
            <Button type="submit" disabled={prepaymentLoading}>
              {prepaymentLoading ? "Saving..." : "Submit Prepayment"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
      <DataTable
        columns={columns(handleUpdate, handleDelete)}
        data={prepayments || []}
      />
    </section>
  );
}
