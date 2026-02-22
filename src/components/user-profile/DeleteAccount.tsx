import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface DeleteAccountProps {
  onDelete?: (confirmation: string) => Promise<void>
}

export function DeleteAccount({ onDelete }: DeleteAccountProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [confirmation, setConfirmation] = useState('')

  const handleDelete = async () => {
    if (confirmation !== 'delete my account') return
    await onDelete?.(confirmation)
    setConfirmation('')
    setIsOpen(false)
  }

  const isConfirmValid = confirmation === 'delete my account'

  return (
    <Card className="border-destructive/50 bg-destructive/5 transition-all duration-300 hover:shadow-card-hover">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <AlertTriangle className="h-5 w-5" />
          Delete account
        </CardTitle>
        <CardDescription>
          Permanently delete your account and all associated data. This action cannot be undone.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
          <Button variant="destructive" onClick={() => setIsOpen(true)}>
            Request data deletion
          </Button>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete your account and remove all your data from our servers.
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="delete-confirm">
                  Type <span className="font-mono font-semibold">delete my account</span> to confirm
                </Label>
                <Input
                  id="delete-confirm"
                  value={confirmation}
                  onChange={(e) => setConfirmation(e.target.value)}
                  placeholder="delete my account"
                  className="font-mono"
                />
              </div>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setConfirmation('')}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={!isConfirmValid}
                className="bg-destructive text-white hover:bg-destructive/90 disabled:opacity-50"
              >
                Delete my account
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  )
}
