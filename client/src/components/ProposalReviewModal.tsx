"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, Clock, User, Calendar, DollarSign } from "lucide-react";
import { apiClient } from "@/lib/api";

interface ProposalReviewModalProps {
  proposal: any;
  onProposalReviewed?: () => void;
  children: React.ReactNode;
}

export default function ProposalReviewModal({ proposal, onProposalReviewed, children }: ProposalReviewModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [reviewData, setReviewData] = useState({
    status: "",
    comments: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await apiClient.reviewProposal(proposal._id, reviewData);
      
      if (response.success) {
        alert(`Proposal ${reviewData.status} successfully!`);
        setOpen(false);
        setReviewData({ status: "", comments: "" });
        onProposalReviewed?.();
      } else {
        alert(`Failed to review proposal: ${response.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Error reviewing proposal:", error);
      alert(`Failed to review proposal: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'event': return '🎉';
      case 'activity': return '🎯';
      case 'improvement': return '🔧';
      case 'funding': return '💰';
      default: return '📋';
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Review Proposal</DialogTitle>
          <DialogDescription>
            Review and provide feedback on this member proposal.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Proposal Details */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{proposal.title}</CardTitle>
                  <CardDescription className="mt-1">
                    {getCategoryIcon(proposal.category)} {proposal.category} • Priority: 
                    <Badge className={`ml-2 ${getPriorityColor(proposal.priority)}`}>
                      {proposal.priority}
                    </Badge>
                  </CardDescription>
                </div>
                <Badge variant={proposal.status === 'pending' ? 'secondary' : 'outline'}>
                  {proposal.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Description</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">{proposal.description}</p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">
                    <strong>Proposer:</strong> {proposal.proposer?.name}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">
                    <strong>Submitted:</strong> {new Date(proposal.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {proposal.estimatedCost && (
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">
                    <strong>Estimated Cost:</strong> ${proposal.estimatedCost}
                  </span>
                </div>
              )}

              {proposal.estimatedDuration && (
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">
                    <strong>Duration:</strong> {proposal.estimatedDuration}
                  </span>
                </div>
              )}

              {proposal.requirements && proposal.requirements.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Requirements</h4>
                  <ul className="text-sm text-gray-600 dark:text-gray-300 list-disc list-inside space-y-1">
                    {proposal.requirements.map((req: string, index: number) => (
                      <li key={index}>{req}</li>
                    ))}
                  </ul>
                </div>
              )}

              {proposal.benefits && proposal.benefits.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Benefits</h4>
                  <ul className="text-sm text-gray-600 dark:text-gray-300 list-disc list-inside space-y-1">
                    {proposal.benefits.map((benefit: string, index: number) => (
                      <li key={index}>{benefit}</li>
                    ))}
                  </ul>
                </div>
              )}

              {proposal.risks && proposal.risks.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Potential Risks</h4>
                  <ul className="text-sm text-gray-600 dark:text-gray-300 list-disc list-inside space-y-1">
                    {proposal.risks.map((risk: string, index: number) => (
                      <li key={index}>{risk}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Review Form */}
          <Card>
            <CardHeader>
              <CardTitle>Review Decision</CardTitle>
              <CardDescription>
                Provide your review decision and comments.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Decision</Label>
                  <Select value={reviewData.status} onValueChange={(value) => setReviewData(prev => ({ ...prev, status: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your decision" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="approved">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span>Approve</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="rejected">
                        <div className="flex items-center space-x-2">
                          <XCircle className="w-4 h-4 text-red-600" />
                          <span>Reject</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="pending">
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-yellow-600" />
                          <span>Request Changes</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="comments">Comments</Label>
                  <Textarea
                    id="comments"
                    value={reviewData.comments}
                    onChange={(e) => setReviewData(prev => ({ ...prev, comments: e.target.value }))}
                    placeholder="Provide feedback or comments on this proposal..."
                    rows={4}
                    required
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading || !reviewData.status}>
                    {loading ? "Submitting Review..." : "Submit Review"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
