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

**Chart** (future):
An astrological natal chart computed for a User based on their birth date, time, and location. Contains planetary positions, houses, aspects, and interpretations.
_Avoid_: Carta, horoscope, birth chart

**Birth Data** (future):
The date, time, and geographic location required to compute a Chart. Belongs to a User.

**Natal Chart** (future):
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
