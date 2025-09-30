'use client';

import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useApplyLeave, useLeaveTypes } from '@/hooks/use-leaves';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { Calendar, Upload, TriangleAlert as AlertTriangle, X, FileText } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { format, differenceInBusinessDays, isWeekend, addDays } from 'date-fns';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';

const leaveApplicationSchema = z.object({
  leaveTypeId: z.string().min(1, 'Please select a leave type'),
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

type LeaveApplicationFormData = z.infer<typeof leaveApplicationSchema>;

export default function NewLeavePage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const router = useRouter();
  const { data: leaveTypes, isLoading: typesLoading } = useLeaveTypes();
  const applyLeaveMutation = useApplyLeave();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<LeaveApplicationFormData>({
    resolver: zodResolver(leaveApplicationSchema),
  });

  const watchedValues = watch();
  const startDate = watchedValues.startDate;
  const endDate = watchedValues.endDate;
  const leaveTypeId = watchedValues.leaveTypeId;

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
  const selectedLeaveType = leaveTypes?.find(type => type.id === leaveTypeId);
  const isSickLeave = selectedLeaveType?.name.toLowerCase().includes('sick');
  const requiresMedicalCertificate = isSickLeave && totalDays > 3;
  
  // Check if form is valid for submission
  const isFormValid = !Object.keys(errors).length && 
    watchedValues.leaveTypeId && 
    watchedValues.startDate && 
    watchedValues.endDate && 
    watchedValues.reason?.length >= 10 &&
    (!requiresMedicalCertificate || selectedFile);
  
  const isSubmitDisabled = !isFormValid || applyLeaveMutation.isPending || isUploading;

  const onSubmit = async (data: LeaveApplicationFormData) => {
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
      formData.append('leaveTypeId', data.leaveTypeId);
      formData.append('startDate', data.startDate);
      formData.append('endDate', data.endDate);
      formData.append('reason', data.reason);
      formData.append('totalDays', totalDays.toString());
      
      if (selectedFile) {
        formData.append('file', selectedFile);
      }

      await applyLeaveMutation.mutateAsync(formData);
      router.push('/leaves');
    } catch (error: any) {
      // Handle specific API errors
      const errorMessage = error.response?.data?.message || error.message;
      if (errorMessage.includes('overlapping')) {
        setApiError('You have overlapping leave requests. Please check your existing leaves.');
      } else if (errorMessage.includes('insufficient balance')) {
        setApiError('Insufficient leave balance for this request.');
      } else if (errorMessage.includes('own leave')) {
        setApiError('Managers cannot approve their own leave requests.');
      } else {
        setApiError(errorMessage || 'Failed to submit leave application');
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

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Apply for Leave</h1>
            <p className="text-gray-600">Submit a new leave request for approval</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Leave Application Form
              </CardTitle>
              <CardDescription>
                Fill out the form below to submit your leave request
              </CardDescription>
            </CardHeader>
            <CardContent>
              {apiError && (
                <Alert className="mb-6 border-red-200 bg-red-50">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-700">
                    {apiError}
                  </AlertDescription>
                </Alert>
              )}
              
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="leaveTypeId">Leave Type *</Label>
                    <Select
                      onValueChange={(value) => setValue('leaveTypeId', value)}
                      disabled={typesLoading}
                    >
                      <SelectTrigger className={errors.leaveTypeId ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Select leave type" />
                      </SelectTrigger>
                      <SelectContent>
                        {leaveTypes?.map((type) => (
                          <SelectItem key={type.id} value={type.id}>
                            {type.name} ({type.maxDays} days max)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.leaveTypeId && (
                      <p className="text-sm text-red-500">{errors.leaveTypeId.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Total Days</Label>
                    <div className="p-3 bg-gray-50 rounded-md border">
                      <span className="text-lg font-semibold text-gray-900">
                        {totalDays} business day{totalDays !== 1 ? 's' : ''}
                      </span>
                      {totalDays > 0 && (
                        <p className="text-xs text-gray-500 mt-1">
                          Weekends are excluded from the count
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date *</Label>
                    <Input
                      id="startDate"
                      type="date"
                      {...register('startDate')}
                      className={errors.startDate ? 'border-red-500' : ''}
                      min={format(new Date(), 'yyyy-MM-dd')}
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
                      min={startDate || format(new Date(), 'yyyy-MM-dd')}
                    />
                    {errors.endDate && (
                      <p className="text-sm text-red-500">{errors.endDate.message}</p>
                    )}
                  </div>
                </div>

                {requiresMedicalCertificate && (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start">
                      <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3" />
                      <div>
                        <h4 className="text-sm font-medium text-yellow-800">
                          Medical Certificate Required
                        </h4>
                        <p className="text-sm text-yellow-700 mt-1">
                          Sick leave requests for more than 3 days require a medical certificate.
                          Please upload the document below.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

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
                </div>

                <div className="space-y-2">
                  <Label htmlFor="file">
                    Supporting Document {requiresMedicalCertificate ? '*' : '(Optional)'}
                  </Label>
                  
                  {!selectedFile ? (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                      <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <div className="space-y-2">
                        <Label htmlFor="file" className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
                          Click to upload or drag and drop
                        </Label>
                        <p className="text-xs text-gray-500">
                          PDF, JPG, PNG, DOC, DOCX (max 5MB)
                        </p>
                      </div>
                      <Input
                        id="file"
                        type="file"
                        onChange={handleFileChange}
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                        className="hidden"
                      />
                    </div>
                  ) : (
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <FileText className="h-8 w-8 text-blue-600" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                            <p className="text-xs text-gray-500">
                              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={removeFile}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {requiresMedicalCertificate && !selectedFile && (
                    <p className="text-sm text-red-500">
                      Medical certificate is required for sick leave longer than 3 days
                    </p>
                  )}
                </div>

                {/* Upload Progress */}
                {isUploading && uploadProgress > 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Uploading...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} className="w-full" />
                  </div>
                )}

                <div className="flex justify-end space-x-4 pt-6 border-t">
                  <Button variant="outline" asChild disabled={isSubmitDisabled}>
                    <Link href="/leaves">Cancel</Link>
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitDisabled}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isUploading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Uploading...
                      </>
                    ) : applyLeaveMutation.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Submitting...
                      </>
                    ) : (
                      'Submit Application'
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}
