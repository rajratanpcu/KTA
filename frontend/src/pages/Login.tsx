import { FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import apiClient from '@/lib/api-client'

const USERNAME_KEY = 'kta_auth_username'
const PASSWORD_KEY = 'kta_auth_password'

export default function Login() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)
    sessionStorage.setItem(USERNAME_KEY, username)
    sessionStorage.setItem(PASSWORD_KEY, password)

    try {
      await apiClient.get('/categories')
      navigate('/dashboard', { replace: true })
    } catch {
      sessionStorage.removeItem(USERNAME_KEY)
      sessionStorage.removeItem(PASSWORD_KEY)
      setError('Unable to sign in with those credentials.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-muted/30 flex items-center justify-center p-6">
      <section className="w-full max-w-md rounded-lg border bg-background p-8 shadow-sm">
        <h1 className="text-2xl font-semibold">KTA ERP</h1>
        <p className="mt-2 text-sm text-muted-foreground">Sign in to continue.</p>
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input id="username" value={username} onChange={(event) => setUsername(event.target.value)} required autoComplete="username" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required autoComplete="current-password" />
          </div>
          {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
          <Button className="w-full" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>
      </section>
    </main>
  )
}

export { USERNAME_KEY, PASSWORD_KEY }
