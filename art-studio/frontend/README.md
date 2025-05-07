# Studio Ghibli AI Art Generator Frontend

A modern web application for generating and editing art in Studio Ghibli style using AI.

## Features

- Generate art from text prompts
- Edit existing images with AI
- Upscale images
- View art generation history
- Modern and responsive UI
- Real-time feedback and progress indicators

## Tech Stack

- React 18
- TypeScript
- Vite
- Chakra UI
- React Query
- React Router
- Axios
- React Dropzone

## Prerequisites

- Node.js 16 or higher
- npm 7 or higher

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file in the root directory:
   ```
   VITE_API_URL=http://localhost:3000/api
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```

## Project Structure

```
src/
  ├── components/     # Reusable UI components
  ├── hooks/         # Custom React hooks
  ├── layouts/       # Layout components
  ├── pages/         # Page components
  ├── services/      # API services
  ├── types/         # TypeScript type definitions
  ├── utils/         # Utility functions
  ├── App.tsx        # Main application component
  └── main.tsx       # Application entry point
```

## Development

- The application uses Chakra UI for styling and components
- React Query is used for data fetching and caching
- React Router handles navigation
- TypeScript ensures type safety
- ESLint and Prettier maintain code quality

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT
