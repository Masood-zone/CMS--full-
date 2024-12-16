import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import {
  useFetchClasses,
  useStudentRecordsByClassAndDate,
  useUpdateStudentStatus,
  useSubmitAdminRecord,
  useGenerateStudentRecords,
} from "@/services/api/queries";
import { toast } from "sonner";

export function useCanteenSetup() {
  const { user } = useAuthStore();
  const adminId = user?.user?.id;
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [records, setRecords] = useState<CanteenRecord[]>([]);
  const [activeTab, setActiveTab] = useState("daily");

  const formattedDate = selectedDate.toISOString().split("T")[0];
  const { data: classes, isLoading: classesLoading } = useFetchClasses();
  const { data: studentRecords, isLoading: recordsLoading } =
    useStudentRecordsByClassAndDate(parseInt(selectedClassId), formattedDate);
  const { mutate: updateStatus, isLoading: updatingLoader } =
    useUpdateStudentStatus();
  const { mutate: generateRecords, isLoading: isGenerating } =
    useGenerateStudentRecords();
  const { mutate: submitRecord, isLoading: submittingRecord } =
    useSubmitAdminRecord();

  const classSupervisorId = classes?.find(
    (classItem: Class) => classItem.id === parseInt(selectedClassId)
  )?.supervisorId;

  useEffect(() => {
    if (studentRecords) {
      setRecords(studentRecords);
    }
  }, [studentRecords]);

  const handleUpdateStatus = async (
    record: CanteenRecord,
    newStatus: { hasPaid: boolean; isAbsent: boolean }
  ) => {
    try {
      const updatedRecord = {
        ...record,
        ...newStatus,
        submitedBy: classSupervisorId ?? 0,
        date: selectedDate?.toISOString().split("T")[0] ?? "",
      };
      await updateStatus(updatedRecord);
      setRecords((prevRecords) =>
        prevRecords.map((r) => (r.id === record.id ? updatedRecord : r))
      );
      toast.success("Student status updated successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update student status");
    }
  };

  const handleGenerateRecords = () => {
    generateRecords({
      classId: parseInt(selectedClassId),
      date: selectedDate.toISOString(),
      adminId: adminId ?? 0,
    });
  };

  const handleSubmitCanteen = async () => {
    if (!selectedClassId) {
      toast.error("Please select a class before submitting");
      return;
    }

    const payload = {
      classId: parseInt(selectedClassId),
      date: formattedDate,
      unpaidStudents: records
        .filter((r) => !r.hasPaid && !r.isAbsent)
        .map((r) => ({
          id: r.id,
          amount: r.settingsAmount,
          paidBy: r.payedBy?.toString() || "",
          hasPaid: false,
          date: formattedDate,
        })),
      paidStudents: records
        .filter((r) => r.hasPaid)
        .map((r) => ({
          id: r.id,
          amount: r.settingsAmount,
          paidBy: r.payedBy?.toString() || "",
          hasPaid: true,
          date: formattedDate,
        })),
      absentStudents: records
        .filter((r) => r.isAbsent)
        .map((r) => ({
          id: r.id,
          amount_owing: r.settingsAmount,
          paidBy: r.payedBy?.toString() || "",
          hasPaid: false,
          date: formattedDate,
        })),
      submittedBy: classSupervisorId,
    };

    try {
      await submitRecord(payload);
    } catch (error) {
      console.error(error);
      toast.error("Failed to submit canteen records");
    }
  };

  return {
    selectedDate,
    setSelectedDate,
    selectedClassId,
    setSelectedClassId,
    records,
    activeTab,
    setActiveTab,
    classes,
    classesLoading,
    recordsLoading,
    updatingLoader,
    isGenerating,
    submittingRecord,
    handleUpdateStatus,
    handleGenerateRecords,
    handleSubmitCanteen,
  };
}
