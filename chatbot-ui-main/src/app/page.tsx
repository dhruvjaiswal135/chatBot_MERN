import { redirect } from "next/navigation";

export default async function Home() {
  // For now, redirect to login page
  // In a real app, you would check the service status here
  return redirect('/auth/login');
}
