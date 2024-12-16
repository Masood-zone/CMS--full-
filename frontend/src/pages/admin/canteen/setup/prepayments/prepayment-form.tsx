import { Button } from "@/components/ui/button";
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
import { Controller } from "react-hook-form";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { usePrepaymentForm } from "@/hooks/use-prepayments";
import { DateRange } from "react-day-picker";

interface PrepaymentFormProps {
  classId: string;
  onSubmit: (data: { studentId: string; dateRange: DateRange }) => void;
}

export function PrepaymentForm({ classId, onSubmit }: PrepaymentFormProps) {
  const {
    students,
    price,
    canteenPriceLoading,
    canteenPriceError,
    control,
    handleSubmit,
    numberOfDays,
    expectedAmount,
  } = usePrepaymentForm(classId);

  const canteenPrice = price?.setting?.value
    ? parseFloat(price.setting.value)
    : 0;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="mt-4">Setup Prepaid</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Record Prepayment</DialogTitle>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
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
          <Button type="submit">Submit Prepayment</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
