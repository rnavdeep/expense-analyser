# Expense Analyser - Project Documentation

## Table of Contents
1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Features](#features)
5. [Installation & Setup](#installation--setup)
6. [Development Guide](#development-guide)
7. [Architecture](#architecture)
8. [API Integration](#api-integration)
9. [State Management](#state-management)
10. [Routing](#routing)
11. [Components](#components)
12. [Services](#services)
13. [Models](#models)
14. [Deployment](#deployment)
15. [Environment Variables](#environment-variables)

---

## Overview

Expense Analyser is a comprehensive expense tracking and management application built with Vue 3. It allows users to create, manage, and share expenses, upload receipt documents for automatic data extraction, and manage friend connections for expense sharing.

### Key Capabilities
- User authentication and session management
- Expense creation with document uploads
- AWS Textract integration for receipt data extraction
- Real-time notifications via SignalR
- Expense sharing among friends
- Advanced filtering, sorting, and pagination
- Responsive UI with Vuetify components

---

## Tech Stack

### Frontend Framework
- **Vue 3.4.29** - Progressive JavaScript framework
- **TypeScript ~5.4.0** - Type-safe JavaScript superset
- **Vite 5.3.1** - Next-generation frontend tooling

### UI & Styling
- **Vuetify 3.7.0-beta.1** - Material Design component framework
- **Material Design Icons (@mdi/font 7.4.47)** - Icon library

### State Management & Routing
- **Pinia 2.1.7** - Vue state management library
- **Vue Router 4.3.3** - Official router for Vue.js

### HTTP & Real-time Communication
- **Axios 1.7.7** - HTTP client
- **SignalR 8.0.7** - Real-time web communication

### Development Tools
- **ESLint 8.57.0** - Code linting
- **Prettier 3.2.5** - Code formatting
- **vue-tsc 2.0.21** - TypeScript type checking for Vue
- **npm-run-all2 6.2.0** - Run multiple npm scripts

### Additional Libraries
- **vue-resizable 2.1.7** - Resizable components
- **crypto-js 4.2.0** - Cryptographic functions

---

## Project Structure

```
expense-analyser/
├── public/                      # Static assets
│   ├── favicon.ico
├── src/
│   ├── assets/                 # Images, styles, and static resources
│   │   ├── main.css
│   │   ├── base.css
│   │   ├── eaIcon.png
│   │   ├── eaProcessIcon.png
│   │   ├── eaShareExpense.png
│   │   ├── eaUploadIcon.png
│   │   └── logo.svg
│   ├── components/             # Reusable Vue components
│   │   ├── Navbar.vue
│   │   ├── NavigationDrawer.vue
│   │   ├── Login.vue
│   │   ├── Register.vue
│   │   ├── Home.vue
│   │   ├── ExpenseCreate.vue
│   │   ├── ExpenseList.vue
│   │   ├── ExpenseCard.vue
│   │   ├── DocumentUpload.vue
│   │   ├── DocumentResultPage.vue
│   │   ├── FriendsAdd.vue
│   │   ├── FriendsList.vue
│   │   ├── SharedExpenses.vue
│   │   ├── Notifications.vue
│   │   └── WelcomeItem.vue
│   ├── models/                 # TypeScript interfaces and types
│   │   ├── DocumentDialogDto.ts
│   │   ├── ExpenseCreateForm.ts
│   │   ├── ExpenseDto.ts
│   │   ├── ExpenseResults.ts
│   │   ├── FilterBy.ts
│   │   ├── FriendsDto.ts
│   │   ├── LoginData.ts
│   │   ├── LoginResponse.ts
│   │   ├── Pagination.ts
│   │   ├── RegisterData.ts
│   │   ├── SessionData.ts
│   │   ├── SortFilter.ts
│   │   ├── UserAssignedDto.ts
│   │   └── UserDto.ts
│   ├── router/                 # Vue Router configuration
│   │   └── index.ts
│   ├── services/               # API service layers
│   │   ├── AuthService.ts
│   │   ├── DocumentService.ts
│   │   ├── ExpenseService.ts
│   │   ├── ExtractService.ts
│   │   ├── FriendsService.ts
│   │   ├── NotificationService.ts
│   │   └── TextractNotificationService.ts
│   ├── stores/                 # Pinia state stores
│   │   ├── Auth/
│   │   │   └── index.ts
│   │   ├── Document/
│   │   │   └── index.ts
│   │   ├── Expense/
│   │   │   └── index.ts
│   │   ├── Extract/
│   │   │   └── index.ts
│   │   ├── Friends/
│   │   │   └── index.ts
│   │   └── Notifications/
│   │       └── index.ts
│   ├── views/                  # Page-level components
│   │   ├── HomeView.vue
│   │   ├── AboutView.vue
│   │   ├── LoginView.vue
│   │   ├── RegisterView.vue
│   │   ├── ExpenseCreateView.vue
│   │   ├── ExpenseListView.vue
│   │   ├── DocumentResultPageView.vue
│   │   ├── FriendsAddView.vue
│   │   ├── FriendsListView.vue
│   │   ├── SharedExpensesView.vue
│   │   └── NotificationsView.vue
│   ├── App.vue                 # Root component
│   └── main.ts                 # Application entry point
├── .eslintrc.cjs               # ESLint configuration
├── .gitignore                  # Git ignore rules
├── .prettierrc.json            # Prettier configuration
├── Dockerfile                  # Docker container configuration
├── nginx.conf                  # Nginx server configuration
├── package.json                # Project dependencies and scripts
├── tsconfig.json               # TypeScript configuration
├── tsconfig.app.json           # TypeScript app configuration
├── tsconfig.node.json          # TypeScript node configuration
├── vite.config.ts              # Vite build configuration
├── vue.config.ts               # Vue configuration
├── README.md                   # Project readme
└── env.d.ts                    # Type definitions for environment variables
```

---

## Features

### Authentication
- User registration with email and password
- User login with session management
- Automatic session validation
- Protected routes with authentication guards
- Cookie-based authentication

### Expense Management
- Create new expenses with metadata
- Upload receipt documents (images, PDFs)
- Edit and update existing expenses
- Delete expenses
- View expense details and history
- Assign users to shared expenses

### Document Processing
- Upload expense documents
- AWS Textract integration for receipt data extraction
- View extracted line items and totals
- Document result analysis
- Real-time processing notifications

### Friend Management
- Add friends by email
- View friend list
- Manage friend connections
- Share expenses with friends

### Shared Expenses
- View expenses shared by friends
- Track shared expense contributions
- Filter and sort shared expenses
- Pagination for large lists

### Notifications
- Real-time notifications via SignalR
- Document processing updates
- Expense sharing notifications
- Notification center view

### Data Features
- Advanced filtering (search by multiple fields)
- Sorting capabilities (ascending/descending)
- Pagination for large datasets
- Expense count tracking
- Dropdown selections for expense lists

---

## Installation & Setup

### Prerequisites
- Node.js (v20 or higher recommended)
- npm or yarn package manager
- Backend API running with appropriate endpoints
- AWS credentials configured (for Textract)

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/rnavdeep/expense-analyser.git
   cd expense-analyser
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   Create a `.env` file in the root directory:
   ```env
   VITE_APP_API_URL=http://localhost:5000/api
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```

5. **Build for production**
   ```bash
   npm run build
   ```

---

## Development Guide

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with hot-reload |
| `npm run build` | Type-check, compile and minify for production |
| `npm run build-only` | Build without type-checking |
| `npm run type-check` | Run TypeScript type checking |
| `npm run lint` | Run ESLint with auto-fix |
| `npm run format` | Format code with Prettier |
| `npm run preview` | Preview production build locally |

### Code Style & Quality

- **ESLint**: Configured for Vue 3 and TypeScript
- **Prettier**: Code formatting with 2-space indentation
- **TypeScript**: Strict type checking enabled
- **Vue TSC**: Type checking for `.vue` files

### Recommended IDE Setup

1. **Visual Studio Code** with:
   - [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) extension (Vue 3 support)
   - Disable Vetur if installed
   - ESLint extension
   - Prettier extension

2. **TypeScript Configuration**:
   - Type support for `.vue` imports is handled by Volar
   - `vue-tsc` is used for type checking instead of `tsc`

---

## Architecture

### Application Flow

```
User Interface (Vue Components)
         ↓
    Pinia Stores (State Management)
         ↓
    Services (API Layer)
         ↓
    Axios (HTTP Client)
         ↓
    Backend API
```

### Component Architecture

- **Views**: Page-level components representing routes
- **Components**: Reusable UI components
- **Stores**: Pinia stores for state management
- **Services**: API communication layer
- **Models**: TypeScript interfaces for type safety

### Design Patterns

1. **Service Layer Pattern**: API logic separated into service classes
2. **Repository Pattern**: Data access abstraction through services
3. **State Management**: Centralized state with Pinia
4. **Composition API**: Vue 3 Composition API for component logic
5. **Type Safety**: TypeScript throughout the application

---

## API Integration

### Base URL Configuration

API base URL is configured via environment variable:
```typescript
const BASE_URL = import.meta.env.VITE_APP_API_URL
```

### Authentication

All API requests include cookies for authentication:
```typescript
axios.get(API_URL, { withCredentials: true })
```

### API Endpoints

#### Authentication
- `POST /Auth/Register` - Register new user
- `POST /Auth/Login` - Login user
- `POST /Auth/Logout` - Logout user
- `GET /Auth/checkSession` - Validate session

#### Expenses
- `POST /Expense` - Create new expense
- `PUT /Expense/{id}` - Update expense
- `DELETE /Expense/{id}` - Delete expense
- `GET /Expense` - Get expenses with pagination, filtering, sorting
- `GET /Expense/count` - Get total expense count
- `GET /Expense/dropdown` - Get expense list for dropdown
- `GET /Expense/sharedExpenses` - Get shared expenses
- `POST /Expense/{expenseId}/uploadDoc` - Upload document
- `GET /Expense/docs/{expenseId}` - Get expense documents
- `GET /Expense/{expenseId}/doc/{docId}` - Get document results
- `POST /Expense/{expenseId}/addUser` - Add user to expense
- `GET /Expense/{expenseId}/getAssignedUsers` - Get assigned users

#### Friends
- `POST /Friends` - Add friend
- `GET /Friends` - Get friends list
- `DELETE /Friends/{id}` - Remove friend

#### Documents
- `POST /Document/upload` - Upload document
- `POST /Document/extract` - Extract data from document

#### Notifications
- SignalR hub for real-time notifications
- Document processing updates
- Expense sharing notifications

### Error Handling

All services implement consistent error handling:
```typescript
try {
  const response = await axios.get(API_URL, { withCredentials: true })
  return response.data
} catch (error) {
  if (axios.isAxiosError(error)) {
    throw new Error(error.response?.data?.message || 'Operation failed')
  }
  throw new Error('An unexpected error occurred')
}
```

---

## State Management

### Pinia Stores

#### Auth Store
- User authentication state
- Session management
- Login/logout actions
- Session validation

#### Document Store
- Document upload state
- Document processing status
- Document results storage

#### Expense Store
- Expense list management
- Current expense state
- Expense CRUD operations
- Filtering and sorting state

#### Extract Store
- Extraction process state
- Extracted data storage
- Processing status

#### Friends Store
- Friend list management
- Friend relationship state
- Friend operations

#### Notifications Store
- Notification list
- Unread count
- Notification actions

### Store Usage Example

```typescript
import { useAuthStore } from '@/stores/Auth'
import { useExpenseStore } from '@/stores/Expense'

const authStore = useAuthStore()
const expenseStore = useExpenseStore()

// Access state
const user = authStore.user
const expenses = expenseStore.expenses

// Call actions
await authStore.login(email, password)
await expenseStore.fetchExpenses()
```

---

## Routing

### Route Configuration

Routes are configured in `src/router/index.ts` with authentication guards:

| Path | Name | Component | Auth Required |
|------|------|-----------|---------------|
| `/` | home | HomeView | No |
| `/about` | about | AboutView | Yes |
| `/register` | register | RegisterView | Guest only |
| `/login` | Login | LoginView | No |
| `/newExpense` | ExpenseCreate | ExpenseCreateView | Yes |
| `/myExpenses` | ExpenseList | ExpenseListView | Yes |
| `/sharedExpenses` | SharedExpenses | SharedExpensesView | Yes |
| `/docResults` | Results | DocumentResultPageView | Yes |
| `/notifications` | Notifications | NotificationsView | Yes |
| `/addFriend` | Add Friend | FriendsView | Yes |
| `/friends` | Friends | FriendsListView | Yes |

### Route Guards

```typescript
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  await authStore.checkSession()
  
  if (to.matched.some((record) => record.meta.requiresLogin)) {
    if (!authStore.isAuthenticated) {
      next({ name: 'Login' })
    } else {
      next()
    }
  } else if (to.meta.requiresGuest && authStore.isAuthenticated) {
    next({ name: 'home' })
  } else {
    next()
  }
})
```

---

## Components

### Core Components

#### Navbar.vue
- Application navigation bar
- User menu and logout
- Links to main sections

#### NavigationDrawer.vue
- Side navigation drawer
- Mobile-friendly navigation
- Quick access to features

#### Login.vue
- User login form
- Email and password fields
- Login validation

#### Register.vue
- User registration form
- Account creation
- Registration validation

#### Home.vue
- Landing page component
- Welcome message
- Quick action buttons

#### ExpenseCreate.vue
- Create new expense form
- Document upload
- Expense details input

#### ExpenseList.vue
- Display expense list
- Pagination controls
- Filter and sort options

#### ExpenseCard.vue
- Individual expense display
- Expense details preview
- Action buttons (edit, delete, share)

#### DocumentUpload.vue
- File upload component
- Drag and drop support
- Multiple file types

#### DocumentResultPage.vue
- Display document extraction results
- Line items table
- Total amounts

#### FriendsAdd.vue
- Add friend form
- Email input
- Friend request handling

#### FriendsList.vue
- Display friends list
- Friend management
- Friend status

#### SharedExpenses.vue
- Display shared expenses
- Expense contributions
- Shared expense details

#### Notifications.vue
- Notification center
- Notification list
- Mark as read functionality

---

## Services

### AuthService.ts
Handles user authentication operations:
- User registration
- User login
- User logout
- Session validation

### ExpenseService.ts
Manages expense operations:
- Create, update, delete expenses
- Fetch expenses with pagination
- Upload expense documents
- Manage shared expenses
- Assign users to expenses

### DocumentService.ts
Handles document operations:
- Document upload
- Document retrieval
- Document management

### ExtractService.ts
Manages data extraction:
- Initiate extraction process
- Get extraction status
- Retrieve extraction results

### FriendsService.ts
Manages friend relationships:
- Add friends
- Get friends list
- Remove friends
- Manage friend requests

### NotificationService.ts
Handles notification operations:
- Fetch notifications
- Mark as read
- Notification count

### TextractNotificationService.ts
Manages real-time notifications:
- SignalR connection management
- Document processing updates
- Real-time event handling

---

## Models

### DocumentDialogDto.ts
```typescript
interface DocumentDialogDto {
  id: string
  name: string
  url: string
  uploadedAt: Date
  // ... additional fields
}
```

### ExpenseCreateForm.ts
```typescript
interface ExpenseDataDto {
  title: string
  amount: number
  date: Date
  // ... additional fields
}

interface UpdateExpenseDto {
  id: string
  title?: string
  amount?: number
  // ... additional fields
}
```

### ExpenseDto.ts
```typescript
interface ExpenseDto {
  id: string
  title: string
  amount: number
  date: Date
  userId: string
  // ... additional fields
}
```

### FilterBy.ts
```typescript
interface FilterBy {
  propertyName: string
  type: string
  value: string
}
```

### Pagination.ts
```typescript
interface Pagination {
  pageNumber: number
  pageSize: number
}
```

### SortFilter.ts
```typescript
interface SortFilter {
  propertyName: string
  ascending: boolean
}
```

### FriendsDto.ts
```typescript
interface FriendsDto {
  id: string
  email: string
  status: string
  // ... additional fields
}
```

### LoginData.ts & LoginResponse.ts
```typescript
interface LoginData {
  email: string
  password: string
}

interface LoginResponse {
  token: string
  user: UserDto
}
```

### RegisterData.ts
```typescript
interface RegisterData {
  email: string
  password: string
  confirmPassword: string
  // ... additional fields
}
```

### SessionData.ts
```typescript
interface SessionData {
  isAuthenticated: boolean
  user: UserDto | null
  expiresAt: Date
}
```

### UserAssignedDto.ts
```typescript
interface UserAssignedDto {
  userId: string
  expenseId: string
  assignedAt: Date
  // ... additional fields
}
```

### UserDto.ts
```typescript
interface UserDto {
  id: string
  email: string
  username: string
  // ... additional fields
}
```

---

## Deployment

### Docker Deployment

The project includes a Dockerfile for containerization:

```dockerfile
FROM node:20-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Build and Run with Docker

1. **Build Docker image**
   ```bash
   docker build -t expense-analyser .
   ```

2. **Run container**
   ```bash
   docker run -p 8080:80 expense-analyser
   ```

### Nginx Configuration

The `nginx.conf` file configures:
- Static file serving
- SPA routing support
- Gzip compression
- Security headers

### Production Build

1. **Set environment variables**
   ```bash
   export VITE_APP_API_URL=https://api.yourdomain.com
   ```

2. **Build the application**
   ```bash
   npm run build
   ```

3. **Deploy the dist folder** to your web server

### CI/CD Considerations

- Automated testing before deployment
- Environment-specific configurations
- Docker image versioning
- Rollback strategies
- Monitoring and logging

---

## Environment Variables

### Required Variables

Create a `.env` file in the project root:

```env
# API Configuration
VITE_APP_API_URL=http://localhost:5000/api

# Optional: Additional configuration
VITE_APP_TITLE=Expense Analyser
VITE_APP_VERSION=1.0.0
```

### Environment-Specific Files

- `.env` - Default environment variables
- `.env.development` - Development environment
- `.env.production` - Production environment

### Accessing Variables

```typescript
const apiUrl = import.meta.env.VITE_APP_API_URL
```

### Best Practices

1. Never commit `.env` files to version control
2. Use `.env.example` as a template
3. Prefix all variables with `VITE_` for Vite to expose them
4. Validate environment variables on application start
5. Provide sensible defaults where possible

---

## Additional Resources

### Documentation
- [Vue 3 Documentation](https://vuejs.org/)
- [Vuetify Documentation](https://vuetifyjs.com/)
- [Pinia Documentation](https://pinia.vuejs.org/)
- [Vue Router Documentation](https://router.vuejs.org/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [Vite Documentation](https://vitejs.dev/)

### Tools & Libraries
- [Axios Documentation](https://axios-http.com/)
- [SignalR Documentation](https://learn.microsoft.com/en-us/aspnet/core/signalr/)
- [ESLint Documentation](https://eslint.org/)
- [Prettier Documentation](https://prettier.io/)

---

## Contributing

### Code Style
- Follow existing code style and patterns
- Use TypeScript for all new code
- Write meaningful commit messages
- Add comments for complex logic
- Keep components focused and reusable

### Testing
- Write unit tests for services and stores
- Test components with Vue Test Utils
- Ensure TypeScript types are correct
- Test responsive design

### Git Workflow
1. Create a feature branch
2. Make your changes
3. Run linting and formatting
4. Commit with descriptive messages
5. Push and create pull request

---

## License

This project is private and proprietary.

---

## Support

For issues, questions, or contributions, please contact the development team or create an issue in the repository.

---

**Last Updated**: January 2026
**Version**: 0.0.0
**Maintainer**: Development Team