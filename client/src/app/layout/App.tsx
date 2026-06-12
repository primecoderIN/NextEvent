import { useEffect, useState,Fragment } from "react";
import axios from "axios";
import { CssBaseline, ListItem, Typography } from "@mui/material";
import type { Event } from "../../Types/Event";
import { Navbar } from "./Navbar";

function App() {
  const [events, setEvents] = useState<Event[] | null>([]);

  useEffect(() => {
    axios.get<Event[]>("https://localhost:5001/api/events")
      .then((response) => setEvents(response.data))
      .catch((error) => console.error("Error fetching events:", error));
  }, []);


  return (
    <Fragment>
      <CssBaseline/>
    <Navbar/>

      {events?.map((event: Event) => (
        <ListItem key={event.id}>
          <Typography variant="h5">{event.title}</Typography>
        </ListItem>
      ))}
    </Fragment>
  );
}

export default App;
