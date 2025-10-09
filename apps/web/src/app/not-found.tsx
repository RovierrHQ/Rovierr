import { Button } from '@rov/ui/components/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6">
      <div className="flex max-w-2xl flex-col items-center space-y-8 text-center">
        {/* 404 Number */}
        <div className="relative">
          <h1 className="select-none font-serif text-[clamp(8rem,20vw,16rem)] text-foreground/5 leading-none tracking-tight">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-sans text-muted-foreground text-sm uppercase tracking-[0.3em]">
              Not Found
            </span>
          </div>
        </div>

        {/* Message */}
        <div className="space-y-4">
          <h2 className="text-balance font-serif text-3xl text-foreground leading-tight md:text-4xl lg:text-5xl">
            Page not found
          </h2>
          <p className="mx-auto max-w-md text-pretty text-base text-muted-foreground leading-relaxed md:text-lg">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        {/* Button */}
        <Button
          asChild
          className="group mt-4 bg-primary text-primary-foreground transition-all duration-300 hover:bg-primary/90"
          size="lg"
        >
          <Link className="flex items-center gap-2" href="/">
            <ArrowLeft className="group-hover:-translate-x-1 h-4 w-4 transition-transform" />
            <span className="font-sans tracking-wide">Back to Home</span>
          </Link>
        </Button>
      </div>

      {/* Decorative Element */}
      <div className="-z-10 pointer-events-none absolute inset-0 overflow-hidden">
        <div className="-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2 h-[600px] w-[600px] rounded-full bg-accent/5 blur-3xl" />
      </div>
    </main>
  )
}
