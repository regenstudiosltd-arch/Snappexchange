"use client";

import { useState } from "react";
import { X, Upload, Users, Calendar, DollarSign, Shield, ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { LivePictureCapture } from "../LivePictureCapture";

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (groupData: any) => void;
}

export function CreateGroupModal({ isOpen, onClose, onComplete }: CreateGroupModalProps) {
  const [step, setStep] = useState(1);
  const [adminVerified, setAdminVerified] = useState(false);
  const [livePictureData, setLivePictureData] = useState<string>("");
  const [formData, setFormData] = useState({
    // Admin Verification
    adminFullName: "",
    adminAge: "",
    adminEmail: "",
    adminContact: "",
    adminLocation: "",
    adminOccupation: "",
    ghanaCardFront: null as File | null,
    ghanaCardBack: null as File | null,
    
    // Group Details
    groupName: "",
    contributionAmount: "",
    contributionFrequency: "",
    payoutTimeline: "",
    memberCount: "",
    groupDescription: "",
  });

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (field: string, file: File | null) => {
    updateFormData(field, file);
  };

  const handleSubmit = () => {
    if (step === 1 && !adminVerified) {
      // Simulate admin verification
      setAdminVerified(true);
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    } else if (step === 3) {
      // Create group
      const newGroup = {
        id: Date.now().toString(),
        ...formData,
        livePicture: livePictureData,
        createdAt: new Date().toISOString(),
        members: [{ id: "current-user", role: "admin" }],
        totalSaved: 0,
      };
      
      // Save to localStorage
      const groups = JSON.parse(localStorage.getItem("groups") || "[]");
      groups.push(newGroup);
      localStorage.setItem("groups", JSON.stringify(groups));
      
      onComplete(newGroup);
      onClose();
      resetForm();
    }
  };

  const resetForm = () => {
    setStep(1);
    setAdminVerified(false);
    setLivePictureData("");
    setFormData({
      adminFullName: "",
      adminAge: "",
      adminEmail: "",
      adminContact: "",
      adminLocation: "",
      adminOccupation: "",
      ghanaCardFront: null,
      ghanaCardBack: null,
      groupName: "",
      contributionAmount: "",
      contributionFrequency: "",
      payoutTimeline: "",
      memberCount: "",
      groupDescription: "",
    });
  };

  const isStep1Valid = formData.adminFullName && formData.adminAge && formData.adminEmail && 
                       formData.adminContact && formData.adminLocation && formData.adminOccupation &&
                       formData.ghanaCardFront && formData.ghanaCardBack && livePictureData;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {step === 1 ? "Admin Verification Required" : step === 2 ? "Group Details" : "Review & Create"}
          </DialogTitle>
          <DialogDescription>
            {step === 1 ? "Verify your identity to create a savings group" : 
             step === 2 ? "Set up your group's contribution rules" :
             "Review and confirm group creation"}
          </DialogDescription>
          
          {/* Progress */}
          <div className="flex gap-2 mt-4">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-2 flex-1 rounded-full ${
                  step >= s ? "bg-cyan-500" : "bg-gray-200"
                }`}
              />
            ))}
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Step 1: Admin Verification */}
          {step === 1 && (
            <>
              <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4 flex items-start gap-3">
                <Shield className="h-5 w-5 text-cyan-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="mb-1">Admin verification is required to ensure trust and security within savings groups.</p>
                  <p className="text-muted-foreground text-xs">Your information will be kept confidential and secure.</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Full Name *</Label>
                  <Input
                    value={formData.adminFullName}
                    onChange={(e) => updateFormData("adminFullName", e.target.value)}
                    placeholder="Enter full name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Age *</Label>
                  <Input
                    type="number"
                    value={formData.adminAge}
                    onChange={(e) => updateFormData("adminAge", e.target.value)}
                    placeholder="Enter age"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Email Address *</Label>
                <Input
                  type="email"
                  value={formData.adminEmail}
                  onChange={(e) => updateFormData("adminEmail", e.target.value)}
                  placeholder="your@email.com"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Contact Number *</Label>
                  <Input
                    value={formData.adminContact}
                    onChange={(e) => updateFormData("adminContact", e.target.value)}
                    placeholder="0XX XXX XXXX"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Location *</Label>
                  <Input
                    value={formData.adminLocation}
                    onChange={(e) => updateFormData("adminLocation", e.target.value)}
                    placeholder="City, Region"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Occupation *</Label>
                <Input
                  value={formData.adminOccupation}
                  onChange={(e) => updateFormData("adminOccupation", e.target.value)}
                  placeholder="Your occupation"
                  required
                />
              </div>

              <div className="space-y-3">
                <Label>Identity Verification *</Label>
                
                <div className="space-y-2">
                  <label className="flex items-center gap-2 p-3 border-2 border-dashed rounded-lg cursor-pointer hover:border-cyan-500 transition-colors">
                    <Upload className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm">{formData.ghanaCardFront ? "Ghana Card Front ✓" : "Upload Ghana Card (Front)"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload("ghanaCardFront", e.target.files?.[0] || null)}
                      className="hidden"
                      required
                    />
                  </label>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 p-3 border-2 border-dashed rounded-lg cursor-pointer hover:border-cyan-500 transition-colors">
                    <Upload className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm">{formData.ghanaCardBack ? "Ghana Card Back ✓" : "Upload Ghana Card (Back)"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload("ghanaCardBack", e.target.files?.[0] || null)}
                      className="hidden"
                      required
                    />
                  </label>
                </div>

                <div className="space-y-2">
                  <Label>Live Picture *</Label>
                  <LivePictureCapture
                    onCapture={setLivePictureData}
                    capturedImage={livePictureData}
                  />
                </div>
              </div>
            </>
          )}

          {/* Step 2: Group Details */}
          {step === 2 && (
            <>
              <div className="space-y-2">
                <Label>Group Name</Label>
                <div className="relative">
                  <Users className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input
                    value={formData.groupName}
                    onChange={(e) => updateFormData("groupName", e.target.value)}
                    placeholder="e.g., Family Savings Circle"
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Contribution Amount (₵)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <Input
                      type="number"
                      value={formData.contributionAmount}
                      onChange={(e) => updateFormData("contributionAmount", e.target.value)}
                      placeholder="100"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Frequency</Label>
                  <Select
                    value={formData.contributionFrequency}
                    onValueChange={(value) => updateFormData("contributionFrequency", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Daily">Daily</SelectItem>
                      <SelectItem value="Weekly">Weekly</SelectItem>
                      <SelectItem value="Monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Payout Timeline</Label>
                  <Input
                    value={formData.payoutTimeline}
                    onChange={(e) => updateFormData("payoutTimeline", e.target.value)}
                    placeholder="e.g., 30 days"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Expected Members</Label>
                  <Input
                    type="number"
                    value={formData.memberCount}
                    onChange={(e) => updateFormData("memberCount", e.target.value)}
                    placeholder="10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Group Description (Optional)</Label>
                <textarea
                  value={formData.groupDescription}
                  onChange={(e) => updateFormData("groupDescription", e.target.value)}
                  placeholder="Describe the purpose and rules of your group..."
                  className="w-full min-h-[100px] p-3 rounded-lg border border-input bg-background"
                />
              </div>
            </>
          )}

          {/* Step 3: Terms & Confirmation */}
          {step === 3 && (
            <>
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <h4>Group Summary</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">Group Name:</span>
                      <p>{formData.groupName}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Contribution:</span>
                      <p>₵{formData.contributionAmount} {formData.contributionFrequency}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Payout Timeline:</span>
                      <p>{formData.payoutTimeline}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Members:</span>
                      <p>{formData.memberCount} people</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4>Terms & Conditions</h4>
                  <div className="border rounded-lg p-4 max-h-[200px] overflow-y-auto text-sm space-y-2">
                    <p>1. As a group admin, you are responsible for managing contributions and payouts.</p>
                    <p>2. All members must contribute on time according to the agreed schedule.</p>
                    <p>3. Payout rotation will be determined fairly and transparently.</p>
                    <p>4. An 8% service fee applies to all cash-out transactions.</p>
                    <p>5. You agree to maintain accurate records and honest communication.</p>
                    <p>6. SnappX reserves the right to suspend groups that violate terms.</p>
                  </div>
                  
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input type="checkbox" className="mt-1 rounded border-gray-300" required />
                    <span className="text-sm text-muted-foreground">
                      I agree to the terms and conditions and will manage this group responsibly
                    </span>
                  </label>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex gap-3">
          {step > 1 && (
            <Button variant="outline" onClick={() => setStep(step - 1)} className="flex-1">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          )}
          <Button
            onClick={handleSubmit}
            className="flex-1 bg-cyan-500 hover:bg-cyan-600"
            disabled={
              (step === 1 && !isStep1Valid) ||
              (step === 2 && (!formData.groupName || !formData.contributionAmount || !formData.contributionFrequency))
            }
          >
            {step === 3 ? "Create Group" : "Continue"}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}