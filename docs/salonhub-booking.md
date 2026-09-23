# Booking flow

The customer finishes the appointment on Tzjill: behandeling, kapper, dag en tijd on one step, gegevens, and a mail code when Salonhub asks for one. The page and the sticky modal never embed `afspraak.salonhub.nl` and never send the browser there.

Each step calls `/api/salonhub`. That route proxies `public.salonhub.nl` OnlineAppointment. Treatments, employees, dates, and times are anonymous reads. Create and verify stay on the server and use `SALONHUB_API_KEY` when it is accepted, otherwise the public widget bearer resolved at runtime. See [SALONHUB-API.md](./SALONHUB-API.md).

A successful create books a real chair. Do not call it from automated tests.
