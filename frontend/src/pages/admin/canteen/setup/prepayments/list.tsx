import { DataTable } from "@/components/ui/data-table";
import { TableSkeleton } from "@/components/shared/page-loader/loaders";
import { columns } from "./columns";
import { usePrepaymentTable } from "@/hooks/use-prepayments";

export function PrepaymentTable({ classId }: { classId: string }) {
  const { prepayments, isLoading, handleUpdate, handleDelete } =
    usePrepaymentTable(classId);

  if (isLoading) return <TableSkeleton />;

  return (
    <section className="w-full">
      <DataTable
        columns={columns(handleUpdate, handleDelete)}
        data={prepayments || []}
      />
    </section>
  );
}
