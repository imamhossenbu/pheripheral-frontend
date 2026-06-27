import UserFilters from "@/components/admin/users/UserFilters";
import { UserPageHeader } from "@/components/admin/users/UserPageHeader";
import UserStats from "@/components/admin/users/UserStats";
import UserTable from "@/components/admin/users/UserTable";
import { userService } from "@/lib/api/userApi";


interface Props {
  searchParams: Promise<{
    page?: string;
    search?: string;
    role?: string;
    isVerified?: string;
  }>;
}

export default async function AdminUsersPage({
  searchParams,
}: Props) {
  const params = await searchParams;

  const query = new URLSearchParams();

  query.set("page", params.page || "1");
  query.set("limit", "10");

  if (params.search) query.set("search", params.search);
  if (params.role) query.set("role", params.role);
  if (params.isVerified)
    query.set("isVerified", params.isVerified);

  const { data, meta } = await userService.getAll(
    query.toString()
  );

  const totalUsers = meta.total;
  const verifiedUsers = data.filter(
    (u: any) => u.isVerified
  ).length;

  const admins = data.filter(
    (u: any) => u.role === "ADMIN"
  ).length;

  return (
    <div className="space-y-6">

      {/* Header */}
       <UserPageHeader/>

      <UserStats
        totalUsers={totalUsers}
        verifiedUsers={verifiedUsers}
        admins={admins}
      />

      <UserFilters />
     

      <UserTable
        users={data}
        meta={meta}
      />

    </div>
  );
}