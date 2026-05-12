import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Provider, AppUser } from "@/lib/mock-data";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchProviders, fetchUsers, fetchReviews, deleteProvider, deleteUser, updateProvider } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Save, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Admin = () => {
  const queryClient = useQueryClient();
  const { data: fetchedProviders } = useQuery({ queryKey: ['providers'], queryFn: fetchProviders });
  const { data: fetchedUsers } = useQuery({ queryKey: ['users'], queryFn: fetchUsers });
  const { data: fetchedReviews = [] } = useQuery({ queryKey: ['reviews'], queryFn: fetchReviews });

  const [allProviders, setAllProviders] = useState<Provider[]>([]);
  const [allUsers, setAllUsers] = useState<AppUser[]>([]);
  const { toast } = useToast();

  const deleteProviderMut = useMutation({ mutationFn: deleteProvider, onSuccess: () => queryClient.invalidateQueries({ queryKey: ['providers'] }) });
  const deleteUserMut = useMutation({ mutationFn: deleteUser, onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }) });
  const updateProviderMut = useMutation({ mutationFn: ({ id, data }: { id: string, data: Partial<Provider> }) => updateProvider(id, data), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['providers'] }) });

  useEffect(() => {
    if (fetchedProviders && allProviders.length === 0) setAllProviders(fetchedProviders);
  }, [fetchedProviders, allProviders.length]);

  useEffect(() => {
    if (fetchedUsers && allUsers.length === 0) setAllUsers(fetchedUsers);
  }, [fetchedUsers, allUsers.length]);

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    if (role !== "admin") {
      window.location.href = "/";
    }
  }, []);

  const handleRateChange = (id: string, newRate: string) => {
    setAllProviders(prev => prev.map(p => p.id === id ? { ...p, hourlyRate: Number(newRate) } : p));
  };

  const handleSaveProviders = async () => {
    if (!fetchedProviders) return;
    const promises = allProviders.map(p => {
      const original = fetchedProviders.find(op => op.id === p.id);
      if (original && original.hourlyRate !== p.hourlyRate) {
        return updateProviderMut.mutateAsync({ id: p.id, data: { hourlyRate: p.hourlyRate } });
      }
      return Promise.resolve();
    });
    
    await Promise.all(promises);
    toast({ title: "Saved", description: "Providers have been successfully updated in backend." });
  };

  const handleDeleteProvider = async (id: string) => {
    await deleteProviderMut.mutateAsync(id);
    setAllProviders(prev => prev.filter(p => p.id !== id));
    toast({ title: "Deleted", description: "Provider has been removed from backend.", variant: "destructive" });
  };

  const handleDeleteUser = async (id: string) => {
    await deleteUserMut.mutateAsync(id);
    setAllUsers(prev => prev.filter(u => u.id !== id));
    toast({ title: "Deleted", description: "User account has been removed from backend.", variant: "destructive" });
  };

  return (
    <div className="container py-12">
      <h1 className="font-heading text-3xl font-bold text-foreground mb-8">Admin Dashboard</h1>
      
      <div className="grid gap-6 md:grid-cols-2 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Recent Users (Role Tracing)</CardTitle>
            <CardDescription>Track all newly registered users and activity.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {allUsers.map((u) => (
                <div key={u.id} className="flex justify-between items-center border-b pb-2">
                  <div>
                    <h3 className="font-semibold text-foreground">{u.name}</h3>
                    <p className="text-sm text-muted-foreground">{u.email}</p>
                  </div>
                  <div className="flex items-center gap-4 text-right">
                    <div>
                      <span className="text-xs uppercase bg-secondary px-2 py-1 rounded-md text-foreground">{u.role}</span>
                      <p className="mt-1 text-xs text-muted-foreground">Joined: {u.joinedAt}</p>
                    </div>
                    {u.role === "user" && (
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteUser(u.id)} className="text-destructive h-8 w-8 shrink-0">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Reviews & Complaints</CardTitle>
            <CardDescription>Monitor platform feedback from users.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {fetchedReviews.map((r) => (
                <div key={r.id} className="border-b pb-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-bold text-foreground">{r.userName}</span>
                    <span className={`text-xs px-2 py-1 rounded-md ${r.type === 'complaint' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                      {r.type.toUpperCase()}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{r.content}</p>
                  <p className="mt-1 text-xs text-muted-foreground">Status: {r.status} | {r.date}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Service Providers Management</CardTitle>
            <CardDescription>Add, update rates, or remove providers from the directory.</CardDescription>
          </div>
          <Link to="/become-provider">
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" /> Add Provider
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {allProviders.map(p => (
              <div key={p.id} className="flex justify-between items-center border-b pb-3">
                <div>
                  <h3 className="font-bold text-foreground">{p.name}</h3>
                  <p className="text-sm text-muted-foreground">{p.category} • {p.location}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 border rounded-md px-2">
                    <span className="text-sm font-medium text-muted-foreground">₹</span>
                    <Input 
                      type="number" 
                      value={p.hourlyRate} 
                      onChange={(e) => handleRateChange(p.id, e.target.value)}
                      className="border-0 focus-visible:ring-0 w-16 px-1 h-8"
                    />
                    <span className="text-xs text-muted-foreground">/hr</span>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteProvider(p.id)} className="text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            <div className="flex justify-end pt-2">
               <Button onClick={handleSaveProviders} className="gap-2"><Save className="h-4 w-4" /> Save Rates</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Admin;
