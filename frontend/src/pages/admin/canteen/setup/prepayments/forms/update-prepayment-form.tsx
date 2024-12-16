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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Controller, useForm } from "react-hook-form";
import { cn } from "@/lib/utils";
import { format, eachDayOfInterval, isWeekend } from "date-fns";
import { useState, useEffect } from "react";
import { useFetchRecordsAmount } from "@/services/api/queries";

interface UpdatePrepaymentModalProps {
  prepayment: Prepayment;
  onUpdate: (data: Prepayment) => void;
}

export function UpdatePrepaymentModal({
  prepayment,
  onUpdate,
}: UpdatePrepaymentModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const {
    data: price,
    isLoading: canteenPriceLoading,
    error: canteenPriceError,
  } = useFetchRecordsAmount();

  const { control, handleSubmit, watch, setValue } = useForm<Prepayment>({
    defaultValues: {
      amount: prepayment.amount,
      numberOfDays: prepayment.numberOfDays,
      startDate: new Date(prepayment.startDate),
      endDate: new Date(prepayment.endDate),
    },
  });

  const startDate = watch("startDate");
  const endDate = watch("endDate");

  useEffect(() => {
    if (startDate && endDate) {
      const days = eachDayOfInterval({ start: startDate, end: endDate });
      const numberOfDays = days.filter((day) => !isWeekend(day)).length;
      setValue("numberOfDays", numberOfDays);

      const canteenPrice = price?.setting?.value
        ? parseFloat(price.setting.value)
        : 0;
      const expectedAmount = numberOfDays * canteenPrice;
      setValue("amount", expectedAmount);
    }
  }, [startDate, endDate, price, setValue]);

  const onSubmit = (data: Prepayment) => {
    const updatedPrepayment = {
      ...prepayment,
      ...data,
      startDate: data.startDate,
      endDate: data.endDate,
    };
    onUpdate(updatedPrepayment);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Update</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Prepayment</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                Gh₵
                {price?.setting?.value
                  ? parseFloat(price.setting.value).toFixed(2)
                  : "0.00"}
              </span>
            </div>
          </div>
          <div>
            <Label htmlFor="startDate">Start Date</Label>
            <Controller
              name="startDate"
              control={control}
              rules={{ required: "Start date is required" }}
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
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a start date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              )}
            />
          </div>
          <div>
            <Label htmlFor="endDate">End Date</Label>
            <Controller
              name="endDate"
              control={control}
              rules={{ required: "End date is required" }}
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
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick an end date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              )}
            />
          </div>
          <div>
            <Label htmlFor="numberOfDays">Number of Days</Label>
            <Controller
              name="numberOfDays"
              control={control}
              render={({ field }) => (
                <Input id="numberOfDays" type="number" {...field} disabled />
              )}
            />
          </div>
          <div>
            <Label htmlFor="amount">Expected Amount (Ghc)</Label>
            <Controller
              name="amount"
              control={control}
              render={({ field }) => (
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  {...field}
                  disabled
                />
              )}
            />
          </div>
          <Button type="submit">Update Prepayment</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
