# TypeScript to JavaScript Migration Guide

This guide will help you complete the conversion of the FeedMind frontend from TypeScript to JavaScript.

## 📋 Table of Contents

1. [Overview](#overview)
2. [Automated Conversion](#automated-conversion)
3. [Manual Conversion Steps](#manual-conversion-steps)
4. [Common Patterns](#common-patterns)
5. [API Integration Updates](#api-integration-updates)
6. [Testing](#testing)

## Overview

The backend has been fully converted to Express.js with JavaScript. The frontend structure is set up, but components need to be converted from TypeScript (.ts, .tsx) to JavaScript (.js, .jsx).

## Automated Conversion

### Using a Script

You can use this Node.js script to bulk convert files:

```javascript
// convert-to-js.js
import { readdir, readFile, writeFile, rename } from 'fs/promises';
import { join, extname } from 'path';

async function convertFile(filePath) {
  let content = await readFile(filePath, 'utf-8');
  
  // Remove type annotations
  content = content.replace(/: (string|number|boolean|any|void|null|unknown)(\[\])?/g, '');
  content = content.replace(/<([A-Z][a-zA-Z0-9<>, |]*?)>/g, '');
  content = content.replace(/interface \w+ \{[^}]*\}/gs, '');
  content = content.replace(/type \w+ = [^;]+;/g, '');
  content = content.replace(/import type \{[^}]+\} from [^;]+;/g, '');
  content = content.replace(/as (string|number|boolean|any|unknown)/g, '');
  
  // Update imports
  content = content.replace(/from ["'](.*)\.ts(x)?["']/g, 'from "$1.js$2"');
  content = content.replace(/\.tsx/g, '.jsx');
  
  // Write back
  await writeFile(filePath, content, 'utf-8');
  
  // Rename file
  const newPath = filePath.replace(/\.ts(x)?$/, '.js$1');
  if (newPath !== filePath) {
    await rename(filePath, newPath);
  }
}

// Usage: node convert-to-js.js
// Converts files in current directory
```

## Manual Conversion Steps

### 1. Component Conversion Pattern

**Before (TypeScript):**
```typescript
import { useState } from "react";

interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: "primary" | "secondary";
}

export function Button({ label, onClick, variant = "primary" }: ButtonProps) {
  const [count, setCount] = useState<number>(0);
  
  return (
    <button onClick={() => {
      setCount(c => c + 1);
      onClick();
    }}>
      {label} ({count})
    </button>
  );
}
```

**After (JavaScript):**
```javascript
import { useState } from "react";

export function Button({ label, onClick, variant = "primary" }) {
  const [count, setCount] = useState(0);
  
  return (
    <button onClick={() => {
      setCount(c => c + 1);
      onClick();
    }}>
      {label} ({count})
    </button>
  );
}
```

### 2. Library Conversion

**Before:**
```typescript
import { prisma } from "@/lib/prisma";
import type { Form } from "@prisma/client";

export async function getForms(userId: string): Promise<Form[]> {
  return await prisma.form.findMany({
    where: { userId }
  });
}
```

**After:**
```javascript
import { prisma } from "@/lib/prisma.js";

export async function getForms(userId) {
  return await prisma.form.findMany({
    where: { userId }
  });
}
```

### 3. Remove Type-Only Imports

**Before:**
```typescript
import type { NextPage } from "next";
import type { User } from "@/types/user";
```

**After:**
```javascript
// Remove entirely - no runtime value
```

### 4. Update React Component Props

**Before:**
```typescript
import { FC, ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
  title: string;
}

const Layout: FC<LayoutProps> = ({ children, title }) => {
  return <div><h1>{title}</h1>{children}</div>;
};
```

**After:**
```javascript
const Layout = ({ children, title }) => {
  return <div><h1>{title}</h1>{children}</div>;
};
```

## Common Patterns

### Remove Type Annotations

```typescript
// Before
const name: string = "John";
const age: number = 25;
const items: string[] = ["a", "b"];
const user: User = { name: "John" };

// After
const name = "John";
const age = 25;
const items = ["a", "b"];
const user = { name: "John" };
```

### Remove Generic Types

```typescript
// Before
useState<string>("");
useState<number>(0);
useState<User | null>(null);
const data = await fetch<FormData>(url);

// After
useState("");
useState(0);
useState(null);
const data = await fetch(url);
```

### Remove Enums

```typescript
// Before
enum QuestionType {
  SHORT_TEXT = "SHORT_TEXT",
  LONG_TEXT = "LONG_TEXT"
}

// After
const QuestionType = {
  SHORT_TEXT: "SHORT_TEXT",
  LONG_TEXT: "LONG_TEXT"
};
```

### Remove Interfaces and Types

```typescript
// Before
interface User {
  id: string;
  name: string;
  email: string;
}

type FormStatus = "draft" | "published";

// After
// Remove entirely. Use JSDoc if you need documentation:
/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} name
 * @property {string} email
 */
```

## API Integration Updates

### Old (Next.js API Routes)

```typescript
// Before: pages/api/forms/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  const forms = await prisma.form.findMany();
  return NextResponse.json(forms);
}
```

### New (External API Calls)

```javascript
// After: lib/api/forms.js
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getForms(token) {
  const response = await fetch(`${API_URL}/api/forms`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch forms');
  }
  
  return await response.json();
}

export async function createForm(formData, token) {
  const response = await fetch(`${API_URL}/api/forms`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(formData)
  });
  
  if (!response.ok) {
    throw new Error('Failed to create form');
  }
  
  return await response.json();
}
```

### Using in Components

```javascript
// components/FormList.jsx
import { useState, useEffect } from 'react';
import { getForms } from '@/lib/api/forms.js';
import { useAuth } from '@/lib/hooks/useAuth.js';

export function FormList() {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    async function loadForms() {
      try {
        const data = await getForms(token);
        setForms(data);
      } catch (error) {
        console.error('Failed to load forms:', error);
      } finally {
        setLoading(false);
      }
    }

    if (token) {
      loadForms();
    }
  }, [token]);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {forms.map(form => (
        <div key={form.id}>{form.title}</div>
      ))}
    </div>
  );
}
```

## File Organization

### Move Files to Frontend Directory

1. Copy all components from `components/` to `frontend/components/`
2. Copy `app/` directory to `frontend/app/`
3. Copy `lib/` utilities to `frontend/lib/`
4. Update all imports to use `.js` or `.jsx` extensions

### Update Import Paths

```javascript
// Before
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";

// After (in frontend/)
import { Button } from "@/components/ui/button.jsx";
import { api } from "@/lib/api.js";  // No more direct Prisma access
```

## Authentication Updates

### Create Auth Context

```javascript
// frontend/lib/contexts/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load token from localStorage
    const storedToken = localStorage.getItem('auth_token');
    if (storedToken) {
      setToken(storedToken);
      fetchUser(storedToken);
    } else {
      setLoading(false);
    }
  }, []);

  async function fetchUser(authToken) {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/session`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
    } finally {
      setLoading(false);
    }
  }

  async function login(email) {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    const data = await response.json();
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('auth_token', data.token);
  }

  function logout() {
    setToken(null);
    setUser(null);
    localStorage.removeItem('auth_token');
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
```

### Use Auth in Components

```javascript
// components/LoginForm.jsx
import { useState } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext.jsx';
import { useRouter } from 'next/navigation';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const { login } = useAuth();
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await login(email);
      router.push('/dashboard');
    } catch (error) {
      alert('Login failed');
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <button type="submit">Login</button>
    </form>
  );
}
```

## Testing

### 1. Start Backend

```bash
cd backend
npm install
npm run dev
```

### 2. Start Frontend

```bash
cd frontend
npm install
npm run dev
```

### 3. Test API Endpoints

Use the browser console or Postman to test:

```javascript
// Test login
const response = await fetch('http://localhost:3001/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'test@example.com' })
});
const data = await response.json();
console.log(data);

// Test protected endpoint
const formsResponse = await fetch('http://localhost:3001/api/forms', {
  headers: {
    'Authorization': `Bearer ${data.token}`
  }
});
const forms = await formsResponse.json();
console.log(forms);
```

## Checklist

- [ ] Backend running on port 3001
- [ ] Frontend running on port 3000
- [ ] Database connected
- [ ] Environment variables set
- [ ] All `.ts` files converted to `.js`
- [ ] All `.tsx` files converted to `.jsx`
- [ ] Type annotations removed
- [ ] Interfaces/types removed
- [ ] API calls updated to use backend URL
- [ ] Authentication working
- [ ] CORS configured properly

## Common Issues

### Issue: Module not found errors

**Solution:** Update imports to include `.js` or `.jsx` extensions

```javascript
// Wrong
import { Button } from "./button";

// Correct
import { Button } from "./button.jsx";
```

### Issue: CORS errors

**Solution:** Ensure backend CORS is configured to allow frontend origin

```javascript
// backend/server.js
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
```

### Issue: Type errors in editor

**Solution:** Use JSDoc for type hints without TypeScript

```javascript
/**
 * @param {string} userId
 * @param {Object} formData
 * @returns {Promise<Object>}
 */
async function createForm(userId, formData) {
  // ...
}
```

## Next Steps

1. Convert all files in `app/` directory
2. Convert all files in `components/` directory
3. Convert all files in `lib/` directory
4. Update all API calls
5. Test each page
6. Fix any runtime errors
7. Update documentation

## Resources

- [Express.js Documentation](https://expressjs.com/)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [JWT Authentication](https://jwt.io/)
- [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)

---

**Need Help?** Open an issue or check existing frontend examples in the `frontend/` directory.
