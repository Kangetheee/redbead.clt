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

export default async function AdminDashboardPage() {
  const session = await getSession();

  if (!session) {
    redirect("/sign-in");
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground dark:text-foreground">
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground dark:text-muted-foreground mt-2">
              Manage all aspects of the Redbead platform
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
              <CardTitle>Total Orders</CardTitle>
              <CardDescription>Overview of all orders</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">1,234</div>
            </CardContent>
          </Card>

          <Card className="bg-card text-card-foreground">
            <CardHeader>
              <CardTitle>Total Customers</CardTitle>
              <CardDescription>Registered customer base</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">567</div>
            </CardContent>
          </Card>

          <Card className="bg-card text-card-foreground">
            <CardHeader>
              <CardTitle>Revenue (This Month)</CardTitle>
              <CardDescription>Total earnings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">KSh 1,250,000</div>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-8 bg-card text-card-foreground">
          <CardHeader>
            <CardTitle>Admin Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button className="w-full bg-gradient-to-r from-green-600 to-red-600 hover:from-green-700 hover:to-red-700 text-white">
                Manage Products
              </Button>
              <Button variant="outline" className="w-full bg-transparent">
                Manage Users
              </Button>
              <Button variant="outline" className="w-full bg-transparent">
                View System Logs
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
