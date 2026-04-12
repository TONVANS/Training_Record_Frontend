// src/components/tables/courses_trainng/add_participant_modal.tsx
"use client";
import { useState, useEffect } from "react";
import { Plus, Loader2, AlertCircle, CheckCircle, Trash2, Search, Users, X, Edit, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import api from "@/util/axios";
import { toast } from "sonner";

interface AddParticipantModalProps {
  courseId: number;
  courseTitle?: string;
  onParticipantAdded: () => void;
  isOpen: boolean;
  onClose: () => void;
}

interface SelectedParticipant {
  id: number;
  enrollment_id?: number;
  employee_code: string;
  first_name_la: string;
  last_name_la: string;
  email?: string;
}

export function AddParticipantModal({
  courseId,
  courseTitle,
  onParticipantAdded,
  isOpen,
  onClose,
}: AddParticipantModalProps) {
  const [employeeCodeSearch, setEmployeeCodeSearch] = useState("");
  const [foundEmployee, setFoundEmployee] = useState<SelectedParticipant | null>(null);
  const [selectedParticipants, setSelectedParticipants] = useState<SelectedParticipant[]>([]);
  const [originalEnrollments, setOriginalEnrollments] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Load existing participants when modal opens
  useEffect(() => {
    if (isOpen && courseId) {
      fetchParticipants();
    }
  }, [isOpen, courseId]);

  const fetchParticipants = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/enrollments', { params: { course_id: courseId } });
      const enrollments = response.data?.data || response.data || [];
      setOriginalEnrollments(enrollments);
      
      const mappedParticipants = enrollments.map((e: any) => ({
        id: e.employee_id,
        enrollment_id: e.id,
        employee_code: e.employee?.employee_code || "N/A",
        first_name_la: e.employee?.first_name_la || "N/A",
        last_name_la: e.employee?.last_name_la || "N/A",
        email: e.employee?.email,
      }));
      
      setSelectedParticipants(mappedParticipants);
    } catch (error) {
      toast.error("ບໍ່ສາມາດໂຫຼດຂໍ້ມູນຜູ້ເຂົ້າຮ່ວມໄດ້");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchEmployee = async (code: string) => {
    setEmployeeCodeSearch(code);
    setSearchError(null);
    
    // Mimic courses_table logic: search when code length >= 5
    if (!code || code.trim().length < 5) {
      setFoundEmployee(null);
      return;
    }

    setIsSearching(true);
    try {
      const response = await api.get(`/employees/code/${code.trim()}`);
      const employee = response.data.data || response.data;
      if (employee) {
        setFoundEmployee({
          id: employee.id,
          employee_code: employee.employee_code,
          first_name_la: employee.first_name_la,
          last_name_la: employee.last_name_la,
          email: employee.email,
        });
      }
    } catch (error: any) {
      setFoundEmployee(null);
      if (error?.response?.status === 404) {
         setSearchError("ບໍ່ພົບຂໍ້ມູນພະນັກງານລະຫັດນີ້");
      }
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddParticipant = () => {
    if (!foundEmployee) return;

    if (selectedParticipants.some((p) => p.id === foundEmployee.id)) {
      toast.error("ພະນັກງານນີ້ຖືກເພີ່ມເຂົ້າໃນລາຍການແລ້ວ");
      return;
    }

    setSelectedParticipants([...selectedParticipants, foundEmployee]);
    setEmployeeCodeSearch("");
    setFoundEmployee(null);
  };

  const removeParticipant = (employeeId: number) => {
    setSelectedParticipants(selectedParticipants.filter((p) => p.id !== employeeId));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      const originalIds = originalEnrollments.map(e => e.employee_id);
      const currentIds = selectedParticipants.map(p => p.id);
      
      const toAdd = selectedParticipants.filter(p => !originalIds.includes(p.id));
      const toDelete = originalEnrollments.filter(e => !currentIds.includes(e.employee_id));

      // Handle additions (Bulk if available, otherwise individual)
      if (toAdd.length > 0) {
        try {
          await api.post('/enrollments/bulk', { 
            employee_ids: toAdd.map(p => p.id), 
            course_id: courseId 
          });
        } catch (bulkError) {
          // Fallback to individual if bulk fails
          const enrollmentPromises = toAdd.map((p) =>
            api.post("/enrollments", {
              employee_id: p.id,
              course_id: courseId,
            })
          );
          await Promise.all(enrollmentPromises);
        }
      }

      // Handle deletions
      if (toDelete.length > 0) {
        await Promise.all(toDelete.map(e => api.delete(`/enrollments/${e.id}`)));
      }

      toast.success("ອັບເດດຜູ້ເຂົ້າຮ່ວມສຳເລັດ");
      onParticipantAdded();
      onClose();
    } catch (error: any) {
      const msg = error?.response?.data?.message || "ເກີດຂໍ້ຜິດພາດ";
      toast.error(msg.includes("already enrolled") || error?.response?.status === 409
        ? "ມີພະນັກງານບາງຄົນລົງທະບຽນໃນຫຼັກສູດນີ້ແລ້ວ" : msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddParticipant();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg flex items-center gap-2">
            <User className="w-5 h-5 text-emerald-600" />
            ຈັດການຜູ້ເຂົ້າຮ່ວມ
          </DialogTitle>
          <DialogDescription className="text-sm">
            ຫຼັກສູດ: <span className="font-semibold text-gray-800">{courseTitle || "ກຳລັງໂຫຼດ..."}</span>
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-10 gap-2">
            <Loader2 className="h-6 w-6 text-emerald-500 animate-spin" />
            <span className="text-sm text-gray-500">ກຳລັງໂຫຼດ...</span>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            {/* Search Section - Emerald Theme */}
            <div className="bg-emerald-50/40 border border-emerald-100 rounded-lg p-4 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-[1fr,1fr,auto] gap-3 items-end">
                <div className="grid gap-1.5">
                  <Label className="text-xs font-medium text-gray-600">ລະຫັດພະນັກງານ</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="ພິມລະຫັດ 5+ ຕົວ..."
                      value={employeeCodeSearch}
                      onChange={(e) => handleSearchEmployee(e.target.value)}
                      onKeyPress={handleKeyPress}
                      disabled={isSearching || isSubmitting}
                      className="pl-10 h-10 bg-white border-emerald-100 focus-visible:ring-emerald-500"
                    />
                    {isSearching && (
                      <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500 animate-spin" />
                    )}
                  </div>
                </div>

                <div className="grid gap-1.5">
                  <Label className="text-xs font-medium text-gray-600">ຊື່ພະນັກງານ</Label>
                  <Input
                    readOnly
                    value={foundEmployee ? `${foundEmployee.first_name_la} ${foundEmployee.last_name_la}` : ""}
                    placeholder="ສະແດງອັດຕະໂນມັດ..."
                    className="bg-white/60 h-10 text-gray-700 border-emerald-100"
                  />
                </div>

                <Button
                  type="button"
                  onClick={handleAddParticipant}
                  disabled={!foundEmployee || isSubmitting}
                  className="h-10 px-6 bg-emerald-600 hover:bg-emerald-700 shadow-sm"
                >
                  ເພີ່ມ
                </Button>
              </div>

              {/* Error Message */}
              {searchError && (
                <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-100 rounded-lg text-xs text-red-600">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{searchError}</span>
                </div>
              )}
            </div>

            {/* Selected Participants List - 2 Column Grid like courses_table */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                ລາຍຊື່ຜູ້ເຂົ້າຮ່ວມ ({selectedParticipants.length} ຄົນ)
              </Label>

              {selectedParticipants.length === 0 ? (
                <div className="p-8 border border-dashed border-gray-200 rounded-lg text-center text-gray-400 text-sm">
                  ຍັງບໍ່ມີຜູ້ເຂົ້າຮ່ວມ
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 bg-gray-50 border border-gray-200 rounded-lg">
                  {selectedParticipants.map((participant) => (
                    <div
                      key={participant.id}
                      className="flex items-center justify-between p-2.5 bg-white border border-gray-100 rounded-lg hover:border-emerald-200 transition-colors shadow-sm"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 text-[10px] border-emerald-100 shrink-0">
                            {participant.employee_code}
                          </Badge>
                          <span className="font-medium text-sm text-gray-900 truncate">
                            {participant.first_name_la} {participant.last_name_la}
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeParticipant(participant.id)}
                        disabled={isSubmitting}
                        className="h-8 w-8 p-0 text-gray-300 hover:text-red-500 hover:bg-red-50 shrink-0"
                      >
                        <X size={14} />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Info Message */}
            {/* <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-700">
              <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>
                ຄົ້ນຫາດ້ວຍລະຫັດພະນັກງານ ແລ້ວກົດ ເພີ່ມ. ເມື່ອກົດບັນທຶກ ລະບົບຈະຊິງຄ໌ລາຍຊື່ຄົນໃໝ່ ແລະ ລົບທີ່ຖືກຕັດອອກ.
              </span>
            </div> */}
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className="h-10 px-6"
          >
            ຍົກເລີກ
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || isLoading}
            className="ml-2 h-10 px-8 bg-emerald-600 hover:bg-emerald-700 shadow-sm min-w-32"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ກຳລັງບັນທຶກ...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                ບັນທຶກ ({selectedParticipants.length})
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
