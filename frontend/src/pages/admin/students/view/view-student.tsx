import { useParams, Link } from "react-router-dom";
import { Edit2Icon } from "lucide-react";
import GoBackButton from "@/components/shared/go-back/go-back";
import { PaleTableSkeleton } from "@/components/shared/page-loader/loaders";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableRow,
} from "@/components/ui/table";
import { useFetchClassById, useFetchStudent } from "@/services/api/queries";
import { StudentRecordsTable } from "./student-records";

export default function ViewStudent() {
  const { id } = useParams();
  const studentId = Number(id);
  const { data: student, isLoading, error } = useFetchStudent(studentId);
  const { data: classData, isLoading: classLoader } = useFetchClassById(
    student?.classId
  );

  if (isLoading || classLoader) {
    return <PaleTableSkeleton />;
  }

  if (error) {
    return (
      <p>{error instanceof Error ? error.message : "An error occurred"}</p>
    );
  }

  if (!student) {
    return <p>No student data found.</p>;
  }

  return (
    <section className="w-full space-y-5">
      <GoBackButton />
      <div className="flex items-center gap-4">
        <div className="size-36 rounded-full bg-gray-200"></div>
        <div className="flex flex-col w-2/3 space-y-2">
          <h1 className="text-2xl font-bold">{student.name}</h1>
          <p>
            <span className="font-medium text-lg">{student.age} years old</span>
          </p>
          <div className="mt-2 flex items-center gap-2">
            <Link to={`/admin/students/${id}/edit`}>
              <Button>
                <Edit2Icon className="mr-2 h-4 w-4" />
                Edit
              </Button>
            </Link>
          </div>
        </div>
      </div>
      <div className="max-w-4xl w-full">
        <Table className="border rounded-lg w-full">
          <TableCaption>{student.name}'s Info</TableCaption>
          <TableBody>
            <TableRow>
              <TableHead className="w-1/3 text-left">Full Name</TableHead>
              <TableCell>{student.name}</TableCell>
            </TableRow>
            <TableRow>
              <TableHead className="w-1/3 text-left">Class/Level</TableHead>
              <TableCell>{classData?.name || "Loading..."}</TableCell>
            </TableRow>
            <TableRow>
              <TableHead className="w-1/3 text-left">Gender</TableHead>
              <TableCell>{student.gender}</TableCell>
            </TableRow>
            <TableRow>
              <TableHead className="w-1/3 text-left">Age</TableHead>
              <TableCell>{student.age} years old</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
      {student.records && student.records.length > 0 ? (
        <div className="max-w-4xl w-full">
          <StudentRecordsTable
            records={student.records}
            studentName={student.name}
          />
        </div>
      ) : (
        <p>No records found for this student.</p>
      )}
    </section>
  );
}
