import { useEffect, useState } from "react";
import "./App.css";
import type { Event } from "./Types/Event";

function App() {
  const [events, setEvents] = useState<Event[] | null>([]);

  useEffect(() => {
    fetch("https://localhost:5001/api/events")
      .then((response) => response.json())
      .then((data) => setEvents(data))
      .catch((error) => console.error("Error fetching events:", error));
  }, []);

  console.log(events);

  return (
    <>
      <h1>Events</h1>
      {events?.map((event: Event) => (
        <div key={event.id}>
          <h2>{event.title}</h2>
          <p>{event.description}</p>
          <p>Date: {new Date(event.date).toLocaleDateString()}</p>
        </div>
      ))}
    </>
  );
}

export default App;
