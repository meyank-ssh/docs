"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  Row,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconCircleCheckFilled,
  IconDotsVertical,
  IconLayoutColumns,
  IconLoader,
  IconPlus,
  IconTrendingUp,
  IconChevronUp,
  IconCalendar,
  IconEye,
} from "@tabler/icons-react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { toast } from "sonner";
import { boolean, z } from "zod";
import { format, parseISO, isValid } from "date-fns";
import { createContext, useContext } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { useIsMobile } from "@/hooks/use-mobile";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Checkbox } from "@/components/ui/checkbox";

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { useEffect } from "react";
import { api } from "@/lib/utils";
import Link from "next/link";

export const schema = z.object({
  id: z.string(),
  merchant_id: z.string(),
  title: z.string(),
  amount: z.number(),
  description: z.string(),
  redirect_url: z.string().optional(),
  // expires: z.string(),
  is_active: z.boolean(),
  link_type: z.string(),
  transactions: z.array(z.any()).nullable(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

// Create a context for the table operations
const TableContext = createContext<{
  setData: React.Dispatch<React.SetStateAction<z.infer<typeof schema>[]>>;
} | null>(null);

export function PaymentLinksDataTable({
  data: initialData,
}: {
  data: z.infer<typeof schema>[];
}) {
  const [data, setData] = React.useState(() => initialData);
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "title", desc: false },
  ]);
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });
  // Remove expandable rows state
  const [expandedRows, setExpandedRows] = React.useState<
    Record<string, boolean>
  >({});

  // Toggle row expansion function is no longer needed
  const toggleRowExpanded = (rowId: string) => {
    setExpandedRows((prev) => ({
      ...prev,
      [rowId]: !prev[rowId],
    }));
  };

  // Add state to track which payment link's sheet is open
  const [openSheetId, setOpenSheetId] = React.useState<string | null>(null);

  // Function to open the sheet for a specific row
  const openSheet = (rowId: string) => {
    setOpenSheetId(rowId);
  };

  // Function to close the sheet
  const closeSheet = () => {
    setOpenSheetId(null);
  };

  // Define columns inside the component to access state functions
  const tableColumns = React.useMemo(() => {
    return [
      {
        id: "select",
        header: ({ table }: any) => (
          <div className="flex items-center justify-center">
            <Checkbox
              checked={
                table.getIsAllPageRowsSelected() ||
                (table.getIsSomePageRowsSelected() && "indeterminate")
              }
              onCheckedChange={(value) =>
                table.toggleAllPageRowsSelected(!!value)
              }
              aria-label="Select all"
            />
          </div>
        ),
        cell: ({ row }: any) => (
          <div
            className="flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <Checkbox
              checked={row.getIsSelected()}
              onCheckedChange={(value) => row.toggleSelected(!!value)}
              aria-label="Select row"
            />
          </div>
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: "title",
        header: "Title",
        cell: ({ row }: any) => {
          return <div className="font-medium">{row.original.title}</div>;
        },
        enableHiding: false,
      },
      {
        accessorKey: "amount",
        header: "Amount",
        cell: ({ row }: any) => (
          <div className="w-32">${row.original.amount.toFixed(2)}</div>
        ),
      },
      {
        accessorKey: "description",
        header: "Description",
        cell: ({ row }: any) => (
          <div className="max-w-[300px] truncate">
            {row.original.description}
          </div>
        ),
      },
      {
        accessorKey: "Active",
        header: "Active",
        cell: ({ row }: any) => (
          <div className="max-w-[300px] truncate capitalize">
            {row.original.is_active.toString()}
          </div>
        ),
      },
      {
        accessorKey: "Type",
        header: "Type",
        cell: ({ row }: any) => (
          <div className="max-w-[300px] truncate capitalize">
            {row.original.link_type
              ? row.original.link_type.charAt(0).toUpperCase() +
                row.original.link_type.slice(1).toLowerCase()
              : ""}
          </div>
        ),
      },
      {
        accessorKey: "created_at",
        header: ({ column }: any) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="flex items-center gap-1"
            >
              Created At
              {column.getIsSorted() === "asc" ? (
                <IconChevronUp className="h-4 w-4" />
              ) : column.getIsSorted() === "desc" ? (
                <IconChevronDown className="h-4 w-4" />
              ) : null}
            </Button>
          );
        },
        cell: ({ row }: any) => {
          const created_at = row.original.created_at;
          if (!created_at || created_at === "0001-01-01T00:00:00Z") {
            return <div>N/A</div>;
          }

          try {
            const date = parseISO(created_at);
            if (!isValid(date)) return <div>N/A</div>;
            return <div>{format(date, "PPp")}</div>;
          } catch (error) {
            return <div>N/A</div>;
          }
        },
      },
      {
        id: "payment-url",
        header: "Payment URL",
        cell: ({ row }: any) => {
          return (
            <div onClick={(e) => e.stopPropagation()}>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  window.open(
                    `${window.location.origin}/pay/${row.original.id}`,
                    "_blank"
                  )
                }
              >
                Open URL
              </Button>
            </div>
          );
        },
      },
      {
        id: "payment-status",
        header: "Status",
        cell: ({ row }: any) => {
          const { link_type, is_active, transactions } = row.original;
          console.log(
            `Link ${
              row.id
            } - type: ${link_type}, active: ${is_active}, has transactions: ${Boolean(
              transactions && transactions.length > 0
            )}`
          );

          const hasTransactions = transactions && transactions.length > 0;

          // For ONE_TIME inactive links
          if (link_type === "ONE_TIME" && !is_active) {
            const isPaid = hasTransactions;

            return (
              <div className="flex items-center gap-3">
                <Badge
                  variant={isPaid ? "secondary" : "destructive"}
                  className="whitespace-nowrap"
                >
                  {isPaid ? "Paid" : "Not Paid"}
                </Badge>
              </div>
            );
          }

          // For ONE_TIME active links
          else if (link_type === "ONE_TIME" && is_active) {
            return (
              <Badge variant="outline" className="whitespace-nowrap">
                Awaiting Payment
              </Badge>
            );
          }

          // For PERMANENT links
          else if (link_type === "PERMANENT") {
            return (
              <Badge
                variant={is_active ? "default" : "outline"}
                className="whitespace-nowrap"
              >
                {is_active ? "Active" : "Inactive"}
              </Badge>
            );
          }

          // Default case for any other link types
          else {
            return (
              <Badge variant="outline" className="whitespace-nowrap">
                {is_active ? "Active" : "Inactive"}
              </Badge>
            );
          }
        },
      },
      {
        id: "actions",
        cell: ({ row }: any) => {
          const handleDelete = async () => {
            try {
              const response = await api.delete(`/links/${row.original.id}`);

              if (response.status === 200) {
                toast.success("Payment link deleted successfully");
                // Remove the deleted link from the local state
                setData((prev: z.infer<typeof schema>[]) =>
                  prev.filter(
                    (link: z.infer<typeof schema>) =>
                      link.id !== row.original.id
                  )
                );
              }
            } catch (error) {
              console.error("Failed to delete payment link:", error);
              toast.error("Failed to delete payment link");
            }
          };

          return (
            <div onClick={(e) => e.stopPropagation()}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
                    size="icon"
                  >
                    <IconDotsVertical />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem
                    onClick={() =>
                      navigator.clipboard.writeText(
                        `${window.location.origin}/pay/${row.original.id}`
                      )
                    }
                  >
                    Copy Payment URL
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {/* <DropdownMenuItem>Edit Payment Link</DropdownMenuItem> */}
                  <DropdownMenuItem
                    className="text-red-500"
                    onClick={handleDelete}
                  >
                    Delete Payment Link
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      },
    ];
  }, [setData]);

  const table = useReactTable({
    data,
    columns: tableColumns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
    },
    getRowId: (row) => row.id.toString(),
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get<{
          payment_links: z.infer<typeof schema>[];
          status: string;
        }>("/links/my-links", {
          showErrorToast: false,
        });
        if (response.status === 200 && response.data) {
          console.log(response.data);
          if (
            response.data.payment_links &&
            Array.isArray(response.data.payment_links)
          ) {
            setData(response.data.payment_links);
          }
        }
      } catch (error) {
        console.error("Failed to fetch payment links:", error);
      }
    };
    fetchData();
  }, []);

  return (
    <Tabs
      defaultValue="outline"
      className="w-full flex-col justify-start gap-6"
    >
      <div className="flex items-center justify-between px-4 lg:px-6">
        <div className="text-xl font-semibold">Payment Links</div>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search links..."
            className="max-w-sm"
            onChange={(event) => {
              table.setGlobalFilter(event.target.value);
            }}
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <IconLayoutColumns className="mr-2 h-4 w-4" />
                Columns
                <IconChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72">
              {table
                .getAllColumns()
                .filter(
                  (column) =>
                    typeof column.accessorFn !== "undefined" &&
                    column.getCanHide()
                )
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      Show {column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
          <Link prefetch href="/links/create">
            <Button>
              <IconPlus className="mr-2 h-4 w-4" />
              Create Link
            </Button>
          </Link>
        </div>
      </div>
      <TabsContent
        value="outline"
        className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6"
      >
        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader className="bg-muted sticky top-0 z-10">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id} colSpan={header.colSpan}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody className="**:data-[slot=table-cell]:first:w-8">
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className="cursor-pointer hover:bg-muted/50 group"
                    onClick={() => openSheet(row.id)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={tableColumns.length}
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Sheet that opens when a row is clicked */}
        {openSheetId && (
          <Sheet open={!!openSheetId} onOpenChange={closeSheet}>
            <SheetContent className="overflow-y-auto min-w-[600px]">
              {(() => {
                const selectedRow = data.find((row) => row.id === openSheetId);
                if (!selectedRow) return null;

                const hasTransactions =
                  selectedRow.transactions &&
                  selectedRow.transactions.length > 0;

                return (
                  <>
                    <SheetHeader>
                      <SheetTitle>
                        {hasTransactions
                          ? `${selectedRow.title} - Transactions`
                          : `Link Details: ${selectedRow.title}`}
                      </SheetTitle>
                      <SheetDescription>
                        {hasTransactions
                          ? "View all transactions related to this payment link"
                          : "View details for this payment link"}
                      </SheetDescription>
                    </SheetHeader>

                    <div className="px-4">
                      {hasTransactions ? (
                        <div className="rounded-md border overflow-x-auto">
                          <Table>
                            <TableHeader className="bg-muted sticky top-0 z-10">
                              <TableRow>
                                <TableHead className="whitespace-nowrap">
                                  Status
                                </TableHead>
                                <TableHead className="whitespace-nowrap">
                                  Amount
                                </TableHead>
                                <TableHead className="whitespace-nowrap">
                                  Network
                                </TableHead>
                                <TableHead className="whitespace-nowrap">
                                  Mode
                                </TableHead>
                                <TableHead className="whitespace-nowrap">
                                  Created
                                </TableHead>
                                <TableHead className="whitespace-nowrap">
                                  Expires
                                </TableHead>
                                <TableHead className="whitespace-nowrap">
                                  Transaction ID
                                </TableHead>
                                <TableHead className="whitespace-nowrap">
                                  Link ID
                                </TableHead>
                                <TableHead className="whitespace-nowrap">
                                  Merchant ID
                                </TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {selectedRow.transactions!.map(
                                (transaction: any, index: number) => {
                                  const createdAt = transaction.created_at
                                    ? format(
                                        new Date(transaction.created_at),
                                        "PPp"
                                      )
                                    : "N/A";
                                  const expiresAt = transaction.expires_at
                                    ? format(
                                        new Date(transaction.expires_at),
                                        "PPp"
                                      )
                                    : "N/A";

                                  return (
                                    <TableRow key={transaction.id}>
                                      <TableCell>
                                        <Badge
                                          variant={
                                            transaction.status === "PENDING"
                                              ? "outline"
                                              : transaction.status ===
                                                "COMPLETED"
                                              ? "default"
                                              : "destructive"
                                          }
                                        >
                                          {transaction.status}
                                        </Badge>
                                      </TableCell>

                                      <TableCell>
                                        <div className="font-medium">
                                          ${transaction.amount_usd}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                          {Number(transaction.amount).toFixed(
                                            8
                                          )}{" "}
                                          {transaction.currency}
                                        </div>
                                      </TableCell>

                                      <TableCell>
                                        {transaction.network}
                                      </TableCell>

                                      <TableCell>
                                        <Badge
                                          variant="secondary"
                                          className="font-normal"
                                        >
                                          {transaction.mode}
                                        </Badge>
                                      </TableCell>

                                      <TableCell className="whitespace-nowrap">
                                        {createdAt}
                                      </TableCell>

                                      <TableCell className="whitespace-nowrap">
                                        {expiresAt}
                                      </TableCell>

                                      <TableCell>
                                        <div className="font-mono text-xs bg-muted p-1.5 rounded">
                                          {transaction.id}
                                        </div>
                                      </TableCell>

                                      <TableCell>
                                        <div className="font-mono text-xs bg-muted p-1.5 rounded">
                                          {transaction.payment_link_id}
                                        </div>
                                      </TableCell>

                                      <TableCell>
                                        <div className="font-mono text-xs bg-muted p-1.5 rounded">
                                          {transaction.merchant_id}
                                        </div>
                                      </TableCell>
                                    </TableRow>
                                  );
                                }
                              )}
                            </TableBody>
                          </Table>
                        </div>
                      ) : (
                        <div className="rounded-md border p-4">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <div className="font-medium">Title</div>
                              <div>{selectedRow.title}</div>
                            </div>
                            <div>
                              <div className="font-medium">Amount</div>
                              <div>${selectedRow.amount.toFixed(2)}</div>
                            </div>
                            <div>
                              <div className="font-medium">Link Type</div>
                              <div className="capitalize">
                                {selectedRow.link_type.toLowerCase()}
                              </div>
                            </div>
                            <div>
                              <div className="font-medium">Status</div>
                              <div>
                                {selectedRow.is_active ? "Active" : "Inactive"}
                              </div>
                            </div>
                            <div className="col-span-2">
                              <div className="font-medium">Description</div>
                              <div>{selectedRow.description}</div>
                            </div>
                            {selectedRow.redirect_url && (
                              <div className="col-span-2">
                                <div className="font-medium">Redirect URL</div>
                                <div className="truncate">
                                  {selectedRow.redirect_url}
                                </div>
                              </div>
                            )}
                            <div>
                              <div className="font-medium">Created At</div>
                              <div>
                                {selectedRow.created_at
                                  ? format(
                                      new Date(selectedRow.created_at),
                                      "PPp"
                                    )
                                  : "N/A"}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                );
              })()}
            </SheetContent>
          </Sheet>
        )}

        <div className="flex items-center justify-between px-4">
          <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
            {table.getFilteredSelectedRowModel().rows.length} of{" "}
            {table.getFilteredRowModel().rows.length} row(s) selected.
          </div>
          <div className="flex w-full items-center gap-8 lg:w-fit">
            <div className="hidden items-center gap-2 lg:flex">
              <Label htmlFor="rows-per-page" className="text-sm font-medium">
                Rows per page
              </Label>
              <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(value) => {
                  table.setPageSize(Number(value));
                }}
              >
                <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                  <SelectValue
                    placeholder={table.getState().pagination.pageSize}
                  />
                </SelectTrigger>
                <SelectContent side="top">
                  {[10, 20, 30, 40, 50].map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex w-fit items-center justify-center text-sm font-medium">
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </div>
            <div className="ml-auto flex items-center gap-2 lg:ml-0">
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to first page</span>
                <IconChevronsLeft />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to previous page</span>
                <IconChevronLeft />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to next page</span>
                <IconChevronRight />
              </Button>
              <Button
                variant="outline"
                className="hidden size-8 lg:flex"
                size="icon"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to last page</span>
                <IconChevronsRight />
              </Button>
            </div>
          </div>
        </div>
      </TabsContent>
      <TabsContent
        value="past-performance"
        className="flex flex-col px-4 lg:px-6"
      >
        <div className="aspect-video w-full flex-1 rounded-lg border border-dashed"></div>
      </TabsContent>
      <TabsContent value="key-personnel" className="flex flex-col px-4 lg:px-6">
        <div className="aspect-video w-full flex-1 rounded-lg border border-dashed"></div>
      </TabsContent>
      <TabsContent
        value="focus-documents"
        className="flex flex-col px-4 lg:px-6"
      >
        <div className="aspect-video w-full flex-1 rounded-lg border border-dashed"></div>
      </TabsContent>
    </Tabs>
  );
}
