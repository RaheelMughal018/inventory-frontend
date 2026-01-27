
export default function formatDateTime(input: string): string {

    const date = new Date(input);
  
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
  
    let hours = date.getHours();
    const minutes = date.getMinutes(); // not used but kept for flexibility
    const ampm = hours >= 12 ? "PM" : "AM";
  
    hours = hours % 12;
    hours = hours ? hours : 12; // 0 => 12
  
    return `${day}/${month}/${year} ${hours}:${minutes} ${ampm}`;
  }
  