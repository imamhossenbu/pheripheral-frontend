"use client";

import { useState } from "react";
import { UserPlus } from "lucide-react";
import { CreateUserModal } from "./CreateUserModal";


export function UserPageHeader() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-overline">Administration</p>
          <h1 className="text-heading-xl mt-2">User Management</h1>
          <p className="text-body mt-2 max-w-2xl">
            Manage user accounts, roles and verification status from one place.
          </p>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors self-start mt-1"
        >
          <UserPlus className="w-4 h-4" />
          Add User
        </button>
      </div>

      {open && <CreateUserModal onClose={() => setOpen(false)} />}
    </>
  );
}
