# 💸 Snappx Frontend

<a name="readme-top"></a>

> Snappx is a Ghanaian susu savings platform. Lets users join savings groups, track goals, top up wallets via Paystack, and manage their finances with the help of an AI assistant.

## 📗 Table of Contents

- [About](#about)
  - [Built With](#built-with)
  - [Key Features](#key-features)
  - [Live Demo](#live-demo)
- [Backend](#backend)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Setup](#setup)
  - [Environment Variables](#environment-variables)
  - [Run Locally](#run-locally)
- [Authors](#authors)
- [Future Features](#future-features)
- [Contributing](#contributing)
- [License](#license)

---

## 📖 About <a name="about"></a>

Snappx is a fintech platform built for everyday Ghanaians. This repository contains the Next.js frontend. Users can browse and join susu savings groups, track their personal goals, view contribution schedules, initiate MoMo top-ups and cashouts, receive real-time notifications, and chat with an AI savings assistant all from a single dashboard.

### 🛠 Built With <a name="built-with"></a>

<details>
  <summary>Frontend</summary>
  <ul>
    <li><a href="https://nextjs.org/">Next.js 16</a></li>
    <li><a href="https://www.typescriptlang.org/">TypeScript</a></li>
    <li><a href="https://tailwindcss.com/">Tailwind CSS</a></li>
    <li><a href="https://tanstack.com/query">TanStack Query v5</a></li>
    <li><a href="https://www.framer.com/motion/">Framer Motion</a></li>
    <li><a href="https://react-hook-form.com/">React Hook Form</a></li>
    <li><a href="https://zod.dev/">Zod</a></li>
    <li><a href="https://next-auth.js.org/">NextAuth.js</a></li>
    <li><a href="https://axios-http.com/">Axios</a></li>
  </ul>
</details>

<details>
  <summary>Deployment</summary>
  <ul>
    <li><a href="https://vercel.com/">Vercel</a></li>
  </ul>
</details>

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### ✨ Key Features <a name="key-features"></a>

- **Savings group dashboard** - join and manage susu circles, track cycle progress and payout schedules
- **Wallet management** - top up via Paystack Popup JS, cash out to MoMo with live balance display
- **Personal savings goals** - create goals with contribution schedules and progress tracking
- **Analytics dashboard** - savings-over-time charts, distribution breakdowns, and group performance
- **AI savings assistant** - streaming chat scoped to Ghanaian financial literacy and SnappX features
- **Real-time notifications** - in-app notification centre with unread count badge
- **Group invite links** - share invite links, preview groups before joining, and auto-join via link
- **Contribution scheduler** - view upcoming contributions with due-date urgency indicators
- **OTP verification** - phone-based account verification and MoMo identity change confirmation
- **Responsive design** - fully mobile-optimised with drawer-based navigation on small screens

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### 🚀 Live Demo <a name="live-demo"></a>

- [Live App](https://www.snappx.app/)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

## 🔗 Backend <a name="backend"></a>

> This is the frontend repository only. The backend is built with Django, Django REST Framework, Paystack, Groq, and QStash.

👉 [Snappx Backend Repository](https://github.com/kessie2862/snappxx)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

## 💻 Getting Started <a name="getting-started"></a>

### Prerequisites

- [Node.js](https://nodejs.org/) v20+
- A running instance of the [Snappx backend](https://github.com/kessie2862/snappxx)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Setup

Clone the repository:

```sh
git clone https://github.com/regenstudiosltd-arch/Snappexchange.git
cd Snappexchange
```

Install dependencies:

```sh
npm install
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Environment Variables <a name="environment-variables"></a>

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_...
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=http://localhost:3000
```

For production, point these at your deployed backend:

```env
NEXT_PUBLIC_API_URL=https://snappx-backend-ochre.vercel.app/api
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_live_...
NEXTAUTH_SECRET=your-production-secret
NEXTAUTH_URL=https://snappx.app
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Run Locally <a name="run-locally"></a>

```sh
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

> Make sure the backend is running before starting the frontend so authentication and data fetching work correctly.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

## 👥 Authors <a name="authors"></a>

👤 **Prosper Kessie**

- GitHub: [@kessie2862](https://github.com/kessie2862)
- LinkedIn: [Prosper Kessie](https://www.linkedin.com/in/prosperkessie/)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

## 🔭 Future Features <a name="future-features"></a>

- [ ] Group admin panel with member management
- [ ] Offline-first contribution tracking
- [ ] Mobile app (React Native)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

## 🤝 Contributing <a name="contributing"></a>

Contributions, issues, and feature requests are welcome.

Feel free to check the [issues page](https://github.com/regenstudiosltd-arch/Snappexchange/issues).

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

## ⭐️ Show your support <a name="support"></a>

If you found this project useful, give it a ⭐️. It helps a lot.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

## 📝 License <a name="license"></a>

This project is [MIT](./LICENSE) licensed.

<p align="right">(<a href="#readme-top">back to top</a>)</p>
