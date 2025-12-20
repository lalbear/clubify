"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Send } from "lucide-react";
import { apiClient } from "@/lib/api";

interface EmailPortalModalProps {
  onEmailSent?: () => void;
}

export default function EmailPortalModal({ onEmailSent }: EmailPortalModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [leadsAndBoard, setLeadsAndBoard] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    recipient: "",
    subject: "",
    message: ""
  });

  useEffect(() => {
    if (open) {
      loadLeadsAndBoard();
    }
  }, [open]);

  const loadLeadsAndBoard = async () => {
    try {
      // Load both leads and board members
      const [leadsRes, boardRes] = await Promise.all([
        apiClient.getUsers("lead"),
        apiClient.getUsers("board")
      ]);
      
      const combined = [
        ...(leadsRes.users || []),
        ...(boardRes.users || [])
      ];
      
      setLeadsAndBoard(combined);
    } catch (error) {
      console.error("Error loading recipients:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await apiClient.sendEmailToLead(
        formData.recipient,
        formData.subject,
        formData.message
      );
      
      if (response.success) {
        alert(`Email sent successfully to ${response.recipient.name}!`);
        setOpen(false);
        setFormData({
          recipient: "",
          subject: "",
          message: ""
        });
        onEmailSent?.();
      } else {
        alert(response.message || "Failed to send email. Please try again.");
      }
    } catch (error) {
      console.error("Error sending email:", error);
      alert("Failed to send email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const selectedRecipient = leadsAndBoard.find(u => u._id === formData.recipient);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Mail className="w-4 h-4 mr-2" />
          Send Email to Lead
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>📧 Send Email to Lead/Board</DialogTitle>
          <DialogDescription>
            Send an email directly to a club lead or board member. They will receive it in their inbox.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="recipient">Select Recipient *</Label>
            <Select 
              value={formData.recipient} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, recipient: value }))}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a lead or board member" />
              </SelectTrigger>
              <SelectContent>
                {leadsAndBoard.map((person) => (
                  <SelectItem key={person._id} value={person._id}>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{person.name}</span>
                      <span className="text-xs text-gray-500">
                        ({person.role === 'lead' ? '👔 Lead' : '👑 Board'})
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedRecipient && (
              <p className="text-sm text-gray-600">
                📮 Will be sent to: {selectedRecipient.email}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Subject *</Label>
            <Input
              id="subject"
              value={formData.subject}
              onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
              placeholder="e.g., Question about upcoming event"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message *</Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
              placeholder="Write your message here...&#10;&#10;They can reply directly to your email."
              rows={8}
              required
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Sending..." : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Email
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
