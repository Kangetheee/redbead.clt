import { redirect } from "next/navigation";
import { getSession } from "@/lib/session/session";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { signOutFormAction } from "@/lib/auth/auth.actions";

export default async function DashboardPage() {
  const session = await getSession();

  if (!session) {
    redirect("/sign-in");
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome to Redbead
            </h1>
            <p className="text-gray-600 mt-2">
              Manage your corporate merchandise orders
            </p>
          </div>
          <form action={signOutFormAction}>
            <Button variant="outline" type="submit">
              Sign Out
            </Button>
          </form>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>New Order</CardTitle>
              <CardDescription>Start a new merchandise order</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Create Order</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Order History</CardTitle>
              <CardDescription>View your past orders</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full bg-transparent">
                View Orders
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>Manage your account details</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full bg-transparent">
                Settings
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p>
                <span className="font-medium">User ID:</span> {session.user.id}
              </p>
              <p>
                <span className="font-medium">Phone:</span> {session.user.phone}
              </p>
              <p>
                <span className="font-medium">Role:</span> {session.user.role}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
