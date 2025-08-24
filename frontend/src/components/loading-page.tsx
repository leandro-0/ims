import { Loader2 } from "lucide-react"

interface LoadingPageProps {
  message?: string
}

export default function LoadingPage({ message }: LoadingPageProps) {
  return (
    <>
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-black-600 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">{message || "Cargando..."}</p>
        </div>
      </div>
    </>
  )
}