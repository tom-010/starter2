"use client";

import { useState } from "react";
import { Link, Form } from "react-router";
import { Trash2, Pencil } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "~/components/ui/pagination";
import { Button } from "~/components/ui/button";
import type { Role } from "~/lib/roles";

interface User {
  id: string;
  name: string;
  email: string;
  roles: Role[];
  createdAt: Date;
}

interface UsersTableProps {
  users: User[];
}

const ITEMS_PER_PAGE = 10;

export function UsersTable({ users }: UsersTableProps) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(users.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedUsers = users.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handlePrevious = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNext = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const handlePageClick = (page: number) => {
    setCurrentPage(page);
  };

  const renderPaginationItems = () => {
    const items = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink
              onClick={() => handlePageClick(i)}
              isActive={currentPage === i}
              className="cursor-pointer"
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }
    } else {
      items.push(
        <PaginationItem key={1}>
          <PaginationLink
            onClick={() => handlePageClick(1)}
            isActive={currentPage === 1}
            className="cursor-pointer"
          >
            1
          </PaginationLink>
        </PaginationItem>
      );

      if (currentPage > 3) {
        items.push(
          <PaginationItem key="ellipsis-start">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink
              onClick={() => handlePageClick(i)}
              isActive={currentPage === i}
              className="cursor-pointer"
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }

      if (currentPage < totalPages - 2) {
        items.push(
          <PaginationItem key="ellipsis-end">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }

      items.push(
        <PaginationItem key={totalPages}>
          <PaginationLink
            onClick={() => handlePageClick(totalPages)}
            isActive={currentPage === totalPages}
            className="cursor-pointer"
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }

    return items;
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="hidden md:table-cell">Roles</TableHead>
              <TableHead className="hidden md:table-cell">Created</TableHead>
              <TableHead className="text-right w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedUsers.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-8 text-muted-foreground"
                >
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              paginatedUsers.map((user, idx) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium text-muted-foreground">
                    {startIndex + idx + 1}
                  </TableCell>
                  <TableCell>
                    <Link
                      to={`/admin/users/${user.id}/edit`}
                      className="hover:underline font-medium"
                    >
                      {user.name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {user.email}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="flex gap-1 flex-wrap">
                      {user.roles.map((role) => (
                        <span
                          key={role}
                          className="px-2 py-0.5 bg-muted rounded text-xs capitalize"
                        >
                          {role}
                        </span>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="sm" asChild>
                        <Link to={`/admin/users/${user.id}/edit`}>
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Form
                        method="post"
                        onSubmit={(e) => {
                          if (
                            !window.confirm(
                              "Are you sure you want to delete this user?"
                            )
                          ) {
                            e.preventDefault();
                          }
                        }}
                      >
                        <input type="hidden" name="id" value={user.id} />
                        <Button type="submit" variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </Form>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={handlePrevious}
                  className={`cursor-pointer ${
                    currentPage === 1 ? "pointer-events-none opacity-50" : ""
                  }`}
                />
              </PaginationItem>

              {renderPaginationItems()}

              <PaginationItem>
                <PaginationNext
                  onClick={handleNext}
                  className={`cursor-pointer ${
                    currentPage === totalPages
                      ? "pointer-events-none opacity-50"
                      : ""
                  }`}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      <div className="text-sm text-muted-foreground text-center">
        Showing {Math.min(startIndex + 1, users.length)} to{" "}
        {Math.min(startIndex + ITEMS_PER_PAGE, users.length)} of {users.length}{" "}
        users
      </div>
    </div>
  );
}
