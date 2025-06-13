"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { Input } from "@/components/ui/input";
import DialogFormConfirm from "./dialogFormConfirm";
import { StatusPopover, SymptomsPopover } from "./popoverForm";
import { navigateToTicket } from "@/utils/ticketNavigation";

export default function PatientForm({
  initialSymptoms = [],
}: {
  initialSymptoms?: any[];
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [studentId, setStudentId] = useState("");
  const [otherSymptom, setOtherSymptom] = useState("");
  const [statusValue, setStatusValue] = useState("");
  const [symptoms, setSymptoms] = useState<any[]>(initialSymptoms);
  const [selectedSymptoms, setSelectedSymptoms] = useState<number[]>([]);
  const [open, setOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [name, setName] = useState("");
  const [csrfToken, setCsrfToken] = useState('');
  const [genderOptions, setGenderOptions] = useState<any[]>([]);
  const [gender, setGender] = useState("");

  useEffect(() => {
    if (!initialSymptoms.length) {
      fetch("/api/patientform/symptoms")
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setSymptoms(data);
          } else {
            setSymptoms([]);
          }
        })
        .catch(() => setSymptoms([]));
    }
  }, []);

  useEffect(() => {
    fetch("/api/patientform/gender")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setGenderOptions(data);
        else setGenderOptions([]);
      })
      .catch(() => setGenderOptions([]));
  }, []);

  const toggleSymptom = (id: string) => {
    const numId = Number(id);
    setSelectedSymptoms((prev) =>
      prev.includes(numId) ? prev.filter((s) => s !== numId) : [...prev, numId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};
    if (!name.trim()) newErrors.name = "กรุณากรอกชื่อ";
    if (!gender) newErrors.gender = "กรุณาเลือกเพศ";
    if (!statusValue) newErrors.status = "กรุณาเลือกสถานะ";
    if (statusValue === "1" && !studentId.trim())
      newErrors.studentId = "กรุณากรอกรหัสนักศึกษา";
    if (statusValue === "2" && !studentId.trim())
      newErrors.studentId = "กรุณากรอก Personal ID";
    if (selectedSymptoms.length === 0) newErrors.symptom = "กรุณาเลือกอาการ";
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    if (selectedSymptoms.includes(12) && !otherSymptom.trim()) {
      newErrors.otherSymptom = "กรุณาระบุอาการอื่นๆ";
      setErrors(newErrors);
      return;
    }
    setShowConfirmDialog(true);
  };

  // Helper to get CSRF token
  async function getCsrfToken(): Promise<string> {
    const res = await fetch('/api/csrf');
    const data = await res.json();
    return data.csrfToken;
  }

  // Helper to POST/PUT with CSRF and auto-retry on 403
  async function fetchWithCsrfRetry(
    url: string,
    options: RequestInit = {},
    maxRetry = 1
  ): Promise<Response> {
    let csrfToken = await getCsrfToken();
    let attempt = 0;
    while (attempt <= maxRetry) {
      const res = await fetch(url, {
        ...options,
        headers: {
          ...(options.headers ? options.headers : {}),
          'csrf-token': csrfToken,
        },
      });
      if (res.status !== 403) return res;
      // If forbidden, try to get a new token and retry
      csrfToken = await getCsrfToken();
      attempt++;
    }
    throw new Error('Forbidden: CSRF token expired or invalid');
  }

  const handleConfirmSubmit = async () => {
    const formData = {
      name,
      gender,
      status: statusValue,
      studentId,
      selectedSymptoms: selectedSymptoms.map(Number),
      otherSymptom: selectedSymptoms.includes(12) ? otherSymptom : "",
    };
    try {
      const res = await fetchWithCsrfRetry("/api/patientform/submitform", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        const data = await res.json();
        setShowConfirmDialog(false);
        toast.success("บันทึกข้อมูลสำเร็จแล้ว!", { duration: 4000 });
        await navigateToTicket({
          id: data.patientRecordId.toString(),
          name: data.name,
          symptoms: data.symptoms,
          otherSymptom: data.otherSymptom
        });
        return;
      } else {
        const errorData = await res.json();
        setShowConfirmDialog(false);
        toast.error(errorData.error || "เกิดข้อผิดพลาดในการส่งข้อมูล");
      }
    } catch (error) {
      setShowConfirmDialog(false);
      toast.error("เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์");
    }
  };
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4">
        <div className="flex flex-col items-center justify-center w-full max-w-xl p-8 bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20">
          <h2 className="mb-8 text-3xl font-semibold text-slate-800 text-center drop-shadow-sm">
            แบบสอบถามอาการ
          </h2>
          <div className="w-full">
            <form className="space-y-6" onSubmit={handleSubmit}>
              {" "}
              <div>
                <label
                  htmlFor="name"
                  className="block mb-2 text-lg font-medium text-slate-700"
                >
                  ชื่อ-นามสกุล
                </label>{" "}
                <Input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="กรุณากรอกชื่อ-นามสกุล"
                  required
                />
                {errors.name && (
                  <span className="text-red-500 text-sm mt-1">{errors.name}</span>
                )}
              </div>
              <div>
                <label
                  htmlFor="gender"
                  className="block mb-2 text-lg font-medium text-slate-700"
                >
                  เพศ
                </label>
                <select
                  id="gender"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                  required
                >
                  <option value="">กรุณาเลือกเพศ</option>
                  {genderOptions.map((g: any) => (
                    <option key={g.gender_id} value={g.gender_id}>{g.gender_name}</option>
                  ))}
                </select>
                {errors.gender && (
                  <span className="text-red-500 text-sm mt-1">{errors.gender}</span>
                )}
              </div>
              <div>
                <label
                  htmlFor="status"
                  className="block mb-2 text-lg font-medium text-slate-700"
                >
                  สถานะ
                </label>
                <StatusPopover
                
                  open={statusOpen}
                  setOpen={setStatusOpen}
                  statusValue={statusValue}
                  setStatusValue={setStatusValue}
                />
                {errors.status && (
                  <span className="text-red-500 text-sm">{errors.status}</span>
                )}
              </div>{" "}
              {statusValue === "1" && (
                <div className="transition-all duration-300 ease-in-out">
                  <label
                    htmlFor="studentId"
                    className="block mb-2 text-lg font-medium text-slate-700"
                  >
                    Student ID
                  </label>
                  <Input
                    placeholder="กรุณากรอกรหัสนักศึกษา"
                    type="text"
                    id="studentId"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    required
                  />
                  {errors.studentId && (
                    <span className="text-red-500 text-sm mt-1">
                      {errors.studentId}
                    </span>
                  )}
                </div>
              )}{" "}
              {statusValue === "2" && (
                <div className="transition-all duration-300 ease-in-out">
                  <label
                    htmlFor="studentId"
                    className="block mb-2 text-lg font-medium text-slate-700"
                  >
                    Personal ID
                  </label>
                  <Input
                  placeholder="กรุณากรอกรหัสประจำตัว"
                    type="text"
                    id="studentId"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    required
                  />
                  {errors.studentId && (
                    <span className="text-red-500 text-sm mt-1">
                      {errors.studentId}
                    </span>
                  )}
                </div>
              )}{" "}
              <div>
                <label
                  htmlFor="symptom"
                  className="block mb-2 text-lg font-medium text-slate-700"
                >
                  อาการ
                </label>
                <SymptomsPopover
                  open={open}
                  setOpen={setOpen}
                  symptoms={symptoms}
                  selectedSymptoms={selectedSymptoms}
                  toggleSymptom={toggleSymptom}
                />
                {/* Show "อื่นๆ" input if symptom ID 12 is selected */}{" "}
                {selectedSymptoms.includes(12) && (
                  <div className="mt-4 transition-all duration-300 ease-in-out">
                    <label
                      htmlFor="otherSymptom"
                      className="block mb-2 text-lg font-medium text-slate-700"
                    >
                      หมายเหตุ
                    </label>
                    <Input
                      type="text"
                      id="otherSymptom"
                      value={otherSymptom}
                      onChange={(e) => setOtherSymptom(e.target.value)}
                      required
                    />
                    {errors.otherSymptom && (
                      <span className="text-red-500 text-sm mt-1">
                        {errors.otherSymptom}
                      </span>
                    )}
                  </div>
                )}
                {errors.symptom && (
                  <span className="text-red-500 text-sm mt-1">
                    {errors.symptom}
                  </span>
                )}
              </div>
              <button
                type="submit"
                className="w-full py-3 mt-6 text-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg hover:from-blue-700 hover:to-indigo-700 transform hover:scale-[1.02] transition-all duration-200 focus:ring-4 focus:ring-blue-300 shadow-lg"
              >
                บันทึกข้อมูล
              </button>
            </form>
          </div>
        </div>
        <DialogFormConfirm
          open={showConfirmDialog}
          setOpen={setShowConfirmDialog}
          name={name}
          statusValue={statusValue}
          studentId={studentId}
          symptoms={symptoms}
          selectedSymptoms={selectedSymptoms}
          otherSymptom={otherSymptom}
          onConfirm={handleConfirmSubmit}
        />
      </main>
    );
  }
