"use client";
import dynamic from "next/dynamic";

const PatientForm = dynamic(() => import("@/components/patientform/PatientForm.client"), { ssr: false });

export default function PatientFormWrapper() {
    return <PatientForm />;
}
