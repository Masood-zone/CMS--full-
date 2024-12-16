import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { CanteenTable } from "@/components/tables/canteen-table";
import { TableSkeleton } from "@/components/shared/page-loader/loaders";
import { columns } from "./columns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PrepaymentTable } from "../prepayments/list";
import { useCanteenSetup } from "@/hooks/use-canteen.setup";
import { PrepaymentForm } from "../prepayments/forms/create-prepayment-form";
import { usePrepaymentTable } from "@/hooks/use-prepayments";

export default function SetupCanteen() {
  const {
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
  } = useCanteenSetup();

  const { handlePrepaymentSubmit } = usePrepaymentTable(selectedClassId);

  return (
    <section className="container mx-auto py-10 px-5">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Canteen Setup</h1>
          <p className="text-muted-foreground">
            Setup canteen records for students in a class
          </p>
        </div>
        <Button
          onClick={handleSubmitCanteen}
          disabled={!selectedClassId || submittingRecord}
        >
          {submittingRecord ? "Submitting..." : "Submit Canteen Records"}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="daily">Daily</TabsTrigger>
          <TabsTrigger value="prepayments">Prepayments</TabsTrigger>
        </TabsList>
        <TabsContent value="daily">
          <div className="flex items-center space-x-4 mb-6">
            <Select onValueChange={setSelectedClassId} value={selectedClassId}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select a class" />
              </SelectTrigger>
              <SelectContent>
                {classes?.map((classItem: Class) => (
                  <SelectItem
                    key={classItem.id}
                    value={classItem.id.toString()}
                  >
                    {classItem.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-[240px] justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? (
                    format(selectedDate, "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <Button onClick={handleGenerateRecords} disabled={isGenerating}>
              {isGenerating ? "Generating..." : "Generate Records"}
            </Button>
          </div>
          {classesLoading || recordsLoading ? (
            <TableSkeleton />
          ) : (
            <CanteenTable
              columns={columns(handleUpdateStatus, updatingLoader)}
              data={records}
            />
          )}
        </TabsContent>
        <TabsContent value="prepayments">
          <div className=" flex items-center justify-between w-full">
            <Select onValueChange={setSelectedClassId} value={selectedClassId}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select a class" />
              </SelectTrigger>
              <SelectContent>
                {classes?.map((classItem: Class) => (
                  <SelectItem
                    key={classItem.id}
                    value={classItem.id.toString()}
                  >
                    {classItem.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div>
              <PrepaymentForm
                classId={selectedClassId}
                onSubmit={handlePrepaymentSubmit}
              />
            </div>
          </div>
          <PrepaymentTable classId={selectedClassId} />
        </TabsContent>
      </Tabs>
    </section>
  );
}
