#CappuConnect


**Inspiration:**
In today’s fast-changing world, networking often feels overwhelming and time-consuming. A global LinkedIn survey of nearly 16,000 professionals found that while 80% see networking as essential to career success, 40% admit they struggle with it. Between limited time, difficulty finding relevant events, and the intimidation of in-person interactions, especially for new graduates, many people feel stuck. Our team set out to ease those challenges by making professional development more approachable, flexible, and tailored to individual goals.

**What it does:**
CappuConnect is a coffee-chat inspired networking app that supports both casual conversations and structured career workshops. With swipe-style interactions, the platform makes it easy to connect with people who share similar skills and goals. Users can find like-minded peers to exchange ideas and hold each other accountable for growth, while also discovering nearby events tailored to their interests—all designed to make professional development more approachable and personalized.

**How We Built It:**
We built CappuConnect using a modern full-stack approach with Next.js, React, and TypeScript, hosted seamlessly on Vercel. The frontend is styled with Tailwind CSS, while the backend relies on MongoDB, with the MongoDB client handling routing. User authentication and session management are powered by NextAuth, using JWT cookies stored in the database for secure sign-ins and registrations. To provide up-to-date event data, we developed a web scraper with Puppeteer and CSV parser to pull events from Eventbrite, creating our own API and pushing the information to the database. On the Discover page, a cosine similarity algorithm recommends other users with similar skills, industries, or backgrounds, allowing users to swipe left or right for optimal networking matches. The Network page displays event details, tracks which events users have signed up for, shows who connected with them, and provides insights into the number of connections attending each event, making networking smarter and more personalized.

**Challenges:**
One major challenge was building the Discover page without relying on a GPT or AI wrapper to match users. We overcame this by implementing a cosine similarity vector algorithm to accurately recommend users with similar skills, industries, and backgrounds. Another hurdle was setting up secure user authentication and registration. Using NextAuth with JWT cookies and MongoDB, we ensured users could safely sign in, register, and maintain persistent sessions, creating a seamless and secure networking experience.

**Accomplishments:**
We successfully developed a swipe-and-match feature that makes connecting intuitive and engaging. Our team also built a reliable web scraper and a robust authentication system, ensuring users have secure access to the platform. On top of that, we implemented a routing system that clearly displays connections, showcasing the real progress users can make through CappuConnect. This project was especially exciting as three of us were first-time hackers, experimenting with new technologies and exploring a tech stack that was new to three of us, while two members were new to frontend development. This was additionally one of the first times we've applied knowledge from our discrete mathematics and data science classes, using it to implement the cosine similarity algorithm and other backend logic, turning theory into a functional, real-world application.

**What’s Next:**
Next, we plan to expand CappuConnect to new cities, making networking accessible to more professionals. We also aim to support career growth beyond the tech industry, catering to a wider range of fields and interests. Future features will include a live chat function and goal-setting tools to help users connect in real time and track their professional development.
