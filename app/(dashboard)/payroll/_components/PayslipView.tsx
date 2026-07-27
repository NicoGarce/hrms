import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Printer, DollarSign, FileText } from "lucide-react"

interface PayslipViewProps {
  employeeName: string
  employeeCode?: string
  department?: string
  period: string
  baseSalary: string
  grossSalary: string
  netSalary: string
  items: Array<{ type: string; name: string; amount: string }>
}

export function PayslipView({
  employeeName,
  employeeCode,
  department,
  period,
  baseSalary,
  grossSalary,
  netSalary,
  items,
}: PayslipViewProps) {
  const allowances = items.filter((i) => i.type === "ALLOWANCE" || i.type === "BONUS")
  const deductions = items.filter((i) => i.type === "DEDUCTION")

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="print:p-8 print:bg-white print:text-black">
      <div className="flex items-center justify-between mb-6 print:mb-4">
        <div>
          <h2 className="font-heading text-xl font-bold print:text-lg">Payslip</h2>
          <p className="text-muted-foreground text-sm print:text-xs">{period}</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 print:hidden"
          onClick={handlePrint}
        >
          <Printer className="h-4 w-4" />
          Print
        </Button>
      </div>

      <Card className="mb-4 print:border print:shadow-none">
        <CardHeader className="print:py-2">
          <CardTitle className="text-base print:text-sm">Employee Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 print:space-y-1">
          <div className="flex justify-between">
            <span className="text-muted-foreground text-sm">Name:</span>
            <span className="font-medium text-sm">{employeeName}</span>
          </div>
          {employeeCode && (
            <div className="flex justify-between">
              <span className="text-muted-foreground text-sm">Employee Code:</span>
              <span className="font-mono text-sm">{employeeCode}</span>
            </div>
          )}
          {department && (
            <div className="flex justify-between">
              <span className="text-muted-foreground text-sm">Department:</span>
              <span className="text-sm">{department}</span>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="mb-4 print:border print:shadow-none">
        <CardHeader className="print:py-2">
          <CardTitle className="text-base print:text-sm">Earnings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 print:space-y-1">
          <div className="flex justify-between">
            <span className="text-sm">Base Salary</span>
            <span className="font-mono text-sm">
              <DollarSign className="h-3 w-3 inline" />
              {parseFloat(baseSalary).toFixed(2)}
            </span>
          </div>
          {allowances.map((item, idx) => (
            <div key={idx} className="flex justify-between">
              <span className="text-sm">{item.name}</span>
              <span className="font-mono text-sm text-chart-3">
                <DollarSign className="h-3 w-3 inline" />
                {parseFloat(item.amount).toFixed(2)}
              </span>
            </div>
          ))}
          <div className="flex justify-between border-t pt-2 mt-2 print:border-black">
            <span className="font-medium text-sm">Gross Pay</span>
            <span className="font-mono font-medium text-sm">
              <DollarSign className="h-3 w-3 inline" />
              {parseFloat(grossSalary).toFixed(2)}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-4 print:border print:shadow-none">
        <CardHeader className="print:py-2">
          <CardTitle className="text-base print:text-sm">Deductions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 print:space-y-1">
          {deductions.length === 0 ? (
            <p className="text-muted-foreground text-sm">No deductions</p>
          ) : (
            deductions.map((item, idx) => (
              <div key={idx} className="flex justify-between">
                <span className="text-sm">{item.name}</span>
                <span className="font-mono text-sm text-chart-4">
                  <DollarSign className="h-3 w-3 inline" />
                  {parseFloat(item.amount).toFixed(2)}
                </span>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card className="print:border print:shadow-none">
        <CardContent className="pt-6 print:pt-2">
          <div className="flex justify-between items-center">
            <span className="font-heading text-lg font-bold print:text-base">Net Pay</span>
            <span className="font-mono text-2xl font-bold text-chart-5 print:text-xl">
              <DollarSign className="h-5 w-5 inline print:h-4 print:w-4" />
              {parseFloat(netSalary).toFixed(2)}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
