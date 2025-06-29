interface Project {
  id: string
  name: string
  description: string
  url: string
  status: "live" | "building" | "error"
  deployedAt: string
  buildTime: string
}


export const projects: Project[] = [
    {
      id: "1",
      name: "My Awesome Project",
      description: "A React application with modern UI",
      url: "my-awesome-project.vinitngr.xyz",
      status: "live",
      deployedAt: "Dec 20, 2024",
      buildTime: "24s",
    },
    {
      id: "2",
      name: "Portfolio Website",
      description: "Personal portfolio built with Next.js",
      url: "portfolio-website.vinitngr.xyz",
      status: "live",
      deployedAt: "Dec 19, 2024",
      buildTime: "18s",
    },
    {
      id: "3",
      name: "E-commerce Store",
      description: "Online store with shopping cart functionality",
      url: "ecommerce-store.vinitngr.xyz",
      status: "building",
      deployedAt: "Dec 20, 2024",
      buildTime: "32s",
    },
  ]


interface FileContent {
  name: string
  content: string
  language: string
}

export const files: FileContent[] = [
    {
      name: "package.json",
      language: "json",
      content: `{
  "name": "my-awesome-project",
  "version": "0.1.0",
  "private": true,
  "dependencies": {
    "@testing-library/jest-dom": "^5.16.4",
    "@testing-library/react": "^13.3.0",
    "@testing-library/user-event": "^13.5.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-scripts": "5.0.1",
    "web-vitals": "^2.1.4"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "eslintConfig": {
    "extends": [
      "react-app",
      "react-app/jest"
    ]
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version"
    ]
  }
}`,
    },
    {
      name: "src/App.js",
      language: "javascript",
      content: `import React from 'react';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Welcome to My Awesome Project</h1>
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;`,
    },
    {
      name: "src/App.css",
      language: "css",
      content: `.App {
  text-align: center;
}

.App-logo {
  height: 40vmin;
  pointer-events: none;
}

@media (prefers-reduced-motion: no-preference) {
  .App-logo {
    animation: App-logo-spin infinite 20s linear;
  }
}

.App-header {
  background-color: #282c34;
  padding: 20px;
  color: white;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: calc(10px + 2vmin);
}

.App-link {
  color: #61dafb;
}

@keyframes App-logo-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}`,
    },
    {
      name: "src/index.js",
      language: "javascript",
      content: `import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();`,
    },
    {
      name: "README.md",
      language: "markdown",
      content: `# My Awesome Project

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### \`npm start\`

Runs the app in the development mode.\\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\\
You may also see any lint errors in the console.

### \`npm test\`

Launches the test runner in the interactive watch mode.\\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### \`npm run build\`

Builds the app for production to the \`build\` folder.\\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\\
Your app is ready to be deployed!

### \`npm run eject\`

**Note: this is a one-way operation. Once you \`eject\`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can \`eject\` at any time. This command will remove the single build dependency from your project.`,
    },
]
