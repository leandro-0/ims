"use client"

import { Button } from "@/components/ui/button"
import { useParams } from "next/navigation"

export default function ErrorPage() {
  const params = useParams()
  const errorCode = params.code as string
  const commonMessages: Record<string, string> = {
    "404": "Página no encontrada",
    "500": "Error interno del servidor",
    "403": "Acceso denegado",
    "401": "No autorizado",
    "400": "Solicitud incorrecta",
    "408": "Tiempo de espera agotado",
    "429": "Demasiadas solicitudes",
  }

  return (
    <div className="flex flex-col items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-md text-center">
        <div className="mx-auto h-12 w-12 text-primary" />
        <h1 className="mt-4 text-6xl font-bold tracking-tight text-foreground sm:text-7xl">{errorCode}</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          {commonMessages[errorCode] || "Ocurrió un error inesperado."}
        </p>
        <div className="mt-6">
          <Button variant="default" onClick={() => window.location.href = "/"}>
            Volver al inicio
          </Button>
        </div>
      </div>
    </div>
  )
}