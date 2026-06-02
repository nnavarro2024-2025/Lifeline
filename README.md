
  # Lifeline


  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.

  ## Install notes

  If `npm i` shows a warning about `recharts@2.15.2`, that package version is deprecated upstream. The app can still install and run, but Recharts should be updated to v3 in a future dependency refresh.

  If npm reports a vulnerability, run `npm audit` to see which package is affected before using `npm audit fix --force`, since the force option can introduce breaking changes.

  ## Current updates

  - Login page is now the first screen at `/`, with supportive taglines, email and password fields, a simulated Google UIC sign-in modal, a demo account picker, and a Create account link.
  - Register page is available at `/register` with full name, UIC email validation, password strength feedback, and confirm password.
  - Authentication now auto-detects role from email, sending pre-set counselor accounts to the counselor dashboard and everyone else to the student view.
  - Student chat now uses a setup, chatting, and resolved flow, supports only one active conversation, and lets students switch between real name and nickname or delete the conversation with confirmation.
  - Counselor dashboard now includes Active and Archived tabs, with resolved conversations grouped by risk level and deleted student conversations removed in real time.
  - Anonymity now generates calming nicknames that stay consistent for the whole conversation and change only when a new conversation starts.
  