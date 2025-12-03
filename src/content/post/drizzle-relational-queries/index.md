---
title: "Relational queries in Drizzle ORM"
description: "A highly addictive goodie to fetch deeply nested entities that's as easy as spreading butter on a toast."
publishDate: "2025-12-03T09:13:51+05:30"
tags: ["drizzle-orm", "postgres", "typescript", "nodejs", "database"]
---

Imagine a nested interface like this:

```typescript
interface User {
  id: number;
  name: string;
  posts: Post[];
}

interface Post {
  id: number;
  title: string;
  comments: Comment[];
}

interface Comment {
  id: number;
  content: string;
}
```

Querying a relational database like PostgreSQL to fetch a user along with their posts and comments will typically involve multiple joins or subqueries. On one hand joins can get complex and hard to manage, especially with deeply nested relationships. On the other hand, multiple queries can lead to performance issues due to the "N+1 query problem".

Drizzle allows you to define explicit relationships between your tables like so:

```typescript
import { relations } from 'drizzle-orm';
import { pgTable, serial, text, integer } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: text('name'),
});

export const posts = pgTable('posts', {
  id: serial('id').primaryKey(),
  title: text('title'),
  userId: integer('user_id').references(() => users.id),
});

export const comments = pgTable('comments', {
  id: serial('id').primaryKey(),
  content: text('content'),
  postId: integer('post_id').references(() => posts.id),
});

export const userRelations = relations(users, ({ many }) => ({
  posts: many(posts),
}));

export const postRelations = relations(posts, ({ many }) => ({
  comments: many(comments),
}));
```

With these relationships defined, you can now perform relational queries in a straightforward manner. For example, to fetch a user along with their posts and comments, you can do the following:

```typescript
import { db } from './db'; // Assume db is your Drizzle database instance
import { users, userRelations, posts, postRelations } from './schema'; 
import { eq } from 'drizzle-orm';

const userId = 1; // Example user ID
const userWithPostsAndComments = await db
  .query.users.findFirst({
    where: eq(users.id, userId),
    with: {
      posts: {
        with: {
          comments: true,
        },
      },
    },
  });
console.log(userWithPostsAndComments); // Outputs the user with their posts and comments
```

That's one ace up your sleeve. But use it with caution. Internally, Drizzle translates these relational queries into joins and subqueries, which can lead to performance issues if not used judiciously. Always analyze the generated SQL and ensure it meets your performance requirements.

---

Until next time,  
Cheers ✌️