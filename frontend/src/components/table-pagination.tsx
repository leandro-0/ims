import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface TablePaginationProps {
  currentPage: number
  totalPages: number
  pageSize: number
  setPageSize: (size: number) => void
  setCurrentPage: (page: number) => void
}

export default function TablePagination(props: TablePaginationProps) {
  return (
    <div className="flex items-center justify-between mt-6">
      <div className="flex items-center gap-2">
        <Label htmlFor="pageSize">Elementos por página:</Label>
        <Select
          value={props.pageSize.toString()}
          onValueChange={(value) => {
            props.setPageSize(Number(value))
            props.setCurrentPage(0)
          }}
        >
          <SelectTrigger className="w-20" id="change-page-size">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="5">5</SelectItem>
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="20">20</SelectItem>
            <SelectItem value="50">50</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => props.setCurrentPage(Math.max(0, props.currentPage - 1))}
          disabled={props.currentPage === 0}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <span className="text-sm">
          Página {props.currentPage + 1} de {props.totalPages}
        </span>

        <Button
          variant="outline"
          size="icon"
          onClick={() => props.setCurrentPage(Math.min(props.totalPages - 1, props.currentPage + 1))}
          disabled={props.currentPage >= props.totalPages - 1}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}