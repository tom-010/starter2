import { useState } from "react"
import { Bug } from "lucide-react"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"
import { helloHiGet, greetPersonGreetPost } from "~/lib/py/client"
import { requireAuth } from "~/lib/auth.server"
import type { Route } from "./+types/debug-py"

export async function loader({ request }: Route.LoaderArgs) {
  await requireAuth(request)
  return {}
}

export default function DebugPyPage() {
  const [hiResult, setHiResult] = useState<string | null>(null)
  const [hiLoading, setHiLoading] = useState(false)

  const [firstName, setFirstName] = useState("John")
  const [lastName, setLastName] = useState("Doe")
  const [greetResult, setGreetResult] = useState<string | null>(null)
  const [greetLoading, setGreetLoading] = useState(false)

  async function handleHi() {
    setHiLoading(true)
    setHiResult(null)
    try {
      const res = await helloHiGet()
      setHiResult(JSON.stringify(res.data, null, 2))
    } catch (err) {
      setHiResult(`Error: ${err}`)
    } finally {
      setHiLoading(false)
    }
  }

  async function handleGreet() {
    setGreetLoading(true)
    setGreetResult(null)
    try {
      const res = await greetPersonGreetPost({
        body: { first_name: firstName, last_name: lastName },
      })
      setGreetResult(JSON.stringify(res.data, null, 2))
    } catch (err) {
      setGreetResult(`Error: ${err}`)
    } finally {
      setGreetLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-2">
        <Bug className="size-6" />
        <h1 className="text-2xl font-bold">Python Bridge Debug</h1>
      </div>
      <p className="text-muted-foreground">
        Test page for the Python-TypeScript bridge. Calls FastAPI endpoints
        via the generated typed SDK.
      </p>

      <Card>
        <CardHeader>
          <CardTitle>GET /hi</CardTitle>
          <CardDescription>Simple health check</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={handleHi} disabled={hiLoading}>
            {hiLoading ? "Loading..." : "Call /hi"}
          </Button>
          {hiResult && (
            <pre className="bg-muted p-4 rounded text-sm overflow-auto">
              {hiResult}
            </pre>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>POST /greet</CardTitle>
          <CardDescription>Greet a person (typed RPC call)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
          </div>
          <Button onClick={handleGreet} disabled={greetLoading}>
            {greetLoading ? "Loading..." : "Call /greet"}
          </Button>
          {greetResult && (
            <pre className="bg-muted p-4 rounded text-sm overflow-auto">
              {greetResult}
            </pre>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
