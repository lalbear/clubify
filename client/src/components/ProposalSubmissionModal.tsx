"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, FileText } from "lucide-react";
import { apiClient } from "@/lib/api";

interface ProposalSubmissionModalProps {
  onProposalSubmitted?: () => void;
}

export default function ProposalSubmissionModal({ onProposalSubmitted }: ProposalSubmissionModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "other",
    priority: "medium",
    estimatedCost: "",
    estimatedDuration: "",
    requirements: "",
    benefits: "",
    risks: ""
  });

  useEffect(() => {
    if (open) {
      // No need to load clubs for single club system
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const proposalData = {
        ...formData,
        club: "default-club", // Single club system
        estimatedCost: formData.estimatedCost ? parseFloat(formData.estimatedCost) : undefined,
        requirements: formData.requirements ? formData.requirements.split('\n').filter(r => r.trim()) : [],
        benefits: formData.benefits ? formData.benefits.split('\n').filter(b => b.trim()) : [],
        risks: formData.risks ? formData.risks.split('\n').filter(r => r.trim()) : []
      };

      const response = await apiClient.createProposal(proposalData);
      
      if (response.success) {
        alert("Proposal submitted successfully!");
        setOpen(false);
        setFormData({
          title: "",
          description: "",
          category: "other",
          priority: "medium",
          estimatedCost: "",
          estimatedDuration: "",
          requirements: "",
          benefits: "",
          risks: ""
        });
        onProposalSubmitted?.();
      } else {
        alert("Failed to submit proposal. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting proposal:", error);
      alert("Failed to submit proposal. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <FileText className="w-4 h-4 mr-2" />
          Submit Proposal
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Submit New Proposal</DialogTitle>
          <DialogDescription>
            Submit a proposal for club activities, improvements, or events.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Proposal Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter proposal title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe your proposal in detail"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="event">Event</SelectItem>
                <SelectItem value="activity">Activity</SelectItem>
                <SelectItem value="improvement">Improvement</SelectItem>
                <SelectItem value="funding">Funding</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select value={formData.priority} onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="estimatedCost">Estimated Cost (Optional)</Label>
              <Input
                id="estimatedCost"
                type="number"
                step="0.01"
                value={formData.estimatedCost}
                onChange={(e) => setFormData(prev => ({ ...prev, estimatedCost: e.target.value }))}
                placeholder="Enter estimated cost"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="estimatedDuration">Estimated Duration (Optional)</Label>
            <Input
              id="estimatedDuration"
              value={formData.estimatedDuration}
              onChange={(e) => setFormData(prev => ({ ...prev, estimatedDuration: e.target.value }))}
              placeholder="e.g., 2 weeks, 1 month, etc."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="requirements">Requirements (One per line)</Label>
            <Textarea
              id="requirements"
              value={formData.requirements}
              onChange={(e) => setFormData(prev => ({ ...prev, requirements: e.target.value }))}
              placeholder="List the requirements for this proposal (one per line)"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="benefits">Benefits (One per line)</Label>
            <Textarea
              id="benefits"
              value={formData.benefits}
              onChange={(e) => setFormData(prev => ({ ...prev, benefits: e.target.value }))}
              placeholder="List the benefits of this proposal (one per line)"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="risks">Potential Risks (One per line)</Label>
            <Textarea
              id="risks"
              value={formData.risks}
              onChange={(e) => setFormData(prev => ({ ...prev, risks: e.target.value }))}
              placeholder="List any potential risks (one per line)"
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Submitting..." : "Submit Proposal"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
