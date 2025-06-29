import 'dotenv/config';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq } from 'drizzle-orm';
import { projectsTable, usersTable } from './schema';
  
const db = drizzle(process.env.DATABASE_URL!);

// async function main() {
//   const user = {
//     name: 'vinit',
//     email: 'vinit@example.com',
//   };

//   await db.insert(usersTable).values(user);
//   console.log('New user created!')

//   const users = await db.select().from(usersTable);
//   console.log('Getting all users from the database: ', users)

//   await db.delete(usersTable).where(eq(usersTable.email, user.email));
//   console.log('User deleted!')
// }

// main();
await db.insert(projectsTable).values([
  {
    projectName: "Vinit's Portfolio",
    url: "https://vinitportfolio.com",
    description: "Personal portfolio website showcasing projects and skills.",
    githubUrl: "https://github.com/vinitngr/portfolio",
    buildTime: 120,
    email: "vinitnagar56@gmail.com",
  },
  {
    projectName: "Chat App",
    url: "https://vinitchatapp.com",
    description: "Real-time chat application with WebSocket support.",
    githubUrl: "https://github.com/vinitngr/chat-app",
    buildTime: 300,
    email: "vinitnagar56@gmail.com",
  },
  {
    projectName: "Blog Platform",
    url: "https://vinitblog.com",
    description: "Custom blogging platform with markdown support.",
    githubUrl: "https://github.com/vinitngr/blog-platform",
    buildTime: 200,
    email: "vinitnagar56@gmail.com",
  },
  {
    projectName: "Open Source Library",
    url: "https://github.com/vinitngr/opensource-lib",
    description: "Reusable JS library for common UI components.",
    githubUrl: "https://github.com/vinitngr/opensource-lib",
    buildTime: 400,
    email: "nagarvinit56@gmail.com",
  },
  {
    projectName: "Weather App",
    url: "https://weather.vinitngr.com",
    description: "Weather forecasting app using public APIs.",
    buildTime: 100,
    email: "vinitnagar56@gmail.com",
  },
]);
