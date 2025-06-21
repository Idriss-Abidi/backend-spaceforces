import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function SidebarLoading() {
  return (
    <Card className="bg-black/40 border-[#9370DB]/30 backdrop-blur-sm">
      <CardHeader>
        <Skeleton className="h-7 w-40 bg-[#4B0082]/30" />
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full bg-[#4B0082]/30" />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

