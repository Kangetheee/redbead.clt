import { getSession } from "@/lib/session/session";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { signOutFormAction } from "@/lib/auth/auth.actions";

export default async function StaffDashboardPage() {
  const session = await getSession();

  if (!session) {
    redirect("/sign-in");
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground dark:text-gray-50">
              Staff Dashboard
            </h1>
            <p className="text-muted-foreground dark:text-gray-400 mt-2">
              Manage daily operations and customer support
            </p>
          </div>
          <form action={signOutFormAction}>
            <Button variant="outline" type="submit">
              Sign Out
            </Button>
          </form>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="bg-card text-card-foreground">
            <CardHeader>
              <CardTitle>Pending Orders</CardTitle>
              <CardDescription>Orders awaiting processing</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">23</div>
            </CardContent>
          </Card>

          <Card className="bg-card text-card-foreground">
            <CardHeader>
              <CardTitle>Production Queue</CardTitle>
              <CardDescription>Items in production</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">45</div>
            </CardContent>
          </Card>

          <Card className="bg-card text-card-foreground">
            <CardHeader>
              <CardTitle>Open Support Tickets</CardTitle>
              <CardDescription>Customer inquiries</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">7</div>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-8 bg-card text-card-foreground">
          <CardHeader>
            <CardTitle>Staff Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button className="w-full bg-gradient-to-r from-green-600 to-red-600 hover:from-green-700 hover:to-red-700 text-white">
                Process Orders
              </Button>
              <Button variant="outline" className="w-full bg-transparent">
                View Production Schedule
              </Button>
              <Button variant="outline" className="w-full bg-transparent">
                Respond to Tickets
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
