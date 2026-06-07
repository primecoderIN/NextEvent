import { useEffect, useState,Fragment } from "react";
import "./App.css";
import type { Event } from "./Types/Event";
import { ListItem, Typography } from "@mui/material";

function App() {
  const [events, setEvents] = useState<Event[] | null>([]);

  useEffect(() => {
    fetch("https://localhost:5001/api/events")
      .then((response) => response.json())
      .then((data) => setEvents(data))
      .catch((error) => console.error("Error fetching events:", error));
  }, []);


  return (
    <Fragment>
      <Typography variant="h3" >
        Events
      </Typography>

      {events?.map((event: Event) => (
        <ListItem key={event.id}>
          <Typography variant="h5">{event.title}</Typography>
        </ListItem>
      ))}
    </Fragment>
  );
}

export default App;
