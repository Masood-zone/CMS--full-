import { useForm } from "react-hook-form";
import { DateRange } from "react-day-picker";
import { differenceInDays } from "date-fns";
import { toast } from "sonner";
import {
  useFetchStudentsByClass,
  useFetchRecordsAmount,
  useCreatePrepayment,
  useFetchPrepaymentsByClass,
  useUpdatePrepayment,
  useDeleteResource,
} from "@/services/api/queries";

export function usePrepaymentTable(classId: string) {
  const { data: prepayments, isLoading } = useFetchPrepaymentsByClass(
    parseInt(classId)
  );

  const { mutate: updatePrepayment } = useUpdatePrepayment();
  const { mutate: deletePrepayment } = useDeleteResource(
    "prepayments",
    "prepayments"
  );

  const handleUpdate = async (data: Prepayment) => {
    try {
      await updatePrepayment(data);
    } catch (error) {
      console.error(error);
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

  return {
    prepayments,
    isLoading,
    handleUpdate,
    handleDelete,
  };
}

export function usePrepaymentForm(classId: string) {
  const { mutate: createPrepayment, isLoading: prepaymentLoading } =
    useCreatePrepayment();
  const { data: students } = useFetchStudentsByClass(parseInt(classId));
  const {
    data: price,
    isLoading: canteenPriceLoading,
    error: canteenPriceError,
  } = useFetchRecordsAmount();

  const { control, handleSubmit, reset, watch } = useForm<CreatePrepayment>({
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
    createPrepayment,
    prepaymentLoading,
    handleSubmit,
    reset,
    watch,
    numberOfDays,
    expectedAmount,
  };
}
