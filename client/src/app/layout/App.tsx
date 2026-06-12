import { useEffect, useState } from "react";
import axios from "axios";
import type { Event } from "../../Types/Event";
import { Navbar } from "./Navbar";

function App() {
  const [events, setEvents] = useState<Event[] | null>([]);

  useEffect(() => {
    axios
      .get<Event[]>("https://localhost:5001/api/events")
      .then((response) => setEvents(response.data))
      .catch((error) => console.error("Error fetching events:", error));
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto max-w-screen-xl px-4 py-8">
        <h1 className="text-3xl font-bold tracking-tight mb-6">Events</h1>
        <ul className="space-y-3">
          {events?.map((event: Event) => (
            <li
              key={event.id}
              className="rounded-lg border border-border bg-card p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <h2 className="text-lg font-semibold">{event.title}</h2>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}

export default App;
