import { FileText, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function ContentPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Content</h1>
        <p className="text-muted-foreground">Docs and FAQs for agent context</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Knowledge base</CardTitle>
          <CardDescription>Upload documents to reduce hallucinations and improve accuracy</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border py-16">
            <FileText className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 font-semibold">No content yet</h3>
            <p className="mb-4 text-center text-sm text-muted-foreground">
              Upload PDF, MD, or HTML files to provide context for your agents.
            </p>
            <Button>
              <Upload className="mr-2 h-4 w-4" />
              Upload document
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
