# Booking flow

Stap 1 is on Tzjill: treatment rows with live prices, grouped the way Salonhub groups them (Heren / Kinderen, then Haircut / Scheren). The customer picks a row, then **Naar de agenda**.

Stap 2 embeds the Salonhub agenda in our page. The chrome around it stays Tzjill (dark `#1c1b19`, cream `#f6f3ee`). The widget inside the frame is not restyled. A chosen treatment is passed as `?treatment=` on `https://afspraak.salonhub.nl/tzjill/tzjill`.

`/api/salonhub` still loads the catalog so prices stay Salonhub’s. See [SALONHUB-API.md](./SALONHUB-API.md).
