import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { UpdatePrepaymentModal } from "./forms/update-prepayment-form";

export const columns = (
  handleUpdate: (prepayment: Prepayment) => void,
  handleDelete: (id: number) => void
): ColumnDef<Prepayments>[] => [
  {
    accessorKey: "student.name",
    header: "Student Name",
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => `₵${row.original.amount.toFixed(2)}`,
  },
  {
    accessorKey: "startDate",
    header: "Start Date",
    cell: ({ row }) => new Date(row.original.startDate).toLocaleDateString(),
  },
  {
    accessorKey: "endDate",
    header: "End Date",
    cell: ({ row }) => new Date(row.original.endDate).toLocaleDateString(),
  },
  {
    accessorKey: "numberOfDays",
    header: "Number of Days",
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const prepayment = row.original;
      return (
        <div className="flex space-x-2">
          <UpdatePrepaymentModal
            prepayment={prepayment}
            onUpdate={handleUpdate}
          />
          <Button
            variant="destructive"
            onClick={() => handleDelete(row.original.id)}
          >
            Delete
          </Button>
        </div>
      );
    },
  },
];
