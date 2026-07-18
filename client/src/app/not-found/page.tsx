import { useNavigate } from "react-router-dom"
import { Button } from "@/shared/ui/button"
import { Home, ArrowLeft } from "lucide-react"

export function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative background blur */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="relative z-10 flex flex-col items-center text-center max-w-md mx-auto">
        {/* Animated 404 Text */}
        <div className="relative">
          <h1 className="text-[120px] font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-primary to-primary/40 leading-none select-none">
            404
          </h1>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-t from-background to-transparent pointer-events-none" />
        </div>

        <h2 className="mt-8 text-3xl font-bold tracking-tight text-foreground">
          Page not found
        </h2>
        
        <p className="mt-4 text-muted-foreground text-lg max-w-sm">
          Oops! It seems you've ventured into the unknown. The page you're looking for doesn't exist or has been moved.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <Button 
            onClick={() => navigate(-1)} 
            variant="outline" 
            size="lg"
            className="w-full sm:w-auto gap-2 group"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Go Back
          </Button>
          <Button 
            onClick={() => navigate("/")} 
            size="lg"
            className="w-full sm:w-auto gap-2 bg-gradient-to-r from-violet-600 to-fuchsia-500 hover:from-violet-700 hover:to-fuchsia-600 text-white border-0"
          >
            <Home className="h-4 w-4" />
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  )
}
