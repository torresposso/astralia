# Astralia

Astralia is an astrological web application where users register, generate their natal chart, and receive astrological interpretations. This context covers the entire application as a single bounded context for now; future chart and profile subdomains may split into their own contexts.

## Language

**User**:
A person who has registered and can authenticate with email and password. Has identity (id), name, email, and optional image.
_Avoid_: Customer, member, account, client

**Session**:
An authenticated browser session tied to a User. Created on sign in, destroyed on sign out. Managed by better-auth.
_Avoid_: Login, token, cookie

**Sign In**:
The act of authenticating a User with email + password. Creates a Session.
_Avoid_: Login, log in, entrar

**Sign Up**:
The act of registering a new User with name, email, and password. Creates a User and starts a Session.
_Avoid_: Register, create account, signup (acceptable in code identifiers)

**Sign Out**:
The act of ending a Session. Destroys the session and redirects to the home page.
_Avoid_: Logout (acceptable in code identifiers), cerrar sesión

**Dashboard**:
The authenticated landing page after sign in. Shows the User's profile information and navigation to future features.

**Birth Data**:
The date, time, and geographic location a User provides to compute their astrological Chart. Stores Birth Date, Birth Time, Time Unknown flag, and resolved Coordinates + Timezone. Owns the raw input data that flows into CaelusBirthConverter. Belongs to a User.
_Avoid_: Dato de nacimiento

**Birth Date**:
The calendar date (year, month, day) of a User's birth. Must be between 1800-01-01 and today. Belongs to Birth Data.
_Avoid_: Fecha de nacimiento, DOB

**Birth Time**:
The local clock time (hour, minute) of a User's birth. Optional — when unknown, defaults to 12:00 noon with a Whole Sign house system warning. Belongs to Birth Data.
_Avoid_: Hora de nacimiento, birth hour

**Time Unknown**:
A boolean flag on Birth Data indicating the User does not know their exact birth time. When true, the system uses 12:00 noon default and Whole Sign houses with a prominent warning.
_Avoid_: Sin hora, no time

**Place of Birth**:
The geographic location name of a User's birth (e.g., "Cartagena, Bolívar, Colombia"). Free-text field stored as display metadata. The canonical data for calculations are the coordinates (latitude, longitude), not the place name.
_Avoid_: Lugar de nacimiento, birthplace

**Coordinates**:
The latitude and longitude of a Place of Birth. Latitude ranges -90 to 90 (north positive). Longitude ranges -180 to 180 (EAST positive — Caelus-native convention, so Cartagena is -75.5). Canonical data for astrological calculations.
_Avoid_: Coordenadas, lat/lng (use lat/lon)

**Timezone**:
The IANA timezone identifier (e.g., "America/Bogota") associated with the Place of Birth. Used to convert local birth time to Universal Time for chart calculation. Auto-resolved from coordinates via tz-lookup; optionally overridable by the User.
_Avoid_: Zona horaria, time zone (use timezone), UTC offset

**Local Time**:
The birth time expressed in the local timezone of the Place of Birth. This is how Birth Data is stored — NOT in UT. Conversion to UT happens in Infrastructure.
_Avoid_: Hora local

**Universal Time (UT)**:
The birth time converted from Local Time to the UT (UTC) timescale. Required for Caelus astrological calculations. Computed by CaelusBirthConverter in Infrastructure.

**Geocoding**:
The process of resolving a Place of Birth text to Coordinates and Timezone. Uses the Open-Meteo Geocoding API (free, no API key). Runs client-side for city autocomplete; the resolved lat/lon/tz is sent to the server.

**CaelusBirthConverter**:
An Infrastructure service that converts Birth Data (local time + timezone + coordinates) into Universal Time and Julian Day for astrological calculations. Uses the `caelus-birth` package (depends on tz-lookup + luxon). Lives in Infrastructure, NOT Domain.
_Avoid_: toUT, Caelus converter

**Whole Sign**:
The house system used when Birth Time is unknown. Every house cusp equals the corresponding sign degree. A warning is displayed to the User clarifying that house positions are approximate.
_Avoid_: Casas enteras, Whole Sign houses

**Chart** (next — depends on Birth Data):
An astrological natal chart computed for a User based on their birth date, time, and location. Contains planetary positions, houses, aspects, and interpretations. Requires fully resolved Birth Data (including UT conversion) before it can be calculated.
_Avoid_: Carta, horoscope, birth chart

**Natal Chart** (next):
Synonym for Chart when referring specifically to the moment of birth, not transit or progressed charts.
_Avoid_: Carta natal

**Email**:
A User's email address. Must be unique across all users. Used as the identifier for sign in.
_Avoid_: Correo, mail

**Password**:
A User's secret credential. Must meet minimum length (8 characters) and is stored hashed by better-auth. Never stored or transmitted in plain text.

**Registration**:
The process of creating a new User account. Requires name, email, password, and password confirmation.

**Authentication**:
The process of verifying a User's identity via email and password. Results in a Session.

**Authorization**:
The process of checking whether a Session exists before allowing access to protected routes. Implemented via middleware.
_Avoid_: Auth (ambiguous — can mean authentication or authorization)

**Profile Card**:
The UI component displayed on the Dashboard showing the User's avatar initial, name, email, and membership date.
_Avoid_: User card

**FormError**:
An Astro + Alpine component that renders a reactive error message. Shown below form fields when validation or API errors occur.

**SubmitButton**:
An Astro + Alpine component that renders a submit button with an automatic loading state (disabled, spinner text) during async operations.
