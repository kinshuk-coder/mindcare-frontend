#  MindCare: Frontend UI

This is the user-facing client for **MindCare**, a cloud-native AI mental health assistant. Built for speed and seamless UX, this React application acts as the presentation layer, connecting to a decoupled RAG-powered (Retrieval-Augmented Generation) microservice backend.

##  Live Demo
* **Frontend Application:** [mindcare-frontend-teal.vercel.app](https://mindcare-frontend-teal.vercel.app)
* **Backend Repository:** [View API Architecture here](https://github.com/kinshuk-coder/mindcare-backend)

##  Architecture & Tech Stack

**Core Technologies:**
* **Framework:** React.js bootstrapped with Vite for ultra-fast Hot Module Replacement (HMR) and optimized production builds.
* **Hosting/Edge Network:** Deployed on Vercel for global edge caching and instant continuous deployments.
* **State Management:** Utilizes browser `localStorage` to generate and persist unique session UUIDs. 

**API Integration:**
* Communicates directly with a custom FastAPI microservice hosted on Render.
* Strictly adheres to CORS policies, ensuring secure, restricted data transfer between the Vercel client and the Render server.

##  Key Engineering Decisions

* **Client-Side Session Generation:** To keep the backend entirely stateless, the frontend generates a unique UUID on the user's first visit. This ID is passed in the header of every request, allowing the backend to route semantic memory fetches (via Pinecone/MongoDB) without requiring heavy user authentication systems.
* **Optimistic UI Rendering:** Chat messages are rendered instantly to the UI while awaiting the HTTP response from the AI backend, preventing visual lag and ensuring a natural, fluid conversational experience.

##  Local Setup & Installation

**1. Clone the repository**
```bash
git clone [https://github.com/kinshuknarang/mindcare-frontend.git](https://github.com/kinshuknarang/mindcare-frontend.git)
cd mindcare-frontend
```

**2. Install dependencies**
```bash
npm install
```

**3. Configure Environment Variables**
Create a `.env` file in the root directory and add your backend API URL. (If using Vite, environment variables must start with `VITE_`):
```text
VITE_API_URL=[https://mindcare-backend-2cv2.onrender.com](https://mindcare-backend-2cv2.onrender.com)
```

**4. Run the development server**
```bash
npm run dev
```
*Note: The frontend will run on `http://localhost:5173` by default. Ensure this port is whitelisted in your backend CORS configuration for local testing.*

##  Author
* **Kinshuk** - Sole Architect & Developer
