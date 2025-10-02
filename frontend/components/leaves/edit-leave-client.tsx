'use client';

import { useState, useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLeaveDetails, useLeaveTypes, useUpdateLeave } from '@/hooks/use-leaves';
import { Calendar, Upload, TriangleAlert as AlertTriangle, X, FileText, Save } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { format, differenceInBusinessDays, isWeekend, addDays } from 'date-fns';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';

const editLeaveSchema = z.object({
  leaveType: z.string().min(1, 'Please select a leave type'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  reason: z.string().min(10, 'Please provide a detailed reason (minimum 10 characters)'),
}).refine((data) => {
  const start = new Date(data.startDate);
  const end = new Date(data.endDate);
  return start <= end;
}, {
  message: "End date must be after or equal to start date",
  path: ["endDate"],
}).refine((data) => {
  const start = new Date(data.startDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return start >= today;
}, {
  message: "Start date cannot be in the past",
  path: ["startDate"],
});

type EditLeaveFormData = z.infer<typeof editLeaveSchema>;

interface EditLeaveClientProps {
  leaveId: string;
}

export function EditLeaveClient({ leaveId }: EditLeaveClientProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const router = useRouter();
  
  const { data: leave, isLoading: leaveLoading, error: leaveError } = useLeaveDetails(leaveId);
  const { data: leaveTypes, isLoading: typesLoading } = useLeaveTypes();
  const updateLeaveMutation = useUpdateLeave();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<EditLeaveFormData>({
    resolver: zodResolver(editLeaveSchema),
  });

  // Populate form with existing leave data
  useEffect(() => {
    if (leave) {
      reset({
        leaveType: leave.leaveTypeId,
        startDate: leave.startDate,
        endDate: leave.endDate,
        reason: leave.reason,
      });
    }
  }, [leave, reset]);

  const watchedValues = watch();
  const startDate = watchedValues.startDate;
  const endDate = watchedValues.endDate;
  const leaveType = watchedValues.leaveType;

  // Calculate total days (business days only)
  const calculateTotalDays = (start: string, end: string): number => {
    if (!start || !end) return 0;
    
    const startDate = new Date(start);
    const endDate = new Date(end);
    
    if (startDate > endDate) return 0;
    
    let totalDays = 0;
    let currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      if (!isWeekend(currentDate)) {
        totalDays++;
      }
      currentDate = addDays(currentDate, 1);
    }
    
    return totalDays;
  };

  const totalDays = calculateTotalDays(startDate, endDate);
  
  // Check if medical certificate is required
  const selectedLeaveType = leaveTypes?.find(type => type.id === leaveType);
  const isSickLeave = selectedLeaveType?.name.toLowerCase().includes('sick');
  const requiresMedicalCertificate = isSickLeave && totalDays > 3;
  
  // Check if form is valid for submission
  const isFormValid = !Object.keys(errors).length && 
    watchedValues.leaveType && 
    watchedValues.startDate && 
    watchedValues.endDate && 
    watchedValues.reason?.length >= 10 &&
    (!requiresMedicalCertificate || selectedFile || leave?.attachmentUrl);
  
  const isSubmitDisabled = !isFormValid || updateLeaveMutation.isPending || isUploading;

  // Check if leave can be edited
  const canEditLeave = leave && 
    ['PENDING_RM', 'PENDING_HR'].includes(leave.status) && 
    new Date(leave.startDate) >= new Date();

  const onSubmit = async (data: EditLeaveFormData) => {
    if (!leave || !canEditLeave) return;
    
    setApiError(null);
    setIsUploading(true);
    
    try {
      // Simulate file upload progress
      if (selectedFile) {
        for (let i = 0; i <= 100; i += 10) {
          setUploadProgress(i);
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
      
      // Create FormData for multipart/form-data
      const formData = new FormData();
      formData.append('leaveType', data.leaveType); // Fixed: use leaveType instead of leaveTypeId
      formData.append('startDate', data.startDate);
      formData.append('endDate', data.endDate);
      formData.append('reason', data.reason);
      
      if (selectedFile) {
        formData.append('file', selectedFile);
      }

      await updateLeaveMutation.mutateAsync({ id: leave.id, formData });
      router.push(`/leaves/${leave.id}`);
    } catch (error: any) {
      // Handle specific API errors
      const errorMessage = error.response?.data?.message || error.message;
      if (errorMessage.includes('overlapping')) {
        setApiError('You have overlapping leave requests. Please check your existing leaves.');
      } else if (errorMessage.includes('insufficient balance')) {
        setApiError('Insufficient leave balance for this request.');
      } else {
        setApiError(errorMessage || 'Failed to update leave application');
      }
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    
    if (file) {
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setApiError('File size must be less than 5MB');
        return;
      }
      
      // Validate file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        setApiError('Please upload a valid file (PDF, JPG, PNG, DOC, DOCX)');
        return;
      }
      
      setApiError(null);
    }
    
    setSelectedFile(file || null);
  }, []);

  const removeFile = useCallback(() => {
    setSelectedFile(null);
    setApiError(null);
  }, []);

  if (leaveLoading || typesLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-48 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (leaveError || !leave) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-red-600 mb-4">Failed to load leave details</p>
            <Button asChild>
              <Link href="/dashboard">Back to Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!canEditLeave) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Cannot Edit Leave</h3>
            <p className="text-gray-600 mb-4">
              This leave request cannot be edited because it's either already processed or the start date has passed.
            </p>
            <Button asChild>
              <Link href={`/leaves/${leave.id}`}>View Leave Details</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-700">
            ← Back to Dashboard
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Edit Leave Request</CardTitle>
            <CardDescription>
              Update your leave request details. Changes will be reviewed by your manager.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* API Error Alert */}
              {apiError && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{apiError}</AlertDescription>
                </Alert>
              )}

              {/* Leave Type Selection */}
              <div className="space-y-2">
                <Label htmlFor="leaveType">Leave Type *</Label>
                <Select
                  value={leaveType}
                  onValueChange={(value) => setValue('leaveType', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select leave type" />
                  </SelectTrigger>
                  <SelectContent>
                    {leaveTypes?.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.leaveType && (
                  <p className="text-sm text-red-500">{errors.leaveType.message}</p>
                )}
              </div>

              {/* Date Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    {...register('startDate')}
                    className={errors.startDate ? 'border-red-500' : ''}
                  />
                  {errors.startDate && (
                    <p className="text-sm text-red-500">{errors.startDate.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date *</Label>
                  <Input
                    id="endDate"
                    type="date"
                    {...register('endDate')}
                    className={errors.endDate ? 'border-red-500' : ''}
                  />
                  {errors.endDate && (
                    <p className="text-sm text-red-500">{errors.endDate.message}</p>
                  )}
                </div>
              </div>

              {/* Total Days Display */}
              {startDate && endDate && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">
                      Total Days: {totalDays} business day{totalDays !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              )}

              {/* Reason */}
              <div className="space-y-2">
                <Label htmlFor="reason">Reason *</Label>
                <Textarea
                  id="reason"
                  placeholder="Please provide a detailed reason for your leave request..."
                  {...register('reason')}
                  className={errors.reason ? 'border-red-500' : ''}
                  rows={4}
                />
                {errors.reason && (
                  <p className="text-sm text-red-500">{errors.reason.message}</p>
                )}
                <p className="text-sm text-gray-500">
                  Minimum 10 characters required
                </p>
              </div>

              {/* File Upload */}
              <div className="space-y-2">
                <Label htmlFor="file">Supporting Document</Label>
                {requiresMedicalCertificate && (
                  <p className="text-sm text-amber-600 font-medium">
                    Medical certificate required for sick leave over 3 days
                  </p>
                )}
                
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                  <div className="text-center">
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <div className="text-sm text-gray-600">
                      <label htmlFor="file" className="cursor-pointer">
                        <span className="font-medium text-blue-600 hover:text-blue-500">
                          Click to upload
                        </span>
                        {' '}or drag and drop
                      </label>
                      <input
                        id="file"
                        type="file"
                        className="hidden"
                        onChange={handleFileChange}
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      PDF, JPG, PNG, DOC, DOCX (max 5MB)
                    </p>
                  </div>
                </div>

                {/* Selected File Display */}
                {selectedFile && (
                  <div className="flex items-center space-x-2 p-3 bg-green-50 rounded-lg">
                    <FileText className="h-5 w-5 text-green-600" />
                    <span className="text-sm text-green-800 flex-1">
                      {selectedFile.name}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={removeFile}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}

                {/* Existing File Display */}
                {leave.attachmentUrl && !selectedFile && (
                  <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <span className="text-sm text-blue-800 flex-1">
                      Current file attached
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      asChild
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <a href={leave.attachmentUrl} download target="_blank" rel="noopener noreferrer">
                        Download
                      </a>
                    </Button>
                  </div>
                )}

                {/* Upload Progress */}
                {isUploading && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Uploading file...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} className="h-2" />
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push(`/leaves/${leave.id}`)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitDisabled}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {updateLeaveMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Update Leave Request
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
