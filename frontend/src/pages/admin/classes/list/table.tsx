import { DataTable } from "@/components/ui/data-table";
import ActionMenu from "@/components/actions/action-menu";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { useDeleteResource } from "@/services/api/queries";
import { TableSkeleton } from "@/components/shared/page-loader/loaders";

export default function ClassesTable({
  data,
  isLoading,
  error,
}: {
  data: Class[];
  isLoading: boolean;
  error: unknown;
}) {
  const { mutateAsync: deleteClass } = useDeleteResource("classes", "classes");
  const columns: ColumnDef<Class>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select All"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label={`Select Row ${row.index + 1}`}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Class Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
    },
    {
      accessorKey: "description",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Description
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
    },
    {
      accessorKey: "supervisor",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Supervisor
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const adminName = row?.original?.supervisor?.name;
        return <span>{adminName || "No teacher assigned"}</span>;
      },
    },
    {
      accessorKey: "actions",
      header: () => <span>Actions</span>,
      cell: ({ row }) => {
        const classData = row.original;
        return (
          <ActionMenu
            id={classData.id}
            resourceName="class"
            onDelete={() => deleteClass(classData.id)}
          />
        );
      },
    },
  ];

  return (
    <div className="container w-full mx-auto py-10 px-4 sm:px-0 lg:px-0">
      {isLoading ? (
        <TableSkeleton />
      ) : error ? (
        <div>
          <p>Error fetching classes</p>
        </div>
      ) : (
        <DataTable columns={columns} data={data} searchField="name" />
      )}
    </div>
  );
}
