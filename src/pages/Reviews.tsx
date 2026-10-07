import { useState, useEffect } from "react";
import { Review } from "@/lib/mock-data";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchReviews, createReview } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const Reviews = () => {
  const queryClient = useQueryClient();
  const { data: fetchedReviews } = useQuery({ queryKey: ['reviews'], queryFn: fetchReviews });
  const [reviews, setReviews] = useState<Review[]>([]);
  const [content, setContent] = useState("");
  const [type, setType] = useState<"review" | "complaint">("review");
  const { toast } = useToast();

  useEffect(() => {
    if (fetchedReviews) setReviews(fetchedReviews);
  }, [fetchedReviews]);

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    if (!role) {
      window.location.href = "/login";
    }
  }, []);

  const createReviewMut = useMutation({
    mutationFn: createReview,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['reviews'] })
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    await createReviewMut.mutateAsync({
      type,
      content,
      userName: "Website User",
    });

    setContent("");
    toast({ title: "Submitted", description: "Your feedback has been submitted successfully." });
  };

  return (
    <div className="container py-12 max-w-4xl">
      <h1 className="font-heading text-3xl font-bold text-foreground mb-2">Platform Reviews & Complaints</h1>
      <p className="text-muted-foreground mb-8">Share your experience or submit a complaint about the platform.</p>

      <div className="card-elevated bg-card rounded-xl p-6 mb-12">
        <h2 className="text-xl font-bold mb-4 text-foreground">Submit Feedback</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-4 mb-4">
            <Button 
              type="button" 
              variant={type === "review" ? "default" : "outline"} 
              onClick={() => setType("review")}
            >
              Positive Review
            </Button>
            <Button 
              type="button" 
              variant={type === "complaint" ? "destructive" : "outline"}
              onClick={() => setType("complaint")}
            >
              Submit Complaint
            </Button>
          </div>
          <div>
            <Label htmlFor="content">Your Feedback</Label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-2"
              placeholder="Tell us what you think..."
              required
            />
          </div>
          <Button type="submit">Submit {type === "review" ? "Review" : "Complaint"}</Button>
        </form>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-foreground mb-4">Recent Community Feedback</h2>
        {reviews.map((r) => (
          <Card key={r.id}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="font-bold text-foreground">{r.userName}</span>
                  <span className="text-xs text-muted-foreground ml-2">{r.date}</span>
                </div>
                <span className={`text-xs px-2 py-1 rounded-md font-medium ${r.type === 'complaint' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                  {r.type.toUpperCase()}
                </span>
              </div>
              <p className="text-foreground">{r.content}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Reviews;
