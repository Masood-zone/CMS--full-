import { useForm } from "react-hook-form";
import { DateRange } from "react-day-picker";
import { differenceInDays } from "date-fns";
import { toast } from "sonner";
import {
  useFetchStudentsByClass,
  useFetchRecordsAmount,
  useCreatePrepayment,
  useFetchPrepayments,
  useUpdatePrepayment,
  useDeleteResource,
} from "@/services/api/queries";

export function usePrepaymentTable(classId: string) {
  const { data: prepayments, isLoading } = useFetchPrepayments(
    parseInt(classId)
  );
  const { mutate: createPrepayment, isLoading: prepaymentLoading } =
    useCreatePrepayment();
  const { mutate: updatePrepayment } = useUpdatePrepayment();
  const { mutate: deletePrepayment } = useDeleteResource(
    "prepayments",
    "prepayments"
  );

  const handleUpdate = async (data: Prepayment) => {
    try {
      await updatePrepayment(data);
      toast.success("Prepayment updated successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update prepayment");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deletePrepayment(id);
      toast.success("Prepayment deleted successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete prepayment");
    }
  };

  const handlePrepaymentSubmit = async (data: CreatePrepayment) => {
    if (!data.dateRange.from || !data.dateRange.to) {
      toast.error("Please select a valid date range");
      return;
    }

    const prepaymentData = {
      ...data,
      startDate: data.dateRange.from.toISOString(),
      endDate: data.dateRange.to.toISOString(),
      numberOfDays: data.numberOfDays,
      amount: data.expectedAmount,
      classId,
    };

    try {
      await createPrepayment(prepaymentData);
      toast.success("Prepayment created successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to create prepayment");
    }
  };

  return {
    prepayments,
    isLoading,
    prepaymentLoading,
    handleUpdate,
    handleDelete,
    handlePrepaymentSubmit,
  };
}

export function usePrepaymentForm(classId: string) {
  const { data: students } = useFetchStudentsByClass(parseInt(classId));
  const {
    data: price,
    isLoading: canteenPriceLoading,
    error: canteenPriceError,
  } = useFetchRecordsAmount();

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

  return {
    students,
    price,
    canteenPriceLoading,
    canteenPriceError,
    control,
    handleSubmit,
    reset,
    watch,
    numberOfDays,
    expectedAmount,
  };
}
