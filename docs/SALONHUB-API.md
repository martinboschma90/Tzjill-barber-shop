# Salonhub online appointment

Customers book on Tzjill. The browser talks only to `/api/salonhub`. That route calls Salonhub from the server. Nothing redirects the customer to `afspraak.salonhub.nl`.

Checked 22 Sep 2026 against the live widget for client `tzjill`, salon `tzjill`.

## What the widget does

1. Behandeling — `POST /v3/api/OnlineAppointment.Remote.Treatments/get`
2. Kapper — `POST /v3/api/OnlineAppointment.Remote.Employees/getForTreatment`
3. Datum — `POST /v3/api/OnlineAppointment.Remote.Dates/get`
4. Tijd — `POST /v3/api/OnlineAppointment.Remote.Times/get`
5. Bevestigen — `POST /v3/api/OnlineAppointment.Remote.Appointments/create`
6. If Salonhub answers `verify` — code entry on our page calls `Appointments/verify`

Base: `https://public.salonhub.nl`. Salon is fixed in the adapter (`tzjill` / `tzjill`). The browser cannot choose another salon.

Form fields on the reads: `client`, `salon`, `session`, plus `treatment`, `employee`, `date`, `start`, `limit` where that step needs them. `session` is a UUID we generate. The UUID in a Salonhub page URL (`/tzjill/tzjill/<uuid>/treatment`) is that same client session, not a treatment id.

Reads succeed without a bearer token. Create, verify, and `Session/start` return 401 without one. The booking SPA sends `Authorization: Bearer <key>` with a key compiled into `afspraak.salonhub.nl`’s JavaScript. Our server resolves that public key from the current bundle at runtime, or uses `SALONHUB_API_KEY` when that env var is set and Salonhub accepts it. The key is never sent to the browser and is not committed.

`SALONHUB_API_KEY` is the admin key from Salonhub (Algemeen → API sleutels). Public docs do not describe a separate admin base URL. If that key is for a different API, leave it unset: create still uses the public widget bearer.

## CMS

`site.bookingTreatments` is optional and admin-only. Empty means the widget shows the live Salonhub list, so prices and durations stay Salonhub’s. A saved row can hide a treatment (`active: false`), change sort, or replace the label. It does not store the price.

## Create body

`POST /v3/api/OnlineAppointment.Remote.Appointments/create?client&salon&session`

JSON matches the SPA: `settings` (application `nl.salonhub.afspraak`, guid, email verify template on `afspraak.salonhub.nl`), `appointment.date`, one treatment (`id`, `name`, `length`, `time`) and employee (`id`, `name`; `0` is “Geen voorkeur”), and `customer` (name, email, E.164 phone).

The verify link inside Salonhub’s mail still points at their host. That is their mail, not our page. The code can be entered on Tzjill.

## Still unknown

These are for Salonhub support (`info@salonhub.nl`), not blockers for this booking path:

- Is the admin API key the same bearer as the public widget, or a different host and scheme?
- Is there a documented swagger, webhook, or cancel/reschedule API we should prefer over the widget’s create call?
- Will the public widget bearer keep working for server-side create, or should salons use the admin key?

Do not call create from local tests against the live salon. A successful create books a real chair.
