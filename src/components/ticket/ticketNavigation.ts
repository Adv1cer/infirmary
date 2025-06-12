

// ฟังก์ชันสำหรับส่งข้อมูลและนำทางไปยังหน้า showticket
export const navigateToTicket = async (ticketData: {
  id: string;
  name: string;
  symptoms: { symptom_id: number; symptom_name: string }[];
  otherSymptom: string;
}) => {
  try {
    // ส่งข้อมูลไปยัง API
    const response = await fetch("/api/showticket", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(ticketData),
    });

    if (response.ok) {
      // เก็บข้อมูลใน sessionStorage สำหรับหน้า showticket
      sessionStorage.setItem(
        `ticket_${ticketData.id}`,
        JSON.stringify({
          name: ticketData.name,
          symptoms: ticketData.symptoms,
          otherSymptom: ticketData.otherSymptom,
        })
      );

      // นำทางไปยังหน้า showticket
      window.location.href = `/showticket/${ticketData.id}`;
    } else {
      console.error("Failed to submit ticket data");
    }
  } catch (error) {
    console.error("Error submitting ticket:", error);
  }
};
